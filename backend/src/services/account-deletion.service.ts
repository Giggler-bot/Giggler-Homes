import {
  ListingStatus,
  AccountDeletionStatus,
  UserStatus,
  InquiryStatus,
} from "../generated/prisma/enums.js";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../common/errors/AppError.js";

const ACCOUNT_DELETION_GRACE_PERIOD_DAYS = 30;

export const requestAccountDeletion = async (userId: string) => {
  if (!userId) {
    throw new AppError("Authentication is required", 401);
  }

  return prisma.$transaction(async (tx) => {
    // Lock the user row to prevent concurrent deletion requests.
    await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "User"
        WHERE "id" = ${userId}
        FOR UPDATE
    `;
    // 1. Find the account requesting deletion.
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        status: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new AppError("Account not found", 404);
    }

    //2. Ensure the account is eligible.
    if (user.status === UserStatus.DEACTIVATED) {
      throw new AppError("This account is already deactivated", 409);
    }

    //3. Prevent multiple deletion request.
    const existingDeletion = await tx.accountDeletion.findFirst({
      where: {
        userId,
        status: {
          in: [AccountDeletionStatus.PENDING, AccountDeletionStatus.PROCESSING],
        },
      },
      select: { id: true },
    });

    if (existingDeletion) {
      throw new AppError("An account deletion request is already active", 409);
    }

    //4. Calculate the grace period
    const now = new Date();
    const scheduledFor = new Date(now);

    scheduledFor.setDate(
      scheduledFor.getDate() + ACCOUNT_DELETION_GRACE_PERIOD_DAYS,
    );

    // 5. Create the deletion request
    const deletion = await tx.accountDeletion.create({
      data: {
        userId,
        status: AccountDeletionStatus.PENDING,
        previousUserStatus: user.status,
        requestedAt: now,
        scheduledFor,
      },
    });

    // 6.Find the currently active listings belonging to the user.
    const activeListings = await tx.listing.findMany({
      where: {
        status: ListingStatus.ACTIVE,
        deletedAt: null,
        property: {
          is: {
            ownerId: userId,
            deletedAt: null,
          },
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

    const listingIds = activeListings.map((listing) => listing.id);

    // 7. Preserve the original listing statuses.
    if (activeListings.length > 0) {
      await tx.accountDeletionListing.createMany({
        data: activeListings.map((listing) => ({
          accountDeletionId: deletion.id,
          listingId: listing.id,
          sourceListingId: listing.id,
          previousStatus: listing.status,
          pausedAt: now,
        })),
      });

      //   8. Pause the listings.
      const updatedListings = await tx.listing.updateMany({
        where: {
          id: {
            in: listingIds,
          },
          status: ListingStatus.ACTIVE,
          deletedAt: null,
        },
        data: {
          status: ListingStatus.PAUSED_FOR_ACCOUNT_DELETION,
        },
      });

      // Ensure all selected listings were paused.
      if (updatedListings.count !== activeListings.length) {
        throw new AppError(
          "Some listings changed while processing account deletion. Please try again.",
          409,
        );
      }
    }

    // 9. Deactivate the account.
    await tx.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.DEACTIVATED,
      },
    });

    return {
      message: "Account deletion request submitted successfully",
      deletion: {
        id: deletion.id,
        status: deletion.status,
        requestedAt: deletion.requestedAt,
        scheduledFor: deletion.scheduledFor,
        gracePeriodDays: ACCOUNT_DELETION_GRACE_PERIOD_DAYS,
      },
      pausedListingsCount: activeListings.length,
    };
  });
};

export const cancelAccountDeletion = async (userId: string) => {
  if (!userId) {
    throw new AppError("Authentication is required", 401);
  }

  return prisma.$transaction(async (tx) => {
    // Lock the user row to prevent concurrent account deletion operations.
    await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "User"
        WHERE "id" = ${userId}
        FOR UPDATE
    `;

    const now = new Date();

    // 1. Find the user's most recent pending deletion request.
    const deletion = await tx.accountDeletion.findFirst({
      where: {
        userId,
        status: AccountDeletionStatus.PENDING,
      },
      orderBy: {
        requestedAt: "desc",
      },
    });

    if (!deletion) {
      throw new AppError("No pending account deletion request was found", 404);
    }

    // 2. Check whether the grace period has expired.
    if (deletion.scheduledFor <= now) {
      throw new AppError("The account deletion grace period has expired", 409);
    }

    // 3. Mark the request as cancelled.
    // This conditional update also prevents concurrent cancellation attempts.
    const cancelledDeletion = await tx.accountDeletion.updateMany({
      where: {
        id: deletion.id,
        status: AccountDeletionStatus.PENDING,
        scheduledFor: {
          gt: now,
        },
      },
      data: {
        status: AccountDeletionStatus.CANCELLED,
        cancelledAt: now,
      },
    });

    if (cancelledDeletion.count !== 1) {
      throw new AppError(
        "The deletion request could not be cancelled. It may already be processing.",
        409,
      );
    }

    // 4. Restore the user's original account status.
    const restoredUser = await tx.user.updateMany({
      where: {
        id: userId,
        status: UserStatus.DEACTIVATED,
        deletedAt: null,
      },
      data: {
        status: deletion.previousUserStatus,
      },
    });

    if (restoredUser.count !== 1) {
      throw new AppError(
        "The account could not be restored. Please contact support.",
        409,
      );
    }

    // 5. Retrieve listings paused by this deletion request.
    const pausedListings = await tx.accountDeletionListing.findMany({
      where: {
        accountDeletionId: deletion.id,
        listingId: {
          not: null,
        },
        restoredAt: null,
      },
      select: {
        id: true,
        listingId: true,
        previousStatus: true,
      },
    });

    let restoredListingsCount = 0;

    // 6. Restore each eligible listing to its previous status.
    for (const pausedListing of pausedListings) {
      if (!pausedListing.listingId) {
        continue;
      }

      const restoredListing = await tx.listing.updateMany({
        where: {
          id: pausedListing.listingId,
          status: ListingStatus.PAUSED_FOR_ACCOUNT_DELETION,
          deletedAt: null,
          property: {
            is: {
              deletedAt: null,
            },
          },
        },
        data: {
          status: pausedListing.previousStatus,
        },
      });

      // Only mark the record restored if the listing was actually restored.
      if (restoredListing.count === 1) {
        await tx.accountDeletionListing.update({
          where: {
            id: pausedListing.id,
          },
          data: {
            restoredAt: now,
          },
        });

        restoredListingsCount++;
      }
    }

    return {
      message: "Account deletion request cancelled successfully",
      deletion: {
        id: deletion.id,
        status: AccountDeletionStatus.CANCELLED,
        cancelledAt: now,
      },
      restoredAccountStatus: deletion.previousUserStatus,
      restoredListingsCount,
    };
  });
};

