
import { prisma } from "../lib/prisma.js";

const BATCH_SIZE = 100;

export const runHistoricalRecordRetentionBatch = async () => {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    // 1. Delete expired inquiries in a controlled batch.
    const deletedInquiries = await tx.$queryRaw<
      Array<{ id: string }>
    >`
      WITH candidates AS (
        SELECT "id"
        FROM "Inquiry"
        WHERE
          "archivedAt" IS NOT NULL
          AND "retentionExpiresAt" IS NOT NULL
          AND "retentionExpiresAt" <= ${now}
        ORDER BY "retentionExpiresAt" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT ${BATCH_SIZE}
      )
      DELETE FROM "Inquiry" AS inquiry
      USING candidates
      WHERE inquiry."id" = candidates."id"
      RETURNING inquiry."id"
    `;

    // 2. Delete expired reports, excluding active retention holds.
    const deletedReports = await tx.$queryRaw<
      Array<{ id: string }>
    >`
      WITH candidates AS (
        SELECT "id"
        FROM "Report"
        WHERE
          "archivedAt" IS NOT NULL
          AND "retentionExpiresAt" IS NOT NULL
          AND "retentionExpiresAt" <= ${now}
          AND (
            "retentionHoldAt" IS NULL
            OR "retentionHoldReleasedAt" IS NOT NULL
          )
        ORDER BY "retentionExpiresAt" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT ${BATCH_SIZE}
      )
      DELETE FROM "Report" AS report
      USING candidates
      WHERE report."id" = candidates."id"
      RETURNING report."id"
    `;

    return {
      deletedInquiriesCount: deletedInquiries.length,
      deletedReportsCount: deletedReports.length,
      processedAt: now,
    };
  });
};
