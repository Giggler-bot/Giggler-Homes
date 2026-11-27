
import { prisma } from "../../lib/prisma.js";

const CLEANUP_BATCH_SIZE = 50;

// Dedicated PostgreSQL advisory-lock identifiers for Giggler Homes.
const CLEANUP_LOCK_NAMESPACE = 681942;
const CLEANUP_LOCK_ID = 30;

function addUtcMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const originalDay = result.getUTCDate();

  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);

  const lastDay = new Date(
    Date.UTC(
      result.getUTCFullYear(),
      result.getUTCMonth() + 1,
      0,
    ),
  ).getUTCDate();

  result.setUTCDate(Math.min(originalDay, lastDay));

  return result;
}

export async function purgeExpiredProperties() {
  const now = new Date();
  const retentionExpiresAt = addUtcMonths(now, 12);

  // Only select expired properties without protected records.
  // Favorites and inquiries do not block permanent deletion.
  // Only unresolved reports block permanent deletion.
  const candidates = await prisma.property.findMany({
    where: {
      deletedAt: { not: null },
      permanentDeletionAt: { lte: now },
      ownershipVerification: {
        is: null,
      },
      listing: {
        none: {
          reports: {
            some: {
              status: {
                in: ["PENDING", "UNDER_REVIEW"],
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
    },
    orderBy: {
      permanentDeletionAt: "asc",
    },
    take: CLEANUP_BATCH_SIZE,
  });

  if (candidates.length === 0) {
    return {
      lockAcquired: false,
      purgedCount: 0,
      queuedAssets: 0,
    };
  }

  return prisma.$transaction(async (tx) => {
    // Prevent concurrent cleanup jobs across application instances.
    const lockResult = await tx.$queryRaw<{ locked: boolean }[]>`
      SELECT pg_try_advisory_xact_lock(
        ${CLEANUP_LOCK_NAMESPACE},
        ${CLEANUP_LOCK_ID}
      ) AS locked
    `;

    if (!lockResult[0]?.locked) {
      return {
        lockAcquired: false,
        purgedCount: 0,
        queuedAssets: 0,
      };
    }

    let purgedCount = 0;
    let queuedAssets = 0;

    for (const candidate of candidates) {
      // Lock the property row.
      await tx.$queryRaw`
        SELECT "id"
        FROM "Property"
        WHERE "id" = ${candidate.id}
        FOR UPDATE
      `;

      // Lock its listings to prevent concurrent interactions.
      await tx.$queryRaw`
        SELECT "id"
        FROM "Listing"
        WHERE "propertyId" = ${candidate.id}
        FOR UPDATE
      `;

      // Recheck eligibility inside the transaction.
      const property = await tx.property.findFirst({
        where: {
          id: candidate.id,
          deletedAt: { not: null },
          permanentDeletionAt: { lte: now },
          ownershipVerification: {
            is: null,
          },
          listing: {
            none: {
              reports: {
                some: {
                  status: {
                    in: ["PENDING", "UNDER_REVIEW"],
                  },
                },
              },
            },
          },
        },
        include: {
          location: {
            select: {
              region: true,
              district: true,
              area: true,
              landmark: true,
            },
          },
          medias: {
            select: {
              publicId: true,
              type: true,
            },
          },
          listing: {
            select: {
              id: true,
              listingType: true,
              price: true,
              currency: true,
              rentPeriod: true,
            },
          },
        },
      });

      if (!property) {
        continue;
      }

      // Preserve historical inquiry and report records
      // before deleting their associated listings.
      for (const listing of property.listing) {
        const listingSnapshot = {
          listingId: listing.id,
          propertyId: property.id,
          propertyTitle: property.title,
          listingType: listing.listingType,
          price: listing.price.toString(),
          currency: listing.currency,
          rentPeriod: listing.rentPeriod,
          location: {
            region: property.location.region,
            district: property.location.district,
            area: property.location.area,
            landmark: property.location.landmark,
          },
        };

        // Close open inquiries before detaching them.
        await tx.inquiry.updateMany({
          where: {
            listingId: listing.id,
            status: "OPEN",
          },
          data: {
            status: "CLOSED",
            closedAt: now,
          },
        });

        // Preserve all inquiry records independently of the listing.
        await tx.inquiry.updateMany({
          where: {
            listingId: listing.id,
          },
          data: {
            listingId: null,
            sourceListingId: listing.id,
            listingSnapshot,
            archivedAt: now,
            retentionExpiresAt,
          },
        });

        // Preserve resolved and dismissed reports.
        // Unresolved reports have already blocked this purge.
        await tx.report.updateMany({
          where: {
            listingId: listing.id,
          },
          data: {
            listingId: null,
            sourceListingId: listing.id,
            listingSnapshot,
            archivedAt: now,
            retentionExpiresAt,
          },
        });
      }

      // Preserve Cloudinary identifiers before media records cascade.
      if (property.medias.length > 0) {
        await tx.mediaAssetCleanup.createMany({
          data: property.medias.map((media) => ({
            publicId: media.publicId,
            resourceType: media.type,
          })),
        });

        queuedAssets += property.medias.length;
      }

      // Delete listings after historical records have been detached.
      // Favorites are allowed to cascade.
      await tx.listing.deleteMany({
        where: {
          propertyId: property.id,
        },
      });

      // Media and property amenities cascade from the property.
      await tx.property.delete({
        where: {
          id: property.id,
        },
      });

      purgedCount++;
    }

    return {
      lockAcquired: true,
      purgedCount,
      queuedAssets,
    };
  });
}