export const finalizeAccountDeletion = async (deletionId: string) => {
  if (!deletionId) {
    throw new AppError("Deletion request ID is required", 400);
  }

  return prisma.$transaction(
    async (tx) => {
      const now = new Date();

      // 1. Read the deletion request to identify its user.
      const deletionReference = await tx.accountDeletion.findUnique({
        where: { id: deletionId },
        select: { userId: true },
      });

      if (!deletionReference) {
        throw new AppError("Deletion request not found", 404);
      }

      if (!deletionReference.userId) {
        throw new AppError("Deletion request has no associated user", 409);
      }

      const userId = deletionReference.userId;

      // 2. Lock the user first.
      // Request and cancellation operations use the same lock order.
      const lockedUsers = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "User"
        WHERE "id" = ${userId}
        FOR UPDATE
      `;

      if (lockedUsers.length !== 1) {
        throw new AppError("Account not found", 404);
      }

      // 3. Lock the deletion request.
      const deletionRows = await tx.$queryRaw<
        Array<{ id: string; userId: string | null }>
      >`
        SELECT "id", "userId"
        FROM "AccountDeletion"
        WHERE "id" = ${deletionId}
        FOR UPDATE
      `;

      const deletionRow = deletionRows[0];

      if (!deletionRow || deletionRow.userId !== userId) {
        throw new AppError("Deletion request could not be locked", 409);
      }

      // 4. Retrieve and validate the deletion request.
      const deletion = await tx.accountDeletion.findUnique({
        where: { id: deletionId },
      });

      if (!deletion) {
        throw new AppError("Deletion request not found", 404);
      }

      if (deletion.status !== AccountDeletionStatus.PENDING) {
        throw new AppError("This deletion request is no longer pending", 409);
      }

      if (deletion.scheduledFor > now) {
        throw new AppError(
          "The account deletion grace period has not expired",
          409,
        );
      }

      // 5. Claim the deletion request.
      const claimedDeletion = await tx.accountDeletion.updateMany({
        where: {
          id: deletionId,
          status: AccountDeletionStatus.PENDING,
          scheduledFor: { lte: now },
        },
        data: {
          status: AccountDeletionStatus.PROCESSING,
        },
      });

      if (claimedDeletion.count !== 1) {
        throw new AppError("Deletion request could not be claimed", 409);
      }

      // 6. Retrieve and validate the user.
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          status: true,
          deletedAt: true,
        },
      });

      if (!user || user.deletedAt) {
        throw new AppError(
          "Account has already been deleted or does not exist",
          409,
        );
      }

      if (user.status !== UserStatus.DEACTIVATED) {
        throw new AppError(
          "Account status changed unexpectedly. Manual review is required.",
          409,
        );
      }

      // 7. Retrieve all properties belonging to the user.
      // Include previously soft-deleted properties so their
      // remaining listings and historical records are considered.
      const properties = await tx.property.findMany({
        where: {
          ownerId: user.id,
        },
        select: {
          id: true,
        },
      });

      const propertyIds = properties.map((property) => property.id);

      // 8. Retrieve listings associated with those properties.
      const listings = propertyIds.length
        ? await tx.listing.findMany({
            where: {
              propertyId: { in: propertyIds },
            },
            select: {
              id: true,
              listingType: true,
              price: true,
              currency: true,
              property: {
                select: {
                  title: true,
                  description: true,
                },
              },
            },
          })
        : [];

      const listingIds = listings.map((listing) => listing.id);

      // 9. Build listing snapshots for historical records.
      const listingSnapshots = new Map(
        listings.map((listing) => [
          listing.id,
          {
            listingId: listing.id,
            listingType: listing.listingType,
            price: listing.price.toString(),
            currency: listing.currency,
            propertyTitle: listing.property.title,
            propertyDescription: listing.property.description,
          },
        ]),
      );

      // 10. Retrieve inquiries associated with the user's
      // properties or received by the user.
      const inquiries = await tx.inquiry.findMany({
        where: {
          OR: [
            { ownerId: user.id },
            { senderId: user.id },
            ...(listingIds.length > 0
              ? [{ listingId: { in: listingIds } }]
              : []),
          ],
        },
        select: {
          id: true,
          status: true,
          closedAt: true,
          archivedAt: true,
          listingId: true,
          ownerId: true,
          sourceListingId: true,
        },
      });

      // 11. Archive all related inquiries, but only close inquiries
      // received by this user or associated with this user's properties.
      // Do not close an inquiry merely because this user submitted it
      // to another property owner.
      for (const inquiry of inquiries) {
        const snapshot = inquiry.listingId
          ? listingSnapshots.get(inquiry.listingId)
          : undefined;

        const belongsToDeletingOwner = inquiry.ownerId === user.id;
        const belongsToDeletingProperty =
          inquiry.listingId !== null && listingSnapshots.has(inquiry.listingId);
        const shouldClose =
          inquiry.status === InquiryStatus.OPEN &&
          (belongsToDeletingOwner || belongsToDeletingProperty);

        await tx.inquiry.update({
          where: { id: inquiry.id },
          data: {
            ...(shouldClose
              ? {
                  status: InquiryStatus.CLOSED,
                  closedAt: now,
                }
              : {}),

            sourceListingId: inquiry.sourceListingId ?? inquiry.listingId,

            archivedAt: inquiry.archivedAt ?? now,

            ...(snapshot ? { listingSnapshot: snapshot } : {}),
          },
        });
      }

      // 12. Retrieve reports associated with the user's
      // properties or submitted by the user.
      const reports = await tx.report.findMany({
        where: {
          OR: [
            { reporterId: user.id },
            ...(listingIds.length > 0
              ? [{ listingId: { in: listingIds } }]
              : []),
          ],
        },
        select: {
          id: true,
          listingId: true,
          sourceListingId: true,
          archivedAt: true,
          reason: true,
          description: true,
        },
      });

      // 13. Archive reports without changing their status.
      // This preserves reports for administrative review.
      for (const report of reports) {
        const snapshot = report.listingId
          ? listingSnapshots.get(report.listingId)
          : undefined;

        await tx.report.update({
          where: { id: report.id },
          data: {
            sourceListingId: report.sourceListingId ?? report.listingId,

            archivedAt: report.archivedAt ?? now,

            ...(snapshot
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

      // 14. Find user identity and business verification documents.
      // Ownership verification documents are deliberately excluded.
      const verificationDocumentWhere = {
        OR: [
          {
            userVerification: {
              is: { userId: user.id },
            },
          },
          {
            businessVerification: {
              is: { ownerId: user.id },
            },
          },
        ],
      };

      const verificationDocuments = await tx.verificationDocument.findMany({
        where: verificationDocumentWhere,
        select: {
          storageKey: true,
        },
      });

      // 15. Queue private Cloudinary assets for cleanup.
      if (verificationDocuments.length > 0) {
        await tx.verificationDocumentCleanup.createMany({
          data: verificationDocuments.map((document) => ({
            storageKey: document.storageKey,
          })),
          skipDuplicates: true,
        });

        // Delete document records only after their storage keys
        // have been safely recorded in the cleanup queue.
        await tx.verificationDocument.deleteMany({
          where: verificationDocumentWhere,
        });
      }

      // 16. Delete user identity verification.
      await tx.userVerification.deleteMany({
        where: {
          userId: user.id,
        },
      });

      // 17. Redact sensitive business verification information.
      // Preserve business type, verification status, review date
      // and reviewer for minimal historical accountability.
      await tx.businessVerification.updateMany({
        where: {
          ownerId: user.id,
        },
        data: {
          businessName: "[REDACTED]",
          registrationNumber: "[REDACTED]",
          rejectionReason: null,
        },
      });

      // 19. Soft-delete all properties that have not already
      // been soft-deleted. Keep the actual update count for the result.
      let deletedPropertiesCount = 0;
      let removedListingsCount = 0;

      if (propertyIds.length > 0) {
        const deletedProperties = await tx.property.updateMany({
          where: {
            id: { in: propertyIds },
            deletedAt: null,
          },
          data: {
            deletedAt: now,
            permanentDeletionAt: now,
            isAvailable: false,
            isFeatured: false,
          },
        });

        deletedPropertiesCount = deletedProperties.count;

        // 20. Withdraw and soft-delete remaining listings.
        const removedListings = await tx.listing.updateMany({
          where: {
            propertyId: { in: propertyIds },
            deletedAt: null,
          },
          data: {
            status: ListingStatus.REMOVED,
            deletedAt: now,
            isFeatured: false,
          },
        });

        removedListingsCount = removedListings.count;
      }

      // 21. Anonymize the user instead of hard-deleting them.
      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          email: `deleted+${user.id}@deleted.gigglerhomes.invalid`,
          phone: `deleted-${user.id}`,
          firstName: "Deleted",
          lastName: "User",
          isEmailVerified: false,
          isPhoneVerified: false,
          status: UserStatus.DEACTIVATED,
          deletedAt: now,
        },
      });

      // 22. Complete the deletion request.
      await tx.accountDeletion.update({
        where: {
          id: deletionId,
        },
        data: {
          status: AccountDeletionStatus.COMPLETED,
          completedAt: now,
        },
      });

      return {
        message: "Account deletion finalized successfully",
        deletionId,
        completedAt: now,
        deletedPropertiesCount,
        removedListingsCount,
        archivedInquiriesCount: inquiries.length,
        archivedReportsCount: reports.length,
        queuedVerificationDocumentsCount: verificationDocuments.length,
      };
    },
    {
      maxWait: 10000,
      timeout: 30000,
    },
  );
};
