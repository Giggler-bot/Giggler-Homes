
import cron from "node-cron";

import { purgeExpiredProperties } from "../modules/properties/property-cleanup.service.js";
import { processPendingMediaCleanup } from "../modules/media/media-asset-cleanup.service.js";

const scheduledTasks: ReturnType<typeof cron.schedule>[] = [];
const runningJobs = new Set<Promise<void>>();

async function runTrackedJob(
  name: string,
  job: () => Promise<unknown>,
): Promise<void> {
  const execution = (async () => {
    try {
      await job();
    } catch (error) {
      console.error(`[${name}] Job failed:`, error);
    }
  })();

  runningJobs.add(execution);

  try {
    await execution;
  } finally {
    runningJobs.delete(execution);
  }
}

export function startPropertyCleanupJobs(): void {
  // Prevent accidentally scheduling duplicate jobs.
  if (scheduledTasks.length > 0) return;

  // Permanently purge eligible properties every day at 02:00 UTC.
  const propertyCleanupTask = cron.schedule(
    "0 2 * * *",
    () =>
      void runTrackedJob("Property Cleanup", async () => {
        console.log("[Property Cleanup] Starting daily purge...");

        const result = await purgeExpiredProperties();

        console.log("[Property Cleanup] Completed:", result);
      }),
    {
      timezone: "UTC",
    },
  );

  // Process pending Cloudinary deletions every minute.
  const mediaCleanupTask = cron.schedule(
    "* * * * *",
    () =>
      void runTrackedJob("Media Cleanup", async () => {
        const result = await processPendingMediaCleanup();

        if (result.claimedCount > 0) {
          console.log("[Media Cleanup] Completed:", result);
        }
      }),
    {
      timezone: "UTC",
    },
  );

  scheduledTasks.push(propertyCleanupTask, mediaCleanupTask);

  console.log("[Jobs] Property cleanup jobs scheduled.");
}

export async function stopPropertyCleanupJobs(): Promise<void> {
  // Stop future scheduled executions.
  await Promise.all(scheduledTasks.map((task) => task.stop()));

  scheduledTasks.length = 0;

  // Wait for jobs that were already running to finish.
  await Promise.all([...runningJobs]);

  console.log("[Jobs] Property cleanup jobs stopped.");
}
