
import { prisma } from "../lib/prisma.js";

const BATCH_SIZE = 100;

type DeletedAuditLog = {
  id: string;
};

export async function cleanupExpiredVerificationAuditLogs() {
  const deleted = await prisma.$transaction(async (tx) => {
    return tx.$queryRaw<DeletedAuditLog[]>`
      WITH expired_logs AS (
        SELECT "id"
        FROM "VerificationAuditLog"
        WHERE
          "retentionExpiresAt" IS NOT NULL
          AND "retentionExpiresAt" <= NOW()
          AND (
            "retentionHoldAt" IS NULL
            OR "retentionHoldReleasedAt" IS NOT NULL
          )
        ORDER BY "retentionExpiresAt" ASC
        LIMIT ${BATCH_SIZE}
        FOR UPDATE SKIP LOCKED
      )
      DELETE FROM "VerificationAuditLog" AS audit
      USING expired_logs
      WHERE audit."id" = expired_logs."id"
      RETURNING audit."id";
    `;
  });

  return {
    deleted: deleted.length,
  };
}
