import { Request, Response } from "express";
import * as userVerification from "./userVerification.service.js";
import * as businessVerification from "./businessVerification.service.js";
import * as ownershipVerification from "./ownershipVerification.service.js";
import { AppError } from "../../common/errors/AppError.js";

const getAuditMetadata = (req: Request) => ({
  ipAddress: req.ip ?? null,
  userAgent: req.get("user-agent") ?? null,
});

// User Verification Controllers
export const createUserVerificationController = async (
  req: Request,
  res: Response,
) => {
  const { idType, idNumber } = req.body;

  const verification = await userVerification.createUserVerification(
    req.user!.id,
    idType,
    idNumber,
  );

  return res.status(201).json({
    message: "User verification submitted successfully",
    data: verification,
  });
};

export const getUserVerificationController = async (
  req: Request,
  res: Response,
) => {
  const verification = await userVerification.getUserVerification(req.user!.id);

  return res.status(200).json({
    success: true,
    message: "User verification retrieved successfully",
    data: verification,
  });
};

export const getPendingUserVerificationsController = async (
  req: Request,
  res: Response,
) => {
  const { page, limit } = req.query as unknown as {
    page: number;
    limit: number;
  };

  const result = await userVerification.getPendingUserVerifications(
    page,
    limit,
  );

  res.status(200).json({
    success: true,
    message: "Pending user verifications retrieved successfully",
    data: result.verifications,
    pagination: result.pagination,
  });
};

export const approveUserVerificationController = async (
  req: Request<{ verificationId: string }>,
  res: Response,
) => {

   const { ipAddress, userAgent } = getAuditMetadata(req);

  const verification = await userVerification.approveUserVerification(
    req.params.verificationId,
    req.user!.id,
    ipAddress,
    userAgent,
  );

  return res.status(200).json({
    success: true,
    data: verification,
  });
};

export const rejectUserVerificationController = async (
  req: Request<{ verificationId: string }>,
  res: Response,
) => {
  const { rejectionReason } = req.body;
  const { ipAddress, userAgent } = getAuditMetadata(req);

   const verification = await userVerification.rejectUserVerification(
    req.params.verificationId,
    req.user!.id,
    rejectionReason,
    ipAddress,
    userAgent,
  );

  return res.status(200).json({
    success: true,
    data: verification,
  });
};

export const getAdminUserVerificationController = async (
  req: Request<{ verificationId: string }>,
  res: Response,
) => {
  const verification = await userVerification.getAdminUserVerification(
    req.params.verificationId,
    req.user!.id,
    req.ip ?? null,
    req.get("user-agent") ?? null,
  );

  return res.status(200).json({
    success: true,
    message: "User verification retrieved successfully",
    data: verification,
  });
};

// Ownership Verification Controllers

export const createOwnershipVerificationController = async (
  req: Request<{ propertyId: string }>,
  res: Response,
) => {
  const { proofType } = req.body;

  const verification = await ownershipVerification.createOwnershipVerification(
    req.params.propertyId,
    req.user!.id,
    proofType,
  );

  return res.status(201).json({
    success: true,
    message: "Ownership verification submitted successfully",
    data: verification,
  });
};

export const getOwnershipVerificationController = async (
  req: Request<{ propertyId: string }>,
  res: Response,
) => {
  const verification = await ownershipVerification.getOwnershipVerification(
    req.params.propertyId,
    req.user!.id,
    req.user!.role === "ADMIN",
  );

  return res.status(200).json({
    success: true,
    data: verification,
  });
};

export const approveOwnershipVerificationController = async (
  req: Request<{ verificationId: string }>,
  res: Response,
) => {

   const { ipAddress, userAgent } = getAuditMetadata(req);
 // Approval
const verification = await ownershipVerification.approveOwnershipVerification(
  req.params.verificationId,
  req.user!.id,
  ipAddress,
  userAgent,
);

  return res.status(200).json({
    success: true,
    data: verification,
  });
};

