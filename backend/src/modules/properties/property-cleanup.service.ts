import { prisma } from "../../lib/prisma.js";

const CLEANUP_BATCH_SIZE = 50;

// Dedicated PostgreSQL advisory-lock identifiers for Giggler Homes.
const CLEANUP_LOCK_NAMESPACE = 681942;
const CLEANUP_LOCK_ID = 30;

export async function purgeExpiredProperties() {
  const now = new Date();

  // Only select expired properties without protected records.
  const candidates = await prisma.property.findMany({
    where: {
      deletedAt: { not: null },
      permanentDeletionAt: { lte: now },
      ownershipVerification: {
        is: null,
      },
      listing: {
        none: {
          OR: [
            { favorites: { some: {} } },
            { inquires: { some: {} } },
            { reports: { some: {} } },
          ],
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
      // Lock its listings to prevent concurrent interaction inserts.
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
              OR: [
                { favorites: { some: {} } },
                { inquires: { some: {} } },
                { reports: { some: {} } },
              ],
            },
          },
        },
        include: {
          medias: {
            select: {
              publicId: true,
              type: true,
            },
          },
        },
      });

      if (!property) {
        continue;
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

      // Delete listings first because Property -> Listing is restrictive.
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
