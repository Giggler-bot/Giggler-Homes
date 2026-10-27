import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../common/errors/AppError.js";
import {
  ReportStatus,
  ModerationActionType,
  UserStatus,
  ListingStatus,
} from "../../generated/prisma/enums.js";



type CreateModerationActionInput = {
  reportId: string;
  adminId: string;
  actionType: ModerationActionType;
  reason: string;
};


export const createModerationAction = async ({
  reportId,
  adminId,
  actionType,
  reason,
}: CreateModerationActionInput) => {
  const trimmedReason = reason.trim();

  if (!trimmedReason || trimmedReason.length > 1000) {
    throw new AppError(
      "Reason must contain between 1 and 1000 characters",
      400,
    );
  }

  return prisma.$transaction(async (tx) => {
    // 1. Lock the report to prevent concurrent moderation
    // actions against the same report.
    await tx.$queryRaw<{ id: string }[]>`
      SELECT "id"
      FROM "Report"
      WHERE "id" = ${reportId}
      FOR UPDATE
    `;

    const initialReport = await tx.report.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        listingId: true,
        listing: {
          select: {
            property: {
              select: { ownerId: true },
            },
          },
        },
      },
    });

    if (!initialReport) {
      throw new AppError("Report not found", 404);
    }

    const ownerId = initialReport.listing.property.ownerId;

    // 2. Lock the listing. This also serializes actions
    // originating from different reports about this listing.
    await tx.$queryRaw<{ id: string }[]>`
      SELECT "id"
      FROM "Listing"
      WHERE "id" = ${initialReport.listingId}
      FOR UPDATE
    `;

    // 3. Lock the owner so concurrent user-status changes
    // across different listings belonging to that owner serialize.
    await tx.$queryRaw<{ id: string }[]>`
      SELECT "id"
      FROM "User"
      WHERE "id" = ${ownerId}
      FOR UPDATE
    `;

    // 4. Re-fetch the state after obtaining the locks.
    const report = await tx.report.findUnique({
      where: { id: reportId },
      include: {
        listing: {
          include: {
            property: {
              select: { ownerId: true },
            },
          },
        },
      },
    });

    if (!report) {
      throw new AppError("Report not found", 404);
    }

    if (report.listing.property.ownerId === adminId) {
      throw new AppError(
        "You cannot moderate a listing or user associated with yourself",
        403,
      );
    }

    if (report.status !== ReportStatus.UNDER_REVIEW) {
      throw new AppError(
        "Only reports under review can receive moderation actions",
        409,
      );
    }

    const listing = report.listing;
    const targetUserId = listing.property.ownerId;

    let previousListingStatus: ListingStatus | null = null;
    let newListingStatus: ListingStatus | null = null;
    let previousUserStatus: UserStatus | null = null;
    let newUserStatus: UserStatus | null = null;

    switch (actionType) {
      case ModerationActionType.SUSPEND_LISTING: {
        if (
          listing.status === ListingStatus.SUSPENDED ||
          listing.status === ListingStatus.REMOVED
        ) {
          throw new AppError(
            "This listing is already suspended or removed",
            409,
          );
        }

        previousListingStatus = listing.status;
        newListingStatus = ListingStatus.SUSPENDED;

        await tx.listing.update({
          where: { id: listing.id },
          data: { status: newListingStatus },
        });

        break;
      }

      case ModerationActionType.REMOVE_LISTING: {
        if (listing.status === ListingStatus.REMOVED) {
          throw new AppError("This listing has already been removed", 409);
        }

        previousListingStatus = listing.status;
        newListingStatus = ListingStatus.REMOVED;

        await tx.listing.update({
          where: { id: listing.id },
          data: { status: newListingStatus },
        });

        break;
      }

      case ModerationActionType.RESTORE_LISTING: {
        if (
          listing.status !== ListingStatus.SUSPENDED &&
          listing.status !== ListingStatus.REMOVED
        ) {
          throw new AppError(
            "Only suspended or removed listings can be restored",
            409,
          );
        }

        // Retrieve every listing-status moderation action across
        // all reports associated with this listing.
        const history = await tx.moderationActions.findMany({
          where: {
            report: {
              listingId: listing.id,
            },
            actionType: {
              in: [
                ModerationActionType.SUSPEND_LISTING,
                ModerationActionType.REMOVE_LISTING,
                ModerationActionType.RESTORE_LISTING,
              ],
            },
          },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          select: {
            actionType: true,
            previousListingStatus: true,
            newListingStatus: true,
          },
        });

        // The most recent status-changing action must explain
        // why the listing is currently restricted.
        const latestStatusAction = history[0];

        if (
          !latestStatusAction ||
          (latestStatusAction.actionType !==
            ModerationActionType.SUSPEND_LISTING &&
            latestStatusAction.actionType !==
              ModerationActionType.REMOVE_LISTING)
        ) {
          throw new AppError(
            "The latest moderation history does not support restoration",
            409,
          );
        }

        // Walk backwards through consecutive moderation-only
        // states to recover the status before the restriction sequence.
        let restorationStatus = latestStatusAction.previousListingStatus;

        for (let i = 1; i < history.length; i++) {
          if (
            restorationStatus !== ListingStatus.SUSPENDED &&
            restorationStatus !== ListingStatus.REMOVED
          ) {
            break;
          }

          const previousAction = history[i];

          if (previousAction.newListingStatus !== restorationStatus) {
            break;
          }

          restorationStatus = previousAction.previousListingStatus;
        }

        if (!restorationStatus) {
          throw new AppError(
            "Could not determine the listing's previous status",
            409,
          );
        }

        if (
          restorationStatus === ListingStatus.SUSPENDED ||
          restorationStatus === ListingStatus.REMOVED
        ) {
          throw new AppError(
            "The original listing status could not be safely recovered",
            409,
          );
        }

        previousListingStatus = listing.status;
        newListingStatus = restorationStatus;

        await tx.listing.update({
          where: { id: listing.id },
          data: {
            status: newListingStatus,
          },
        });

        break;
      }

      case ModerationActionType.WARN_USER:
      case ModerationActionType.SUSPEND_USER:
      case ModerationActionType.BAN_USER: {
        const targetUser = await tx.user.findUnique({
          where: { id: targetUserId },
          select: {
            id: true,
            status: true,
          },
        });

        if (!targetUser) {
          throw new AppError("Listing owner not found", 404);
        }

        previousUserStatus = targetUser.status;
        newUserStatus = targetUser.status;

        if (actionType === ModerationActionType.SUSPEND_USER) {
          if (
            targetUser.status === UserStatus.SUSPENDED ||
            targetUser.status === UserStatus.BANNED
          ) {
            throw new AppError("This user is already suspended or banned", 409);
          }

          newUserStatus = UserStatus.SUSPENDED;
        }

        if (actionType === ModerationActionType.BAN_USER) {
          if (targetUser.status === UserStatus.BANNED) {
            throw new AppError("This user is already banned", 409);
          }

          newUserStatus = UserStatus.BANNED;
        }

        // Warnings are recorded without changing the user's status.
        if (actionType !== ModerationActionType.WARN_USER) {
          await tx.user.update({
            where: { id: targetUser.id },
            data: { status: newUserStatus },
          });
        }

        break;
      }

      default: {
        throw new AppError("Unsupported moderation action", 400);
      }
    }

    // 5. Persist the state change and audit history atomically.
    // If this insert fails, the transaction rolls back the
    // associated listing or user status change.
    return tx.moderationActions.create({
      data: {
        reportId,
        adminId,
        actionType,
        reason: trimmedReason,
        previousListingStatus,
        newListingStatus,
        previousUserStatus,
        newUserStatus,
      },
    });
  });
};

export const getModerationHistory = async (
  reportId: string,
  adminId: string,
) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      listing: {
        select: {
          property: {
            select: {
              ownerId: true,
            },
          },
        },
      },
    },
  });

  if (!report) {
    throw new AppError("Report not found", 404);
  }

  if (report.listing.property.ownerId === adminId) {
    throw new AppError(
      "You cannot review moderation history concerning yourself",
      403,
    );
  }

  return prisma.moderationActions.findMany({
    where: { reportId },
    orderBy: { createdAt: "asc" },
    include: {
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};
