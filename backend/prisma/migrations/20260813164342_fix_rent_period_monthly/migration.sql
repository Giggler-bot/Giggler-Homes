/*
  Warnings:

  - The values [MONTLY] on the enum `RentPeriod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RentPeriod_new" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');
ALTER TABLE "Listing" ALTER COLUMN "rentPeriod" TYPE "RentPeriod_new" USING ("rentPeriod"::text::"RentPeriod_new");
ALTER TYPE "RentPeriod" RENAME TO "RentPeriod_old";
ALTER TYPE "RentPeriod_new" RENAME TO "RentPeriod";
DROP TYPE "public"."RentPeriod_old";
COMMIT;
