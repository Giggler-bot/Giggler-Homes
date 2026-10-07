import { prisma } from "../../lib/prisma.js";
import {
  VerificationStatus,
  VerificationDocumentType,
} from "../../generated/prisma/enums.js";
import { AppError } from "../../common/errors/AppError.js";

export const createOwnershipVerification = async (
  propertyId: string,
  submittedById: string,
  proofType: VerificationDocumentType,
) => {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.ownerId !== submittedById) {
    throw new AppError(
      "You are not authorized to submit ownership verification for this property",
      403,
    );
  }

  const existingVerification = await prisma.ownershipVerification.findUnique({
    where: { propertyId },
  });

  if (existingVerification) {
    if (existingVerification.status === VerificationStatus.PENDING) {
      throw new AppError(
        "Ownership verification is already pending review",
        409,
      );
    }

    if (existingVerification.status === VerificationStatus.VERIFIED) {
      throw new AppError("This property is already ownership verified", 409);
    }

    return prisma.ownershipVerification.update({
      where: { propertyId },
      data: {
        submittedById,
        proofType,
        status: VerificationStatus.PENDING,
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
      },
    });
  }

  return prisma.ownershipVerification.create({
    data: {
      propertyId,
      submittedById,
      proofType,
      status: VerificationStatus.PENDING,
    },
  });
};

export const getOwnershipVerification = async (
  propertyId: string,
  userId: string,
  isAdmin: boolean,
) => {
  const verification = await prisma.ownershipVerification.findUnique({
    where: {
      propertyId,
    },
    include: {
      property: {
        select: {
          id: true,
          ownerId: true,
        },
      },
      documents: {
        select: {
          id: true,
          docType: true,
          uploadedAt: true,
        },
      },
      submittedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
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
    throw new AppError("Ownership verification not found", 404);
  }

  if (!isAdmin && verification.property.ownerId !== userId) {
    throw new AppError(
      "You are not authorized to view this ownership verification",
      403,
    );
  }

  return verification;
};


export const approveOwnershipVerification = async (
  verificationId: string,
  adminId: string,
) => {
  const verification =
    await prisma.ownershipVerification.findUnique({
      where: { id: verificationId },
    });

  if (!verification) {
    throw new AppError(
      "Ownership verification not found",
      404,
    );
  }

  if (verification.status !== VerificationStatus.PENDING) {
    throw new AppError(
      "Only pending ownership verifications can be approved",
      409,
    );
  }

  return prisma.ownershipVerification.update({
    where: { id: verificationId },
    data: {
      status: VerificationStatus.VERIFIED,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason: null,
    },
  });
};

export const rejectOwnershipVerification = async (
  verificationId: string,
  adminId: string,
  rejectionReason: string,
) => {
  const verification =
    await prisma.ownershipVerification.findUnique({
      where: { id: verificationId },
    });

  if (!verification) {
    throw new AppError(
      "Ownership verification not found",
      404,
    );
  }

  if (verification.status !== VerificationStatus.PENDING) {
    throw new AppError(
      "Only pending ownership verifications can be rejected",
      409,
    );
  }

  return prisma.ownershipVerification.update({
    where: { id: verificationId },
    data: {
      status: VerificationStatus.REJECTED,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason,
    },
  });
};