/*
  Warnings:

  - You are about to drop the column `updatedAT` on the `Media` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Media"
RENAME COLUMN "updatedAT" TO "updatedAt";
