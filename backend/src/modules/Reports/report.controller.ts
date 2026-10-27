
import { Request, Response } from "express";
import * as reportService from "./report.service.js";
import { createModerationAction, getModerationHistory } from "./moderation.services.js";
import { AppError } from "../../common/errors/AppError.js";
import {
  ListingReportReason,
  ReportStatus,
  ModerationActionType,
} from "../../generated/prisma/enums.js";

export async function createReportController(
  req: Request<{ listingId: string }>,
  res: Response,
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const { listingId } = req.params;
  const { reason, description } = req.body;

  const report = await reportService.createReport(
    req.user.id,
    listingId,
    reason as ListingReportReason,
    description,
  );

  res.status(201).json({
    success: true,
    data: report,
  });
}

export async function getMyReportsController(
  req: Request,
  res: Response,
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const { page, limit } = req.query;

  const result = await reportService.getMyReports(
    req.user.id,
    Number(page),
    Number(limit),
  );

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}

export async function getMyReportByIdController(
  req: Request<{ reportId: string }>,
  res: Response,
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const report = await reportService.getReportById(
    req.params.reportId,
    req.user.id,
    false,
  );

  res.status(200).json({
    success: true,
    data: report,
  });
}

export async function getAdminReportQueueController(
  req: Request,
  res: Response,
) {
  const { page, limit, status, reason } = req.query;

  const result = await reportService.getAdminReportQueue(
    Number(page),
    Number(limit),
    status as ReportStatus | undefined,
    reason as ListingReportReason | undefined,
  );

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}

export async function getAdminReportByIdController(
  req: Request<{ reportId: string }>,
  res: Response,
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const report = await reportService.getReportById(
    req.params.reportId,
    req.user.id,
    true,
  );

  res.status(200).json({
    success: true,
    data: report,
  });
}

export async function startReportReviewController(
  req: Request<{ reportId: string }>,
  res: Response,
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const report = await reportService.startReportReview(
    req.params.reportId,
    req.user.id,
  );

  res.status(200).json({
    success: true,
    data: report,
  });
}

export async function resolveReportController(
  req: Request<{ reportId: string }>,
  res: Response,
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const report = await reportService.resolveReport(
    req.params.reportId,
    req.user.id,
  );

  res.status(200).json({
    success: true,
    data: report,
  });
}

export async function dismissReportController(
  req: Request<{ reportId: string }>,
  res: Response,
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const report = await reportService.dismissReport(
    req.params.reportId,
    req.user.id,
  );

  res.status(200).json({
    success: true,
    data: report,
  });
}

export async function createModerationActionController(
  req: Request<{ reportId: string }>,
  res: Response,
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const { actionType, reason } = req.body;

  const action = await createModerationAction({
    reportId: req.params.reportId,
    adminId: req.user.id,
    actionType: actionType as ModerationActionType,
    reason,
  });

  res.status(201).json({
    success: true,
    data: action,
  });
}

export async function getModerationHistoryController(
  req: Request<{ reportId: string }>,
  res: Response,
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const history = await getModerationHistory(
    req.params.reportId,
    req.user.id,
  );

  res.status(200).json({
    success: true,
    data: history,
  });
}
