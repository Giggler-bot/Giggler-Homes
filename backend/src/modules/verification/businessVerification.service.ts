import {
  BusinessType,
  VerificationStatus,
} from "../../generated/prisma/client.js";
import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../lib/prisma.js";

export const createBusinessVerification = async (
  userId: string,
  businessType: BusinessType,
  businessName: string,
  registrationNumber: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role !== "AGENCY" && user.role !== "HOTEL") {
    throw new AppError(
      "Only agency and hotel accounts can submit business verification",
      403,
    );
  }

  if (user.role !== businessType) {
    throw new AppError("Business type does not match user role", 400);
  }

  const existingVerification = await prisma.businessVerification.findUnique({
    where: { ownerId: userId },
  });

  // No previous verification → first submission
  if (!existingVerification) {
    return prisma.businessVerification.create({
      data: {
        ownerId: userId,
        businessType,
        businessName,
        registrationNumber,
        status: VerificationStatus.PENDING,
      },
    });
  }

  // Already pending
  if (existingVerification.status === VerificationStatus.PENDING) {
    throw new AppError(
      "Your business verification is already pending review",
      409,
    );
  }

  // Already verified
  if (existingVerification.status === VerificationStatus.VERIFIED) {
    throw new AppError("Your business is already verified", 409);
  }

  // Rejected → resubmission
  if (existingVerification.status === VerificationStatus.REJECTED) {
    return prisma.businessVerification.update({
      where: {
        ownerId: userId,
      },
      data: {
        businessType,
        businessName,
        registrationNumber,
        status: VerificationStatus.PENDING,
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
      },
    });
  }

  throw new AppError("Invalid business verification status", 400);
};

export const getBusinessVerification = async (
  userId: string,
  isAdmin: boolean,
) => {
  const verification = await prisma.businessVerification.findUnique({
    where: { ownerId: userId },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      documents: {
        select: {
          id: true,
          docType: true,
          uploadedAt: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!verification) {
    throw new AppError("Business verification not found", 404);
  }

  if (!isAdmin && verification.ownerId !== userId) {
    throw new AppError(
      "You are not authorized to view this business verification",
      403,
    );
  }

  return verification;
};

export const approveBusinessVerification = async (
  verificationId: string,
  adminId: string,
) => {
  const verification = await prisma.businessVerification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new AppError("Business verification not found", 404);
  }

  if (verification.status !== VerificationStatus.PENDING) {
    throw new AppError(
      "Only pending business verifications can be approved",
      409,
    );
  }

  return prisma.businessVerification.update({
    where: { id: verificationId },
    data: {
      status: VerificationStatus.VERIFIED,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason: null,
    },
  });
};

export const rejectBusinessVerification = async (
  verificationId: string,
  adminId: string,
  rejectionReason: string,
) => {
  const verification = await prisma.businessVerification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new AppError("Business verification not found", 404);
  }

  if (verification.status !== VerificationStatus.PENDING) {
    throw new AppError(
      "Only pending business verifications can be rejected",
      409,
    );
  }

  return prisma.businessVerification.update({
    where: { id: verificationId },
    data: {
      status: VerificationStatus.REJECTED,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason,
    },
  });
};
