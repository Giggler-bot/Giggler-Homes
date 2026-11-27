
import { prisma } from "../lib/prisma.js";
import { AppError } from "../common/errors/AppError.js";
import { purgeProperty } from "../services/property-purge.service.js";

const BATCH_SIZE = 10;

export const runPropertyPurgeBatch = async () => {
  const now = new Date();

  // 1. Find properties eligible for permanent deletion.
  const candidates = await prisma.property.findMany({
    where: {
      deletedAt: {
        not: null,
      },
      permanentDeletionAt: {
        lte: now,
      },
    },
    select: {
      id: true,
    },
    orderBy: {
      permanentDeletionAt: "asc",
    },
    take: BATCH_SIZE,
  });

  let purgedCount = 0;
  let blockedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  // 2. Process each property independently.
  for (const property of candidates) {
    try {
      await purgeProperty(property.id);
      purgedCount++;
    } catch (error) {
      if (error instanceof AppError) {
        if (error.statusCode === 409) {
          // Ownership holds or unresolved reports.
          blockedCount++;
          continue;
        }

        if (error.statusCode === 404) {
          // Another worker may already have purged it.
          skippedCount++;
          continue;
        }
      }

      // Unexpected errors are counted for operational monitoring.
      failedCount++;
    }
  }

  return {
    candidatesCount: candidates.length,
    purgedCount,
    blockedCount,
    skippedCount,
    failedCount,
  };
};
