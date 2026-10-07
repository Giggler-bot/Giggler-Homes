import { prisma } from "../../lib/prisma.js";
import {
  VerificationStatus,
  VerificationDocumentType,
} from "../../generated/prisma/enums.js";
import { AppError } from "../../common/errors/AppError.js";

export const createUserVerification = async (
  userId: string,
  idType: VerificationDocumentType,
  idNumber: string,
) => {
  const existingVerification = await prisma.userVerification.findUnique({
    where: { userId },
  });

  if (existingVerification) {
    if (existingVerification.status === VerificationStatus.PENDING) {
      throw new AppError("Your verification is already pending review", 409);
    }
    if (existingVerification.status === VerificationStatus.VERIFIED) {
      throw new AppError("Your account is already verified", 409);
    }

    return prisma.userVerification.update({
      where: { userId },
      data: {
        idType,
        idNumber,
        status: VerificationStatus.PENDING,
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
      },
    });
  }

  return prisma.userVerification.create({
    data: {
      userId,
      idType,
      idNumber,
      status: VerificationStatus.PENDING,
    },
  });
};

export const getUserVerification = async (userId: string) => {
  return prisma.userVerification.findUnique({
    where: { userId },
    include: {
      document: {
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
};

export const approveUserVerification = async (
  verificationId: string,
  adminId: string,
) => {
  const verification = await prisma.userVerification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new AppError("User verification not found", 404);
  }

  if (verification.status !== VerificationStatus.PENDING) {
    throw new AppError("Only pending verifications can be approved", 409);
  }

  return prisma.userVerification.update({
    where: {
      id: verificationId,
    },
    data: {
      status: VerificationStatus.VERIFIED,
      reviewedAt: new Date(),
      rejectionReason: null,
      reviewer: {
        connect: {
          id: adminId,
        },
      },
    },
  });
};

export const rejectUserVerification = async (
  verificationId: string,
  adminId: string,
  rejectionReason: string,
) => {
  const verification = await prisma.userVerification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new AppError("User verification not found", 404);
  }

  if (verification.status !== VerificationStatus.PENDING) {
    throw new AppError("Only pending verifications can be rejected", 409);
  }

  return prisma.userVerification.update({
    where: { id: verificationId },
    data: {
      status: VerificationStatus.REJECTED,
      reviewedAt: new Date(),
      rejectionReason,
      reviewer: {
        connect: {
          id: adminId,
        },
      },
    },
  });
};
