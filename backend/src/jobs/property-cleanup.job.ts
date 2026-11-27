
import cron from "node-cron";

import { processPendingMediaCleanup } from "../modules/media/media-asset-cleanup.service.js";

import { runVerificationDocumentCleanupBatch } from "../workers/verification-document-cleanup.worker.js";
import { runPropertyPurgeBatch } from "../workers/property-purge.worker.js";
import { runHistoricalRecordRetentionBatch } from "../workers/historical-record-retention.worker.js";
import { cleanupExpiredVerificationAuditLogs } from "../workers/verification-audit-retention.worker.js";

const scheduledTasks: ReturnType<typeof cron.schedule>[] = [];

const runningJobs = new Set<Promise<void>>();
const activeJobNames = new Set<string>();

async function runTrackedJob(
  name: string,
  job: () => Promise<unknown>,
): Promise<void> {
  // Prevent overlapping executions of the same job.
  if (activeJobNames.has(name)) {
    console.log(
      `[${name}] Previous execution is still running. Skipping this execution.`,
    );
    return;
  }

  activeJobNames.add(name);

  const execution = (async () => {
    try {
      await job();
    } catch (error) {
      console.error(`[${name}] Job failed:`, error);
    } finally {
      activeJobNames.delete(name);
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
  // Prevent duplicate scheduler initialization.
  if (scheduledTasks.length > 0) {
    console.log("[Jobs] Cleanup jobs are already running.");
    return;
  }

  // 1. Permanently purge eligible properties daily at 02:00 UTC.
  const propertyPurgeTask = cron.schedule(
    "0 2 * * *",
    () =>
      void runTrackedJob("Property Purge", async () => {
        console.log("[Property Purge] Starting property purge...");

        const result = await runPropertyPurgeBatch();

        console.log("[Property Purge] Completed:", result);
      }),
    {
      timezone: "UTC",
    },
  );

  // 2. Process pending property media deletions every minute.
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

  // 3. Process verification document deletions every minute.
  const verificationDocumentTask = cron.schedule(
    "* * * * *",
    () =>
      void runTrackedJob("Verification Document Cleanup", async () => {
        const result = await runVerificationDocumentCleanupBatch();

        if (result.claimedCount > 0) {
          console.log(
            "[Verification Document Cleanup] Completed:",
            result,
          );
        }
      }),
    {
      timezone: "UTC",
    },
  );

  // 4. Remove expired historical inquiries and reports daily at 03:00 UTC.
  const historicalRetentionTask = cron.schedule(
    "0 3 * * *",
    () =>
      void runTrackedJob("Historical Record Retention", async () => {
        const result = await runHistoricalRecordRetentionBatch();

        if (
          result.deletedInquiriesCount > 0 ||
          result.deletedReportsCount > 0
        ) {
          console.log(
            "[Historical Record Retention] Completed:",
            result,
          );
        }
      }),
    {
      timezone: "UTC",
    },
  );

  // 5. Remove expired verification audit logs daily at 03:30 UTC.
  const verificationAuditTask = cron.schedule(
    "30 3 * * *",
    () =>
      void runTrackedJob("Verification Audit Retention", async () => {
        const result = await cleanupExpiredVerificationAuditLogs();

        if (result.deleted > 0) {
          console.log(
            "[Verification Audit Retention] Completed:",
            result,
          );
        }
      }),
    {
      timezone: "UTC",
    },
  );

  scheduledTasks.push(
    propertyPurgeTask,
    mediaCleanupTask,
    verificationDocumentTask,
    historicalRetentionTask,
    verificationAuditTask,
  );

  console.log("[Jobs] All cleanup jobs scheduled successfully.");
}

export async function stopPropertyCleanupJobs(): Promise<void> {
  // Stop future scheduled executions.
  await Promise.all(
    scheduledTasks.map((task) => task.stop()),
  );

  scheduledTasks.length = 0;

  // Wait for already-running executions to finish.
  await Promise.all([...runningJobs]);

  console.log("[Jobs] All cleanup jobs stopped.");
}
