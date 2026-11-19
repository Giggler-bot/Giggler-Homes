-- CreateTable
CREATE TABLE "MediaAssetCleanup" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "resourceType" "MediaType" NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "MediaAssetCleanup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaAssetCleanup_processedAt_nextAttemptAt_idx" ON "MediaAssetCleanup"("processedAt", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "MediaAssetCleanup_publicId_idx" ON "MediaAssetCleanup"("publicId");
