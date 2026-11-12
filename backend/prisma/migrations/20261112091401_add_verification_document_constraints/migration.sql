/*
  Warnings:

  - A unique constraint covering the columns `[storageKey]` on the table `VerificationDocument` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "VerificationDocument_storageKey_key" ON "VerificationDocument"("storageKey");

-- Enforce exactly one verification parent per document
ALTER TABLE "VerificationDocument"
ADD CONSTRAINT "VerificationDocument_exactly_one_parent_check"
CHECK (
    num_nonnulls(
        "userVerificationId",
        "ownershipVerificationId",
        "businessVerificationId"
    ) = 1
);