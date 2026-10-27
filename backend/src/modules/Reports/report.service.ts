import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../common/errors/AppError.js";
import {
  ReportStatus,
  ListingReportReason,
} from "../../generated/prisma/enums.js";


const DAILY_REPORT_LIMIT = 10;

const mapReportOutcome = (status: ReportStatus) => {
  switch (status) {
    case ReportStatus.PENDING:
      return "RECEIVED";

    case ReportStatus.UNDER_REVIEW:
      return "UNDER_REVIEW";

    case ReportStatus.RESOLVED:
      return "ACTION_TAKEN";

    case ReportStatus.DISMISSED:
      return "NO_ACTION";
  }
};

export const createReport = async (
  reporterId: string,
  listingId: string,
  reason: ListingReportReason,
  description?: string,
) => {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      property: {
        select: { ownerId: true },
      },
    },
  });

  if (!listing) {
    throw new AppError("Listing not found", 404);
  }

  if (listing.property.ownerId === reporterId) {
    throw new AppError("You cannot report your own listing", 400);
  }

  // Use UTC calendar-day boundaries.
  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  const startOfNextDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  try {
    return await prisma.$transaction(async (tx) => {
      // Serialize report submissions from this reporter.
      // Concurrent requests must wait for this lock to be released.
      await tx.$queryRaw<{ id: string }[]>`
        SELECT "id"
        FROM "User"
        WHERE "id" = ${reporterId}
        FOR UPDATE
      `;

      // Count every report submitted today, regardless of status.
      const dailyReportCount = await tx.report.count({
        where: {
          reporterId,
          createdAt: {
            gte: startOfDay,
            lt: startOfNextDay,
          },
        },
      });

      if (dailyReportCount >= DAILY_REPORT_LIMIT) {
        throw new AppError(
          "You have reached the daily limit of 10 reports",
          429,
        );
      }

      // Prevent another active report for the same listing.
      const existingReport = await tx.report.findFirst({
        where: {
          reporterId,
          listingId,
          status: {
            in: [ReportStatus.PENDING, ReportStatus.UNDER_REVIEW],
          },
        },
        select: { id: true },
      });

      if (existingReport) {
        throw new AppError(
          "You already have an active report for this listing",
          409,
        );
      }

      return await tx.report.create({
        data: {
          reporterId,
          listingId,
          reason,
          description,
        },
      });
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new AppError(
        "You already have an active report for this listing",
        409,
      );
    }

    throw error;
  }
};

export const getMyReports = async (
  reporterId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit;

  const [reports, total] = await prisma.$transaction([
    prisma.report.findMany({
      where: { reporterId },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        listing: {
          select: {
            id: true,
            listingType: true,
            price: true,
            property: {
              select: {
                id: true,
                ownerId: true,
                title: true,
              },
            },
          },
        },
        moderationAction: {
          select: {
            actionType: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),

    prisma.report.count({
      where: { reporterId },
    }),
  ]);

  return {
    data: reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getReportById = async (
  reportId: string,
  userId: string,
  isAdmin: boolean,
) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      reporter: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      listing: {
        select: {
          id: true,
          listingType: true,
          price: true,
          property: {
            select: {
              id: true,
              ownerId: true,
            },
          },
        },
      },
      moderationActions: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          adminId: true,
          actionType: true,
          reason: true,
          createdAt: true,
        },
      },
    },
  });

  if (!report) {
    throw new AppError("Report not found", 404);
  }

  if (isAdmin) {
    // An admin cannot investigate a report concerning themselves.
    if (report.listing.property.ownerId === userId) {
      throw new AppError(
        "You cannot investigate a report concerning yourself",
        403,
      );
    }

    return report;
  }

  if (report.reporterId !== userId) {
    throw new AppError("You cannot access this report", 403);
  }

  // Reporters must not receive internal moderation reasons.
  const { moderationActions, ...publicReport } = report;

  return {
    ...publicReport,
    outcome: mapReportOutcome(report.status),
  };
};

