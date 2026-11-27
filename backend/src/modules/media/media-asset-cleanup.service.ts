import { prisma } from "../../lib/prisma.js";
import { deleteMediaAsset } from "../../services/cloudinary.service.js";

const BATCH_SIZE = 5;
const MAX_ATTEMPTS = 10;
const LOCK_TIMEOUT_MINUTES = 15;
const MAX_RETRY_DELAY_MS = 24 * 60 * 60 * 1000;

type CleanupAsset = {
  id: string;
  publicId: string;
  resourceType: "IMAGE" | "VIDEO";
  attempts: number;
  lockedAt: Date;
};

function getRetryDelay(attempt: number): number {
  const maxExponent = Math.ceil(
    Math.log2(MAX_RETRY_DELAY_MS / 60_000),
  );

  const exponent = Math.min(
    Math.max(attempt - 1, 0),
    maxExponent,
  );

  const delay = 60_000 * Math.pow(2, exponent);

  return Math.min(delay, MAX_RETRY_DELAY_MS);
}

async function claimPendingAssets(): Promise<CleanupAsset[]> {
  return prisma.$queryRaw<CleanupAsset[]>`
    WITH pending AS (
      SELECT "id"
      FROM "MediaAssetCleanup"
      WHERE
        "processedAt" IS NULL
        AND "nextAttemptAt" <= NOW()
        AND "attempts" < ${MAX_ATTEMPTS}
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
      cleanup."attempts",
      cleanup."lockedAt"
  `;
}

export async function processPendingMediaCleanup() {
  const assets = await claimPendingAssets();

  let processedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (const asset of assets) {
    try {
      await deleteMediaAsset(
        asset.publicId,
        asset.resourceType === "VIDEO" ? "video" : "image",
      );
    } catch (error) {
      const nextAttempt = asset.attempts + 1;
      const retryDelay = getRetryDelay(nextAttempt);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown Cloudinary deletion error";

      try {
        const updated = await prisma.mediaAssetCleanup.updateMany({
          where: {
            id: asset.id,
            lockedAt: asset.lockedAt,
            processedAt: null,
          },
          data: {
            attempts: nextAttempt,
            lockedAt: null,
            lastError: errorMessage.slice(0, 2000),
            nextAttemptAt: new Date(Date.now() + retryDelay),
          },
        });

        if (updated.count === 1) {
          failedCount++;

          console.error(
            `Cloudinary cleanup failed for ${asset.publicId}`,
            error,
          );
        } else {
          skippedCount++;
        }
      } catch (databaseError) {
        console.error(
          `Failed to record cleanup retry for ${asset.publicId}. The asset will become eligible for reclamation after its lock expires.`,
          databaseError,
        );
      }

      continue;
    }

    try {
      const updated = await prisma.mediaAssetCleanup.updateMany({
        where: {
          id: asset.id,
          lockedAt: asset.lockedAt,
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
      console.error(
        `Cloudinary deletion succeeded, but cleanup status update failed for ${asset.publicId}. The asset may be reclaimed after its lock expires.`,
        error,
      );
    }
  }

  return {
    claimedCount: assets.length,
    processedCount,
    failedCount,
    skippedCount,
  };
}