export const rejectOwnershipVerificationController = async (
  req: Request<{ verificationId: string }>,
  res: Response,
) => {
  const { rejectionReason } = req.body;
   const { ipAddress, userAgent } = getAuditMetadata(req);

 // Rejection
const verification = await ownershipVerification.rejectOwnershipVerification(
  req.params.verificationId,
  req.user!.id,
  rejectionReason,
  ipAddress,
  userAgent,
);

  return res.status(200).json({
    success: true,
    data: verification,
  });
};

export const getPendingOwnershipVerificationsController = async (
  req: Request,
  res: Response,
) => {
  const { page, limit } = req.query as unknown as {
    page: number;
    limit: number;
  };

  const result = await ownershipVerification.getPendingOwnershipVerifications(
    page,
    limit,
  );

  return res.status(200).json({
    success: true,
    message: "Pending ownership verifications retrieved successfully",
    data: result.verifications,
    pagination: result.pagination,
  });
};

export const getAdminOwnershipVerificationController = async (
  req: Request<{ verificationId: string }>,
  res: Response,
) => {
   const { ipAddress, userAgent } = getAuditMetadata(req);

 const verification =
  await ownershipVerification.getAdminOwnershipVerification(
    req.params.verificationId,
    req.user!.id,
    ipAddress,
    userAgent,
  );

  return res.status(200).json({
    success: true,
    message: "Ownership verification retrieved successfully",
    data: verification,
  });
};

// Business Verification Controllers

export const createBusinessVerificationController = async (
  req: Request,
  res: Response,
) => {
  const { businessType, businessName, registrationNumber } = req.body;

  const verification = await businessVerification.createBusinessVerification(
    req.user!.id,
    businessType,
    businessName,
    registrationNumber,
  );

  return res.status(201).json({
    success: true,
    message: "Business verification submitted successfully",
    data: verification,
  });
};

export const getBusinessVerificationController = async (
  req: Request,
  res: Response,
) => {
  const verification = await businessVerification.getBusinessVerification(
    req.user!.id,
    req.user!.role === "ADMIN",
  );

  return res.status(200).json({
    success: true,
    data: verification,
  });
};

export const approveBusinessVerificationController = async (
  req: Request<{ verificationId: string }>,
  res: Response,
) => {

   const { ipAddress, userAgent } = getAuditMetadata(req);

  // Approval
const verification = await businessVerification.approveBusinessVerification(
  req.params.verificationId,
  req.user!.id,
  ipAddress,
  userAgent,
);

  return res.status(200).json({
    success: true,
    data: verification,
  });
};

export const rejectBusinessVerificationController = async (
  req: Request<{ verificationId: string }>,
  res: Response,
) => {
  const { rejectionReason } = req.body;

  // Rejection
const verification = await businessVerification.rejectBusinessVerification(
  req.params.verificationId,
  req.user!.id,
  rejectionReason,
  getAuditMetadata(req).ipAddress,
  getAuditMetadata(req).userAgent,
);

  return res.status(200).json({
    success: true,
    data: verification,
  });
};

export const getPendingBusinessVerificationsController = async (
  req: Request,
  res: Response,
) => {
  const { page, limit } = req.query as unknown as {
    page: number;
    limit: number;
  };
  const result = await businessVerification.getPendingBusinessVerifications(
    page,
    limit,
  );

  return res.status(200).json({
    success: true,
    message: "Pending business verifications retrieved successfully",
    data: result.verifications,
    pagination: result.pagination,
  });
};

export const getAdminBusinessVerificationController = async (
  req: Request<{ verificationId: string }>,
  res: Response,
) => {
  const verification = await businessVerification.getAdminBusinessVerification(
  req.params.verificationId,
  req.user!.id,
  getAuditMetadata(req).ipAddress,
  getAuditMetadata(req).userAgent,
);

  return res.status(200).json({
    success: true,
    message: "Business verification retrieved successfully",
    data: verification,
  });
};