export const getAdminReportQueue = async (
  page: number,
  limit: number,
  status?: ReportStatus,
  reason?: ListingReportReason,
) => {
  const skip = (page - 1) * limit;

  const groups = await prisma.$queryRaw<
    {
      listingId: string;
      reportCount: number;
      distinctReporterCount: number;
      lowSeverityReportCount: number;
      oldestReportAt: Date;
    }[]
  >`
    SELECT
      r."listingId" AS "listingId",
      COUNT(*)::int AS "reportCount",
      COUNT(DISTINCT r."reporterId")::int
        AS "distinctReporterCount",
      COUNT(*) FILTER (
        WHERE r."reason" = 'ALREADY_UNAVAILABLE'
      )::int AS "lowSeverityReportCount",
      MIN(r."createdAt") AS "oldestReportAt"
    FROM "Report" r
    WHERE
      (${status ?? null}::"ReportStatus" IS NULL
        OR r."status" = ${status ?? null}::"ReportStatus")
      AND
      (${reason ?? null}::"ListingReportReason" IS NULL
        OR r."reason" = ${reason ?? null}::"ListingReportReason")
    GROUP BY r."listingId"
    ORDER BY
      COUNT(DISTINCT r."reporterId") DESC,
      MIN(r."createdAt") ASC
    LIMIT ${limit}
    OFFSET ${skip}
  `;

  const totalGroups = await prisma.$queryRaw<{ total: number }[]>`
    SELECT COUNT(*)::int AS "total"
    FROM (
      SELECT r."listingId"
      FROM "Report" r
      WHERE
        (${status ?? null}::"ReportStatus" IS NULL
          OR r."status" = ${status ?? null}::"ReportStatus")
        AND
        (${reason ?? null}::"ListingReportReason" IS NULL
          OR r."reason" = ${reason ?? null}::"ListingReportReason")
      GROUP BY r."listingId"
    ) grouped_reports
  `;

  const listingIds = groups.map((group) => group.listingId);

  const reports = listingIds.length
    ? await prisma.report.findMany({
        where: {
          listingId: { in: listingIds },
          ...(status ? { status } : {}),
          ...(reason ? { reason } : {}),
        },
        orderBy: { createdAt: "asc" },
        include: {
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })
    : [];

  const reportsByListing = new Map<string, typeof reports>();

  for (const report of reports) {
    const existing = reportsByListing.get(report.listingId) ?? [];
    existing.push(report);
    reportsByListing.set(report.listingId, existing);
  }

  const listingDetails = listingIds.length
    ? await prisma.listing.findMany({
        where: {
          id: { in: listingIds },
        },
        select: {
          id: true,
          listingType: true,
          status: true,
          price: true,
          property: {
            select: {
              id: true,
              title: true,
              ownerId: true,
            },
          },
        },
      })
    : [];

  const listingsById = new Map(
    listingDetails.map((listing) => [listing.id, listing]),
  );

  const data = groups.map((group) => ({
    ...group,
    severity:
      group.lowSeverityReportCount === group.reportCount ? "LOW" : "NORMAL",
    listing: listingsById.get(group.listingId) ?? null,
    reports: reportsByListing.get(group.listingId) ?? [],
  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total: totalGroups[0]?.total ?? 0,
      totalPages: Math.ceil((totalGroups[0]?.total ?? 0) / limit),
    },
  };
};

export const startReportReview = async (reportId: string, adminId: string) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      status: true,
      listing: {
        select: {
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
      "You cannot review a report concerning your own listing",
      403,
    );
  }

  if (report.status !== ReportStatus.PENDING) {
    throw new AppError("Only pending reports can be moved into review", 409);
  }

  const result = await prisma.report.updateMany({
    where: {
      id: reportId,
      status: ReportStatus.PENDING,
    },
    data: {
      status: ReportStatus.UNDER_REVIEW,
    },
  });

  if (result.count === 0) {
    throw new AppError(
      "This report has already been updated by another request",
      409,
    );
  }

  return prisma.report.findUniqueOrThrow({
    where: { id: reportId },
  });
};

export const resolveReport = async (reportId: string, adminId: string) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      status: true,
      listing: {
        select: {
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
      "You cannot resolve a report concerning your own listing",
      403,
    );
  }

  if (report.status !== ReportStatus.UNDER_REVIEW) {
    throw new AppError("Only reports under review can be resolved", 409);
  }

  const result = await prisma.report.updateMany({
    where: {
      id: reportId,
      status: ReportStatus.UNDER_REVIEW,
    },
    data: {
      status: ReportStatus.RESOLVED,
    },
  });

  if (result.count === 0) {
    throw new AppError(
      "This report has already been updated by another request",
      409,
    );
  }

  return prisma.report.findUniqueOrThrow({
    where: { id: reportId },
  });
};

export const dismissReport = async (reportId: string, adminId: string) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      status: true,
      listing: {
        select: {
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
      "You cannot dismiss a report concerning your own listing",
      403,
    );
  }

  if (report.status !== ReportStatus.UNDER_REVIEW) {
    throw new AppError("Only reports under review can be dismissed", 409);
  }

  const result = await prisma.report.updateMany({
    where: {
      id: reportId,
      status: ReportStatus.UNDER_REVIEW,
    },
    data: {
      status: ReportStatus.DISMISSED,
    },
  });

  if (result.count === 0) {
    throw new AppError(
      "This report has already been updated by another request",
      409,
    );
  }

  return prisma.report.findUniqueOrThrow({
    where: { id: reportId },
  });
};
