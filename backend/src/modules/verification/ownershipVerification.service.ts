import { prisma } from "../../lib/prisma.js";
import {
  VerificationStatus,
  VerificationDocumentType,
  VerificationAuditAction,
  VerificationAuditActorType,
  VerificationAuditKind,
  VerificationAuditReason,
} from "../../generated/prisma/enums.js";
import { createVerificationAuditLog } from "../../services/verification-audit.service.js";

import { AppError } from "../../common/errors/AppError.js";

export const createOwnershipVerification = async (
  propertyId: string,
  submittedById: string,
  proofType: VerificationDocumentType,
) => {
  return prisma.$transaction(async (tx) => {
    // Lock the property row to prevent concurrent soft deletion.
    const properties = await tx.$queryRaw<
      {
        id: string;
        ownerId: string;
        deletedAt: Date | null;
      }[]
    >`
      SELECT "id", "ownerId", "deletedAt"
      FROM "Property"
      WHERE "id" = ${propertyId}
      FOR UPDATE
    `;

    const property = properties[0];

    if (!property) {
      throw new AppError("Property not found", 404);
    }

    if (property.deletedAt) {
      throw new AppError(
        "Cannot submit ownership verification for a deleted property",
        404,
      );
    }

    if (property.ownerId !== submittedById) {
      throw new AppError(
        "You are not authorized to submit ownership verification for this property",
        403,
      );
    }

    const existingVerification = await tx.ownershipVerification.findUnique({
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

      return tx.ownershipVerification.update({
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

    return tx.ownershipVerification.create({
      data: {
        propertyId,
        submittedById,
        proofType,
        status: VerificationStatus.PENDING,
      },
    });
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
  ipAddress: string | null,
  userAgent: string | null,
) => {
  return prisma.$transaction(async (tx) => {
    const result = await tx.ownershipVerification.updateMany({
      where: {
        id: verificationId,
        status: VerificationStatus.PENDING,
      },
      data: {
        status: VerificationStatus.VERIFIED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: null,
      },
    });

    if (result.count === 0) {
      const verification = await tx.ownershipVerification.findUnique({
        where: { id: verificationId },
        select: { id: true },
      });

      if (!verification) {
        throw new AppError("Ownership verification not found", 404);
      }

      throw new AppError(
        "Only pending ownership verifications can be approved",
        409,
      );
    }

    const verification = await tx.ownershipVerification.findUniqueOrThrow({
      where: { id: verificationId },
      include: {
        property: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    await createVerificationAuditLog(
      {
        actorId: adminId,
        actorType: VerificationAuditActorType.ADMIN,
        subjectUserId: verification.property.ownerId,
        verificationKind: VerificationAuditKind.OWNERSHIP,
        verificationId: verification.id,
        action: VerificationAuditAction.APPROVE,
        reason: VerificationAuditReason.REVIEW,
        ipAddress,
        userAgent,
      },
      tx,
    );

    // Preserve the original response structure.
    const { property, ...updatedVerification } = verification;
    return updatedVerification;
  });
};

export const rejectOwnershipVerification = async (
  verificationId: string,
  adminId: string,
  rejectionReason: string,
  ipAddress: string | null,
  userAgent: string | null,
) => {
  return prisma.$transaction(async (tx) => {
    const result = await tx.ownershipVerification.updateMany({
      where: {
        id: verificationId,
        status: VerificationStatus.PENDING,
      },
      data: {
        status: VerificationStatus.REJECTED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason,
      },
    });

    if (result.count === 0) {
      const verification = await tx.ownershipVerification.findUnique({
        where: { id: verificationId },
        select: { id: true },
      });

      if (!verification) {
        throw new AppError("Ownership verification not found", 404);
      }

      throw new AppError(
        "Only pending ownership verifications can be rejected",
        409,
      );
    }

    const verification = await tx.ownershipVerification.findUniqueOrThrow({
      where: { id: verificationId },
      include: {
        property: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    await createVerificationAuditLog(
      {
        actorId: adminId,
        actorType: VerificationAuditActorType.ADMIN,
        subjectUserId: verification.property.ownerId,
        verificationKind: VerificationAuditKind.OWNERSHIP,
        verificationId: verification.id,
        action: VerificationAuditAction.REJECT,
        reason: VerificationAuditReason.REVIEW,
        ipAddress,
        userAgent,
      },
      tx,
    );

    // Preserve the original response structure.
    const { property, ...updatedVerification } = verification;
    return updatedVerification;
  });
};


export const getPendingOwnershipVerifications = async (
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit;

  const [verifications, total] = await prisma.$transaction([
    prisma.ownershipVerification.findMany({
      where: {
        status: VerificationStatus.PENDING,
      },
      select: {
        id: true,
        propertyId: true,
        submittedById: true,
        proofType: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        property: {
          select: {
            id: true,
            title: true,
            ownerId: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        documents: {
          select: {
            id: true,
            docType: true,
            uploadedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      skip,
      take: limit,
    }),
    prisma.ownershipVerification.count({
      where: {
        status: VerificationStatus.PENDING,
      },
    }),
  ]);

  return {
    verifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAdminOwnershipVerification = async (
  verificationId: string,
  adminId: string,
  ipAddress: string | null,
  userAgent: string | null,
) => {
  return prisma.$transaction(async (tx) => {
    const verification = await tx.ownershipVerification.findUnique({
      where: {
        id: verificationId,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            description: true,
            ownerId: true,
            location: {
              select: {
                id: true,
                region: true,
                district: true,
                area: true,
                landmark: true,
              },
            },
          },
        },
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        documents: {
          select: {
            id: true,
            docType: true,
            format: true,
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
      throw new AppError("Ownership verification not found", 404);
    }

    await createVerificationAuditLog(
      {
        actorId: adminId,
        actorType: VerificationAuditActorType.ADMIN,
        subjectUserId: verification.property.ownerId,
        verificationKind: VerificationAuditKind.OWNERSHIP,
        verificationId: verification.id,
        action: VerificationAuditAction.VIEW_DETAILS,
        reason: VerificationAuditReason.REVIEW,
        ipAddress,
        userAgent,
      },
      tx,
    );

    return verification;
  });
};