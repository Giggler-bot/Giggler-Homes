/*
  Warnings:

  - You are about to drop the `ModerationAction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ModerationAction" DROP CONSTRAINT "ModerationAction_adminId_fkey";

-- DropForeignKey
ALTER TABLE "ModerationAction" DROP CONSTRAINT "ModerationAction_reportId_fkey";

-- DropTable
DROP TABLE "ModerationAction";

-- CreateTable
CREATE TABLE "ModerationActions" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "actionType" "ModerationActionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousListingStatus" "ListingStatus",
    "newListingStatus" "ListingStatus",
    "previousUserStatus" "UserStatus",
    "newUserStatus" "UserStatus",

    CONSTRAINT "ModerationActions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModerationActions_reportId_idx" ON "ModerationActions"("reportId");

-- CreateIndex
CREATE INDEX "ModerationActions_adminId_idx" ON "ModerationActions"("adminId");

-- CreateIndex
CREATE INDEX "ModerationActions_actionType_idx" ON "ModerationActions"("actionType");

-- CreateIndex
CREATE INDEX "ModerationActions_createdAt_idx" ON "ModerationActions"("createdAt");

-- AddForeignKey
ALTER TABLE "ModerationActions" ADD CONSTRAINT "ModerationActions_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationActions" ADD CONSTRAINT "ModerationActions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
