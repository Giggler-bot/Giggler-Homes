/*
  Warnings:

  - You are about to drop the column `deleatedAt` on the `Media` table. All the data in the column will be lost.
  - Added the required column `deletedAt` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Media_deleatedAt_idx";

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "deleatedAt",
ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Media_deletedAt_idx" ON "Media"("deletedAt");
