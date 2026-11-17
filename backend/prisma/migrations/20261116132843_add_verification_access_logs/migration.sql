-- CreateTable
CREATE TABLE "VerificationAccessLog" (
    "id" TEXT NOT NULL,
    "verificationId" TEXT NOT NULL,
    "subjectUserId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "VerificationAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VerificationAccessLog_verificationId_accessedAt_idx" ON "VerificationAccessLog"("verificationId", "accessedAt");

-- CreateIndex
CREATE INDEX "VerificationAccessLog_subjectUserId_accessedAt_idx" ON "VerificationAccessLog"("subjectUserId", "accessedAt");

-- CreateIndex
CREATE INDEX "VerificationAccessLog_adminId_accessedAt_idx" ON "VerificationAccessLog"("adminId", "accessedAt");

-- AddForeignKey
ALTER TABLE "VerificationAccessLog" ADD CONSTRAINT "VerificationAccessLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
