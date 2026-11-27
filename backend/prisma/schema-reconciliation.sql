
-- ============================================================
-- GIGGLER HOMES
-- CONSOLIDATED SCHEMA RECONCILIATION
-- ============================================================

-- CreateEnum
CREATE TYPE "AccountDeletionStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'CANCELLED'
);

-- CreateEnum
CREATE TYPE "VerificationAuditActorType" AS ENUM (
    'ADMIN',
    'USER'
);

-- CreateEnum
CREATE TYPE "VerificationAuditKind" AS ENUM (
    'USER',
    'OWNERSHIP',
    'BUSINESS'
);

-- CreateEnum
CREATE TYPE "VerificationAuditAction" AS ENUM (
    'VIEW_DETAILS',
    'DOCUMENT_URL_ISSUED',
    'APPROVE',
    'REJECT'
);

-- CreateEnum
CREATE TYPE "VerificationAuditReason" AS ENUM (
    'REVIEW',
    'APPEAL',
    'DISPUTE',
    'SUPPORT'
);

-- ============================================================
-- LISTING STATUS
-- ============================================================

ALTER TYPE "ListingStatus"
ADD VALUE 'PAUSED_FOR_ACCOUNT_DELETION';

-- ============================================================
-- DROP EXISTING FOREIGN KEYS
-- ============================================================

ALTER TABLE "Inquiry"
DROP CONSTRAINT "Inquiry_listingId_fkey";

ALTER TABLE "Inquiry"
DROP CONSTRAINT "Inquiry_ownerId_fkey";

ALTER TABLE "Inquiry"
DROP CONSTRAINT "Inquiry_senderId_fkey";

ALTER TABLE "Report"
DROP CONSTRAINT "Report_listingId_fkey";

ALTER TABLE "Report"
DROP CONSTRAINT "Report_reporterId_fkey";

ALTER TABLE "VerificationAccessLog"
DROP CONSTRAINT "VerificationAccessLog_adminId_fkey";

-- ============================================================
-- INQUIRY
-- ============================================================

ALTER TABLE "Inquiry"
ADD COLUMN "archivedAt" TIMESTAMP(3),
ADD COLUMN "listingSnapshot" JSONB,
ADD COLUMN "retentionExpiresAt" TIMESTAMP(3),
ADD COLUMN "sourceListingId" TEXT,
ALTER COLUMN "listingId" DROP NOT NULL,
ALTER COLUMN "senderId" DROP NOT NULL,
ALTER COLUMN "ownerId" DROP NOT NULL;

-- ============================================================
-- OWNERSHIP VERIFICATION
-- ============================================================

ALTER TABLE "OwnershipVerification"
ADD COLUMN "purgeHoldReleasedAt" TIMESTAMP(3),
ADD COLUMN "purgeHoldReleasedById" TEXT;

-- ============================================================
-- REPORT
-- ============================================================

ALTER TABLE "Report"
ADD COLUMN "archivedAt" TIMESTAMP(3),
ADD COLUMN "listingSnapshot" JSONB,
ADD COLUMN "retentionExpiresAt" TIMESTAMP(3),
ADD COLUMN "retentionHoldAt" TIMESTAMP(3),
ADD COLUMN "retentionHoldById" TEXT,
ADD COLUMN "retentionHoldReason" TEXT,
ADD COLUMN "retentionHoldReleasedAt" TIMESTAMP(3),
ADD COLUMN "retentionHoldReleasedById" TEXT,
ADD COLUMN "sourceListingId" TEXT,
ALTER COLUMN "reporterId" DROP NOT NULL,
ALTER COLUMN "listingId" DROP NOT NULL;

-- ============================================================
-- VERIFICATION AUDIT LOG
-- RENAME EXISTING TABLE AND PRESERVE HISTORICAL RECORDS
-- ============================================================

ALTER TABLE "VerificationAccessLog"
RENAME TO "VerificationAuditLog";

