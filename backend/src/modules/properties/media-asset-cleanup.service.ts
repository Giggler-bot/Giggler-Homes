
import { prisma } from "../../lib/prisma.js";
import { deleteMediaAsset } from "../../services/cloudinary.service.js";

const BATCH_SIZE = 50;
const LOCK_TIMEOUT_MINUTES = 15;
const MAX_RETRY_DELAY_MS = 24 * 60 * 60 * 1000;

type CleanupAsset = {
  id: string;
  publicId: string;
  resourceType: "IMAGE" | "VIDEO";
  attempts: number;
};

function getRetryDelay(attempt: number) {
  const delay = 60_000 * Math.pow(2, Math.min(attempt - 1, 10));

  return Math.min(delay, MAX_RETRY_DELAY_MS);
}


async function claimPendingAssets(): Promise<CleanupAsset[]> {
  return prisma.$queryRaw<CleanupAsset[]>`
    WITH pending AS (
      SELECT "id"
      FROM "MediaAssetCleanup"
      WHERE "processedAt" IS NULL
        AND "nextAttemptAt" <= NOW()
        AND (
          "lockedAt" IS NULL
          OR "lockedAt" < NOW() -
            (${LOCK_TIMEOUT_MINUTES} * INTERVAL '1 minute')
        )
      ORDER BY "createdAt" ASC
      LIMIT ${BATCH_SIZE}
      FOR UPDATE SKIP LOCKED
    )
    UPDATE "MediaAssetCleanup" AS cleanup
    SET "lockedAt" = NOW()
    FROM pending
    WHERE cleanup."id" = pending."id"
    RETURNING
      cleanup."id",
      cleanup."publicId",
      cleanup."resourceType",
      cleanup."attempts"
  `;
}


export async function processPendingMediaCleanup() {
  const assets = await claimPendingAssets();

  let processedCount = 0;
  let failedCount = 0;

  for (const asset of assets) {
    try {
      await deleteMediaAsset(
        asset.publicId,
        asset.resourceType === "VIDEO" ? "video" : "image",
      );

      await prisma.mediaAssetCleanup.update({
        where: {
          id: asset.id,
        },
        data: {
          processedAt: new Date(),
          lockedAt: null,
          lastError: null,
        },
      });

      processedCount++;
    } catch (error) {
      const nextAttempt = asset.attempts + 1;

      const retryDelay = getRetryDelay(nextAttempt);

      const nextAttemptAt = new Date(
        Date.now() + retryDelay,
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown Cloudinary deletion error";

      await prisma.mediaAssetCleanup.update({
        where: {
          id: asset.id,
        },
        data: {
          attempts: {
            increment: 1,
          },
          lockedAt: null,
          lastError: errorMessage.slice(0, 1000),
          nextAttemptAt,
        },
      });

      failedCount++;

      console.error(
        `Cloudinary cleanup failed for ${asset.publicId}`,
        error,
      );
    }
  }

  return {
    claimedCount: assets.length,
    processedCount,
    failedCount,
  };
}
