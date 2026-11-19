
-- Add permanent deletion deadline
ALTER TABLE "Property"
ADD COLUMN "permanentDeletionAt" TIMESTAMP(3);

-- Backfill existing soft-deleted properties with a 30-day retention period
UPDATE "Property"
SET "permanentDeletionAt" = "deletedAt" + INTERVAL '30 days'
WHERE "deletedAt" IS NOT NULL
  AND "permanentDeletionAt" IS NULL;

-- Index for efficient retention cleanup queries
CREATE INDEX "Property_permanentDeletionAt_idx"
ON "Property"("permanentDeletionAt");