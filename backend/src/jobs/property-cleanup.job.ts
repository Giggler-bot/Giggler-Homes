
import cron from "node-cron";

import { purgeExpiredProperties } from "../modules/properties/property-cleanup.service.js";

import { processPendingMediaCleanup } from "../modules/properties/media-asset-cleanup.service.js";

export function startPropertyCleanupJobs() {
  // Permanently purge eligible properties every day at 02:00 UTC.
  cron.schedule(
    "0 2 * * *",
    async () => {
      try {
        console.log("[Property Cleanup] Starting daily purge...");

        const result = await purgeExpiredProperties();

        console.log("[Property Cleanup] Completed:", result);
      } catch (error) {
        console.error("[Property Cleanup] Job failed:", error);
      }
    },
    {
      timezone: "UTC",
    },
  );

  // Process pending Cloudinary deletions every minute.
  cron.schedule(
    "* * * * *",
    async () => {
      try {
        const result = await processPendingMediaCleanup();

        if (result.claimedCount > 0) {
          console.log("[Media Cleanup] Completed:", result);
        }
      } catch (error) {
        console.error("[Media Cleanup] Job failed:", error);
      }
    },
    {
      timezone: "UTC",
    },
  );

  console.log("[Jobs] Property cleanup jobs scheduled.");
}
