/*
  Warnings:

  - Added the required column `previousUserStatus` to the `ModerationAction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ListingStatus" ADD VALUE 'SUSPENDED';
ALTER TYPE "ListingStatus" ADD VALUE 'REMOVED';

-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'BANNED';

-- AlterTable
ALTER TABLE "ModerationAction" ADD COLUMN     "newListingStatus" "ListingStatus",
ADD COLUMN     "newUserStatus" "UserStatus",
ADD COLUMN     "previousListingStatus" "ListingStatus",
ADD COLUMN     "previousUserStatus" "UserStatus" NOT NULL;
