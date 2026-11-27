
import { prisma } from "../lib/prisma.js";
import { deleteMediaAsset } from "../services/cloudinary.service.js";

const MAX_ATTEMPTS = 10;
const BATCH_SIZE = 20;
const LEASE_DURATION_MS = 5 * 60 * 1000;
const MAX_RETRY_DELAY_MS = 24 * 60 * 60 * 1000;

type MediaCleanupJob = {
  id: string;
  publicId: string;
  resourceType: "IMAGE" | "VIDEO";
  attempts: number;
};

export const runMediaAssetCleanupBatch = async () => {
  const now = new Date();

  const leaseExpiredAt = new Date(
    now.getTime() - LEASE_DURATION_MS,
  );

  // 1. Claim eligible jobs safely.
  const jobs = await prisma.$transaction(async (tx) => {
    return tx.$queryRaw<MediaCleanupJob[]>`
      WITH candidates AS (
        SELECT "id"
        FROM "MediaAssetCleanup"
        WHERE
          "processedAt" IS NULL
          AND "nextAttemptAt" <= ${now}
          AND "attempts" < ${MAX_ATTEMPTS}
          AND (
            "lockedAt" IS NULL
            OR "lockedAt" <= ${leaseExpiredAt}
          )
        ORDER BY "createdAt" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT ${BATCH_SIZE}
      )
      UPDATE "MediaAssetCleanup" AS cleanup
      SET "lockedAt" = ${now}
      FROM candidates
      WHERE cleanup."id" = candidates."id"
      RETURNING
        cleanup."id",
        cleanup."publicId",
        cleanup."resourceType",
        cleanup."attempts"
    `;
  });

  let processedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  // 2. Process each claimed asset outside the transaction.
  for (const job of jobs) {
    try {
      const resourceType =
        job.resourceType.toLowerCase() as "image" | "video";

      await deleteMediaAsset(job.publicId, resourceType);

      // 3. Mark successful cleanup.
      const updated = await prisma.mediaAssetCleanup.updateMany({
        where: {
          id: job.id,
          lockedAt: now,
          processedAt: null,
        },
        data: {
          processedAt: new Date(),
          lockedAt: null,
          lastError: null,
        },
      });

      if (updated.count === 1) {
        processedCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      // 4. Calculate the next retry attempt.
      const nextAttempt = job.attempts + 1;

      const retryDelay = Math.min(
        60_000 * 2 ** (nextAttempt - 1),
        MAX_RETRY_DELAY_MS,
      );

      const nextAttemptAt = new Date(
        Date.now() + retryDelay,
      );

      const errorMessage =
        error instanceof Error
          ? error.message.slice(0, 2000)
          : "Unknown Cloudinary deletion error";

      // 5. Record failure and schedule retry.
      const updated = await prisma.mediaAssetCleanup.updateMany({
        where: {
          id: job.id,
          lockedAt: now,
          processedAt: null,
        },
        data: {
          attempts: nextAttempt,
          lastError: errorMessage,
          nextAttemptAt,
          lockedAt: null,
        },
      });

      if (updated.count === 1) {
        failedCount++;
      } else {
        skippedCount++;
      }
    }
  }

  return {
    claimedCount: jobs.length,
    processedCount,
    failedCount,
    skippedCount,
  };
};