-- Rename existing columns

ALTER TABLE "VerificationAuditLog"
RENAME COLUMN "adminId" TO "actorId";

ALTER TABLE "VerificationAuditLog"
RENAME COLUMN "accessedAt" TO "occurredAt";

-- Rename primary key constraint

ALTER TABLE "VerificationAuditLog"
RENAME CONSTRAINT "VerificationAccessLog_pkey"
TO "VerificationAuditLog_pkey";

-- Remove old indexes

DROP INDEX "VerificationAccessLog_subjectUserId_accessedAt_idx";

DROP INDEX "VerificationAccessLog_adminId_accessedAt_idx";

-- Add new audit fields.
-- Existing rows receive ADMIN and VIEW_DETAILS because the legacy
-- VerificationAccessLog recorded admin access to verification details.
-- verificationKind is intentionally nullable until historical rows
-- have been classified against the three verification tables.

ALTER TABLE "VerificationAuditLog"
ADD COLUMN "actorType" "VerificationAuditActorType"
    NOT NULL DEFAULT 'ADMIN',
ADD COLUMN "verificationKind" "VerificationAuditKind",
ADD COLUMN "documentId" TEXT,
ADD COLUMN "action" "VerificationAuditAction"
    NOT NULL DEFAULT 'VIEW_DETAILS',
ADD COLUMN "reason" "VerificationAuditReason",
ADD COLUMN "retentionExpiresAt" TIMESTAMP(3),
ADD COLUMN "retentionHoldAt" TIMESTAMP(3),
ADD COLUMN "retentionHoldReason" TEXT,
ADD COLUMN "retentionHoldById" TEXT,
ADD COLUMN "retentionHoldReleasedAt" TIMESTAMP(3),
ADD COLUMN "retentionHoldReleasedById" TEXT;

-- Classify each historical audit record by its verification record.
-- A verification ID must exist in exactly one verification table.
-- Ambiguous or unmatched rows are left NULL and cause the migration
-- to stop before verificationKind becomes NOT NULL.

UPDATE "VerificationAuditLog" a
SET "verificationKind" = CASE
    WHEN EXISTS (
        SELECT 1
        FROM "userVerification" uv
        WHERE uv."id" = a."verificationId"
    )
    AND NOT EXISTS (
        SELECT 1
        FROM "OwnershipVerification" ov
        WHERE ov."id" = a."verificationId"
    )
    AND NOT EXISTS (
        SELECT 1
        FROM "BusinessVerification" bv
        WHERE bv."id" = a."verificationId"
    )
    THEN 'USER'::"VerificationAuditKind"

    WHEN EXISTS (
        SELECT 1
        FROM "OwnershipVerification" ov
        WHERE ov."id" = a."verificationId"
    )
    AND NOT EXISTS (
        SELECT 1
        FROM "userVerification" uv
        WHERE uv."id" = a."verificationId"
    )
    AND NOT EXISTS (
        SELECT 1
        FROM "BusinessVerification" bv
        WHERE bv."id" = a."verificationId"
    )
    THEN 'OWNERSHIP'::"VerificationAuditKind"

    WHEN EXISTS (
        SELECT 1
        FROM "BusinessVerification" bv
        WHERE bv."id" = a."verificationId"
    )
    AND NOT EXISTS (
        SELECT 1
        FROM "userVerification" uv
        WHERE uv."id" = a."verificationId"
    )
    AND NOT EXISTS (
        SELECT 1
        FROM "OwnershipVerification" ov
        WHERE ov."id" = a."verificationId"
    )
    THEN 'BUSINESS'::"VerificationAuditKind"

    ELSE NULL
END;

-- Fail safely if any historical record cannot be classified uniquely.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "VerificationAuditLog"
        WHERE "verificationKind" IS NULL
    ) THEN
        RAISE EXCEPTION
            'Migration stopped: one or more verification audit logs could not be classified uniquely.';
    END IF;
