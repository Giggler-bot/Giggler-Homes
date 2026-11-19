-- AlterTable
ALTER TABLE "MediaAssetCleanup" ADD COLUMN     "lockedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "MediaAssetCleanup_lockedAt_idx" ON "MediaAssetCleanup"("lockedAt");
