import { Request, Response } from "express";
import * as inquiryService from "./inquiry.service.js";
import { AppError } from "../../common/errors/AppError.js";
import { InquiryStatus } from "../../generated/prisma/enums.js";

export async function createInquiryController(
  req: Request<{ listingId: string }>,
  res: Response,
) {
  const { listingId } = req.params;
  const { message } = req.body;

  if (!req.user) {
    throw new AppError("Authentication is required", 401);
  }

  const inquiry = await inquiryService.createInquiry(
    listingId,
    req.user.id,
    message,
  );

  res.status(201).json({
    success: true,
    data: inquiry,
  });
}

export async function getSentInquriesController(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const { page, limit, status } = req.query;

  const result = await inquiryService.getSentInquiries(
    req.user.id,
    Number(page),
    Number(limit),
    status as InquiryStatus | undefined,
  );

  res.status(200).json({
    success: true,
    data: result.inquiries,
    pagination: result.pagination,
  });
}

export async function getReceivedInquriesController(
  req: Request,
  res: Response,
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const { page, limit, status } = req.query;

  const result = await inquiryService.getReceivedInquiries(
    req.user.id,
    Number(page),
    Number(limit),
    status as InquiryStatus | undefined,
  );
  res.status(200).json({
    success: true,
    data: result.inquiries,
    pagination: result.pagination,
  });
}

export async function getInquiryByIdController(
  req: Request<{ inquiryId: string }>,
  res: Response,
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const inquiry = await inquiryService.getInquiryById(
    req.params.inquiryId,
    req.user.id,
    req.user.role === "ADMIN",
  );
  res.status(200).json({
    success: true,
    data: inquiry,
  });
}

export async function respondToInquiryController(
  req: Request<{ inquiryId: string }>,
  res: Response,
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const inquiry = await inquiryService.respondToInquiry(
    req.params.inquiryId,
    req.user.id,
    req.user.role === "ADMIN",
  );

  res.status(200).json({
    success: true,
    data: inquiry,
  });
}

export const closeInquiryController = async (
  req: Request<{ inquiryId: string }>,
  res: Response,
) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const inquiry = await inquiryService.closeInquiry(
    req.params.inquiryId,
    req.user.id,
    req.user.role === "ADMIN",
  );

  res.status(200).json({
    success: true,
    data: inquiry,
  });
};
