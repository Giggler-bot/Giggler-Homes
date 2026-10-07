-- CreateEnum
CREATE TYPE "VerificationDocumentType" AS ENUM ('PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'VOTERS_ID', 'PROPERTY_DEED', 'UTILITY_BILL', 'LEASE_AGREEMENT', 'BUSINESS_REGISTRATION');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('AGENCY', 'HOTEL');

-- CreateTable
CREATE TABLE "userVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "idType" "VerificationDocumentType" NOT NULL,
    "idNumber" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnershipVerification" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "proofType" "VerificationDocumentType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnershipVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessVerification" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "businessType" "BusinessType" NOT NULL,
    "businessName" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationDocument" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileUrl" TEXT,
    "docType" "VerificationDocumentType" NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userVerificationId" TEXT,
    "ownershipVerificationId" TEXT,
    "businessVerificationId" TEXT,

    CONSTRAINT "VerificationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "userVerification_userId_key" ON "userVerification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OwnershipVerification_propertyId_key" ON "OwnershipVerification"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessVerification_ownerId_key" ON "BusinessVerification"("ownerId");

-- CreateIndex
CREATE INDEX "VerificationDocument_userVerificationId_idx" ON "VerificationDocument"("userVerificationId");

-- CreateIndex
CREATE INDEX "VerificationDocument_ownershipVerificationId_idx" ON "VerificationDocument"("ownershipVerificationId");

-- CreateIndex
CREATE INDEX "VerificationDocument_businessVerificationId_idx" ON "VerificationDocument"("businessVerificationId");

-- AddForeignKey
ALTER TABLE "userVerification" ADD CONSTRAINT "userVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userVerification" ADD CONSTRAINT "userVerification_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnershipVerification" ADD CONSTRAINT "OwnershipVerification_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnershipVerification" ADD CONSTRAINT "OwnershipVerification_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnershipVerification" ADD CONSTRAINT "OwnershipVerification_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessVerification" ADD CONSTRAINT "BusinessVerification_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessVerification" ADD CONSTRAINT "BusinessVerification_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationDocument" ADD CONSTRAINT "VerificationDocument_userVerificationId_fkey" FOREIGN KEY ("userVerificationId") REFERENCES "userVerification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationDocument" ADD CONSTRAINT "VerificationDocument_ownershipVerificationId_fkey" FOREIGN KEY ("ownershipVerificationId") REFERENCES "OwnershipVerification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationDocument" ADD CONSTRAINT "VerificationDocument_businessVerificationId_fkey" FOREIGN KEY ("businessVerificationId") REFERENCES "BusinessVerification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
