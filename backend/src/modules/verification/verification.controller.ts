import { Request, Response } from "express";
import * as userVerification from "./userVerification.service.js";
import * as businessVerification from "./businessVerification.service.js";
import * as ownershipVerification from "./ownershipVerification.service.js";
import { AppError } from "../../common/errors/AppError.js";

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

export const approveUserVerificationController = async (
  req: Request<{ verificationId: string }>,
  res: Response,
) => {
  const verification = await userVerification.approveUserVerification(
    req.params.verificationId,
    req.user!.id,
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

  const verification = await userVerification.rejectUserVerification(
    req.params.verificationId,
    req.user!.id,
    rejectionReason,
  );

  return res.status(200).json({
    success: true,
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
  const verification = await ownershipVerification.approveOwnershipVerification(
    req.params.verificationId,
    req.user!.id,
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

  const verification = await ownershipVerification.rejectOwnershipVerification(
    req.params.verificationId,
    req.user!.id,
    rejectionReason,
  );

  return res.status(200).json({
    success: true,
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
  const verification = await businessVerification.approveBusinessVerification(
    req.params.verificationId,
    req.user!.id,
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

  const verification = await businessVerification.rejectBusinessVerification(
    req.params.verificationId,
    req.user!.id,
    rejectionReason,
  );

  return res.status(200).json({
    success: true,
    data: verification,
  });
};