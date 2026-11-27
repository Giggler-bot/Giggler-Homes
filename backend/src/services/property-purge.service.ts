import { InquiryStatus, ReportStatus } from "../generated/prisma/enums.js";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../common/errors/AppError.js";

const RETENTION_PERIOD_MONTHS = 12;

export const purgeProperty = async (propertyId: string) => {
  if (!propertyId) {
    throw new AppError("Property ID is required", 400);
  }

  return prisma.$transaction(
    async (tx) => {
      const now = new Date();

      // 1. Lock the property to prevent concurrent purge operations.
      const lockedProperties = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "Property"
        WHERE "id" = ${propertyId}
        FOR UPDATE
      `;

      if (lockedProperties.length !== 1) {
        throw new AppError("Property not found", 404);
      }

      // 2. Retrieve and validate the property.
      const property = await tx.property.findUnique({
        where: { id: propertyId },
        select: {
          id: true,
          title: true,
          description: true,
          deletedAt: true,
          permanentDeletionAt: true,
        },
      });

      if (!property) {
        throw new AppError("Property not found", 404);
      }

      if (!property.deletedAt) {
        throw new AppError(
          "Property must be soft-deleted before permanent deletion",
          409,
        );
      }

      if (!property.permanentDeletionAt || property.permanentDeletionAt > now) {
        throw new AppError(
          "Property is not yet eligible for permanent deletion",
          409,
        );
      }

      // 3. Check ownership verification holds.
      const ownershipVerification = await tx.ownershipVerification.findUnique({
        where: { propertyId },
        select: {
          id: true,
          purgeHoldReleasedAt: true,
        },
      });

      if (ownershipVerification && !ownershipVerification.purgeHoldReleasedAt) {
        throw new AppError(
          "Property has an active ownership verification hold",
          409,
        );
      }

      // 4. Lock all associated listings.
      // This also prevents concurrent inquiry/report creation
      // through their listing foreign keys while the purge runs.
      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "Listing"
        WHERE "propertyId" = ${propertyId}
        FOR UPDATE
      `;

      // 5. Retrieve all listings belonging to this property.
      const listings = await tx.listing.findMany({
        where: { propertyId },
        select: {
          id: true,
          listingType: true,
          price: true,
          currency: true,
        },
      });

      const listingIds = listings.map((listing) => listing.id);

      // 6. Check associated reports.
      const reports = listingIds.length
        ? await tx.report.findMany({
            where: {
              OR: [
                { listingId: { in: listingIds } },
                { sourceListingId: { in: listingIds } },
              ],
            },
            select: {
              id: true,
              listingId: true,
              sourceListingId: true,
              status: true,
              reason: true,
              description: true,
              archivedAt: true,
              retentionExpiresAt: true,
              listingSnapshot: true,
            },
          })
        : [];

      const unresolvedReports = reports.filter(
        (report) =>
          report.status === ReportStatus.PENDING ||
          report.status === ReportStatus.UNDER_REVIEW,
      );

      if (unresolvedReports.length > 0) {
        throw new AppError(
          "Property cannot be purged while unresolved reports exist",
          409,
        );
      }

      // 7. Retrieve associated inquiries.
      const inquiries = listingIds.length
        ? await tx.inquiry.findMany({
            where: {
              OR: [
                { listingId: { in: listingIds } },
                { sourceListingId: { in: listingIds } },
              ],
            },
            select: {
              id: true,
              listingId: true,
              sourceListingId: true,
              status: true,
              closedAt: true,
              archivedAt: true,
              retentionExpiresAt: true,
              listingSnapshot: true,
            },
          })
        : [];

      // 8. Build listing snapshots.
      const listingSnapshots = new Map(
        listings.map((listing) => [
          listing.id,
          {
            listingId: listing.id,
            listingType: listing.listingType,
            price: listing.price.toString(),
            currency: listing.currency,
            propertyTitle: property.title,
            propertyDescription: property.description,
          },
        ]),
      );

      // 9. Calculate the historical retention expiry.
      const retentionExpiresAt = new Date(now);
      retentionExpiresAt.setUTCMonth(
        retentionExpiresAt.getUTCMonth() + RETENTION_PERIOD_MONTHS,
      );

      // 10. Archive inquiries and preserve their snapshots.
      for (const inquiry of inquiries) {
        const originalListingId = inquiry.listingId ?? inquiry.sourceListingId;

        const snapshot = originalListingId
          ? listingSnapshots.get(originalListingId)
          : undefined;

        await tx.inquiry.update({
          where: { id: inquiry.id },
          data: {
            sourceListingId: inquiry.sourceListingId ?? inquiry.listingId,

            archivedAt: inquiry.archivedAt ?? now,

            retentionExpiresAt:
              inquiry.retentionExpiresAt &&
              inquiry.retentionExpiresAt > retentionExpiresAt
                ? inquiry.retentionExpiresAt
                : retentionExpiresAt,

            ...(inquiry.status === InquiryStatus.OPEN
              ? {
                  status: InquiryStatus.CLOSED,
                  closedAt: inquiry.closedAt ?? now,
                }
              : {}),

            ...(inquiry.listingSnapshot === null && snapshot
              ? { listingSnapshot: snapshot }
              : {}),
          },
        });
      }

      // 11. Archive reports without changing their status.
      for (const report of reports) {
        const originalListingId = report.listingId ?? report.sourceListingId;

        const snapshot = originalListingId
          ? listingSnapshots.get(originalListingId)
          : undefined;

        await tx.report.update({
          where: { id: report.id },
          data: {
            sourceListingId: report.sourceListingId ?? report.listingId,

            archivedAt: report.archivedAt ?? now,

            retentionExpiresAt:
              report.retentionExpiresAt &&
              report.retentionExpiresAt > retentionExpiresAt
                ? report.retentionExpiresAt
                : retentionExpiresAt,

            ...(report.listingSnapshot === null && snapshot
              ? {
                  listingSnapshot: {
                    ...snapshot,
                    reportReason: report.reason,
                    reportDescription: report.description,
                  },
                }
              : {}),
          },
        });
      }

      // 12. Retrieve all property media, including soft-deleted media.
      const mediaAssets = await tx.media.findMany({
        where: { propertyId },
        select: {
          publicId: true,
          type: true,
        },
      });

      // 13. Queue Cloudinary media before deleting database records.
      if (mediaAssets.length > 0) {
        await tx.mediaAssetCleanup.createMany({
          data: mediaAssets.map((media) => ({
            publicId: media.publicId,
            resourceType: media.type,
          })),
        });
      }

      // 14. Queue ownership verification documents.
      // The ownership verification hold has already been checked.
      if (ownershipVerification) {
        const ownershipDocuments = await tx.verificationDocument.findMany({
          where: {
            ownershipVerificationId: ownershipVerification.id,
          },
          select: {
            storageKey: true,
          },
        });

        if (ownershipDocuments.length > 0) {
          await tx.verificationDocumentCleanup.createMany({
            data: ownershipDocuments.map((document) => ({
              storageKey: document.storageKey,
            })),
            skipDuplicates: true,
          });
        }
      }

      // 15. Permanently delete the property's listings.
      // Favorites cascade; inquiry and report listing references
      // become null while their historical records survive.
      const deletedListings = await tx.listing.deleteMany({
        where: { propertyId },
      });

      // 16. Permanently delete the property.
      // Media, property amenities and ownership verification
      // records are removed through their configured cascades.
      await tx.property.delete({
        where: { id: propertyId },
      });

      return {
        message: "Property permanently purged successfully",
        propertyId,
        purgedAt: now,
        deletedListingsCount: deletedListings.count,
        queuedMediaAssetsCount: mediaAssets.length,
        archivedInquiriesCount: inquiries.length,
        archivedReportsCount: reports.length,
        historicalRetentionExpiresAt: retentionExpiresAt,
      };
    },
    {
      maxWait: 10000,
      timeout: 30000,
    },
  );
};