END $$;

ALTER TABLE "VerificationAuditLog"
ALTER COLUMN "verificationKind" SET NOT NULL;

-- Apply 12-month retention to existing audit records.

UPDATE "VerificationAuditLog"
SET "retentionExpiresAt" =
    "occurredAt" + INTERVAL '12 months';

-- Remove temporary defaults.

ALTER TABLE "VerificationAuditLog"
ALTER COLUMN "actorType" DROP DEFAULT,
ALTER COLUMN "action" DROP DEFAULT;

-- ============================================================
-- AUTH SESSION
-- ============================================================

CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceName" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokeReason" TEXT,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- REFRESH TOKEN
-- ============================================================

CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- VERIFICATION DOCUMENT CLEANUP
-- ============================================================

CREATE TABLE "VerificationDocumentCleanup" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),

    CONSTRAINT "VerificationDocumentCleanup_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- ACCOUNT DELETION
-- ============================================================

CREATE TABLE "AccountDeletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "status" "AccountDeletionStatus" NOT NULL DEFAULT 'PENDING',
    "previousUserStatus" "UserStatus" NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountDeletion_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- ACCOUNT DELETION LISTING
-- ============================================================

CREATE TABLE "AccountDeletionListing" (
    "id" TEXT NOT NULL,
    "accountDeletionId" TEXT NOT NULL,
    "listingId" TEXT,
    "sourceListingId" TEXT NOT NULL,
    "previousStatus" "ListingStatus" NOT NULL,
    "pausedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restoredAt" TIMESTAMP(3),

    CONSTRAINT "AccountDeletionListing_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- AUTH SESSION INDEXES
-- ============================================================

CREATE INDEX "AuthSession_userId_idx"
ON "AuthSession"("userId");

CREATE INDEX "AuthSession_userId_revokedAt_idx"
ON "AuthSession"("userId", "revokedAt");

CREATE INDEX "AuthSession_expiresAt_idx"
ON "AuthSession"("expiresAt");

-- ============================================================
-- REFRESH TOKEN INDEXES
-- ============================================================

CREATE UNIQUE INDEX "RefreshToken_tokenHash_key"
ON "RefreshToken"("tokenHash");

CREATE INDEX "RefreshToken_sessionId_idx"
ON "RefreshToken"("sessionId");

CREATE INDEX "RefreshToken_expiresAt_idx"
ON "RefreshToken"("expiresAt");

-- ============================================================
-- VERIFICATION AUDIT LOG INDEXES
-- ============================================================

CREATE INDEX "VerificationAuditLog_verificationId_occurredAt_idx"
ON "VerificationAuditLog"("verificationId", "occurredAt");

CREATE INDEX "VerificationAuditLog_subjectUserId_occurredAt_idx"
ON "VerificationAuditLog"("subjectUserId", "occurredAt");

CREATE INDEX "VerificationAuditLog_actorId_occurredAt_idx"
ON "VerificationAuditLog"("actorId", "occurredAt");

CREATE INDEX "VerificationAuditLog_retentionExpiresAt_idx"
ON "VerificationAuditLog"("retentionExpiresAt");

-- ============================================================
-- VERIFICATION DOCUMENT CLEANUP INDEXES
-- ============================================================

CREATE UNIQUE INDEX "VerificationDocumentCleanup_storageKey_key"
ON "VerificationDocumentCleanup"("storageKey");

CREATE INDEX "VerificationDocumentCleanup_processedAt_nextAttemptAt_idx"
ON "VerificationDocumentCleanup"("processedAt", "nextAttemptAt");

CREATE INDEX "VerificationDocumentCleanup_lockedAt_idx"
ON "VerificationDocumentCleanup"("lockedAt");

CREATE INDEX "VerificationDocumentCleanup_storageKey_idx"
ON "VerificationDocumentCleanup"("storageKey");

-- ============================================================
-- ACCOUNT DELETION INDEXES
-- ============================================================

CREATE INDEX "AccountDeletion_userId_idx"
ON "AccountDeletion"("userId");

CREATE INDEX "AccountDeletion_status_scheduledFor_idx"
ON "AccountDeletion"("status", "scheduledFor");

-- Only one active deletion request per user

CREATE UNIQUE INDEX "AccountDeletion_one_active_request_per_user_key"
ON "AccountDeletion"("userId")
WHERE "userId" IS NOT NULL
AND "status" IN ('PENDING', 'PROCESSING');

-- ============================================================
-- ACCOUNT DELETION LISTING INDEXES
-- ============================================================

CREATE INDEX "AccountDeletionListing_listingId_idx"
ON "AccountDeletionListing"("listingId");

CREATE INDEX "AccountDeletionListing_accountDeletionId_idx"
ON "AccountDeletionListing"("accountDeletionId");

CREATE UNIQUE INDEX "AccountDeletionListing_accountDeletionId_sourceListingId_key"
ON "AccountDeletionListing"("accountDeletionId", "sourceListingId");

-- ============================================================
-- INQUIRY / REPORT / OWNERSHIP INDEXES
-- ============================================================

CREATE INDEX "Inquiry_retentionExpiresAt_idx"
ON "Inquiry"("retentionExpiresAt");

CREATE INDEX "OwnershipVerification_purgeHoldReleasedAt_idx"
ON "OwnershipVerification"("purgeHoldReleasedAt");

CREATE INDEX "Report_retentionExpiresAt_idx"
ON "Report"("retentionExpiresAt");

-- ============================================================
-- FOREIGN KEYS
-- ============================================================

-- AuthSession

ALTER TABLE "AuthSession"
ADD CONSTRAINT "AuthSession_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- RefreshToken

ALTER TABLE "RefreshToken"
ADD CONSTRAINT "RefreshToken_sessionId_fkey"
FOREIGN KEY ("sessionId")
REFERENCES "AuthSession"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Inquiry

ALTER TABLE "Inquiry"
ADD CONSTRAINT "Inquiry_listingId_fkey"
FOREIGN KEY ("listingId")
REFERENCES "Listing"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Inquiry"
ADD CONSTRAINT "Inquiry_senderId_fkey"
FOREIGN KEY ("senderId")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Inquiry"
ADD CONSTRAINT "Inquiry_ownerId_fkey"
FOREIGN KEY ("ownerId")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- VerificationAuditLog

ALTER TABLE "VerificationAuditLog"
ADD CONSTRAINT "VerificationAuditLog_actorId_fkey"
FOREIGN KEY ("actorId")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "VerificationAuditLog"
ADD CONSTRAINT "VerificationAuditLog_subjectUserId_fkey"
FOREIGN KEY ("subjectUserId")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- OwnershipVerification

ALTER TABLE "OwnershipVerification"
ADD CONSTRAINT "OwnershipVerification_purgeHoldReleasedById_fkey"
FOREIGN KEY ("purgeHoldReleasedById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Report

ALTER TABLE "Report"
ADD CONSTRAINT "Report_reporterId_fkey"
FOREIGN KEY ("reporterId")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Report"
ADD CONSTRAINT "Report_listingId_fkey"
FOREIGN KEY ("listingId")
REFERENCES "Listing"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- AccountDeletion

ALTER TABLE "AccountDeletion"
ADD CONSTRAINT "AccountDeletion_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AccountDeletionListing

ALTER TABLE "AccountDeletionListing"
ADD CONSTRAINT "AccountDeletionListing_accountDeletionId_fkey"
FOREIGN KEY ("accountDeletionId")
REFERENCES "AccountDeletion"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "AccountDeletionListing"
ADD CONSTRAINT "AccountDeletionListing_listingId_fkey"
FOREIGN KEY ("listingId")
REFERENCES "Listing"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
