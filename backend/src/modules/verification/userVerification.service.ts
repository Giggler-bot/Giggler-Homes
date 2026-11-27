
import { prisma } from "../../lib/prisma.js";
import {
  VerificationStatus,
  VerificationDocumentType,
  VerificationAuditAction,
  VerificationAuditActorType,
  VerificationAuditKind,
  VerificationAuditReason,
} from "../../generated/prisma/enums.js";
import { AppError } from "../../common/errors/AppError.js";
import {
  encryptVerificationNumber,
  maskEncryptedVerificationNumber,
  decryptVerificationNumber,
} from "../../common/security/verificationEncryption.js";

import { createVerificationAuditLog } from "../../services/verification-audit.service.js";

// Never expose the encrypted database value through ordinary API responses.
const toSafeVerificationResponse = <T extends { idNumber: string }>(
  verification: T,
) => ({
  ...verification,
  idNumber: maskEncryptedVerificationNumber(verification.idNumber),
});

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

    const encryptedIdNumber = encryptVerificationNumber(idNumber);

    const verification = await prisma.userVerification.update({
      where: { userId },
      data: {
        idType,
        idNumber: encryptedIdNumber,
        status: VerificationStatus.PENDING,
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
      },
    });

    return toSafeVerificationResponse(verification);
  }

  const encryptedIdNumber = encryptVerificationNumber(idNumber);

  const verification = await prisma.userVerification.create({
    data: {
      userId,
      idType,
      idNumber: encryptedIdNumber,
      status: VerificationStatus.PENDING,
    },
  });

  return toSafeVerificationResponse(verification);
};

export const getUserVerification = async (userId: string) => {
  const verification = await prisma.userVerification.findUnique({
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

  if (!verification) {
    return null;
  }

  return toSafeVerificationResponse(verification);
};

export const approveUserVerification = async (
  verificationId: string,
  adminId: string,
  ipAddress: string | null,
  userAgent: string | null,
) => {
  const updatedVerification = await prisma.$transaction(async (tx) => {
    const result = await tx.userVerification.updateMany({
      where: {
        id: verificationId,
        status: VerificationStatus.PENDING,
      },
      data: {
        status: VerificationStatus.VERIFIED,
        reviewedAt: new Date(),
        rejectionReason: null,
        reviewedBy: adminId,
      },
    });

    if (result.count === 0) {
      const verification = await tx.userVerification.findUnique({
        where: { id: verificationId },
        select: { id: true },
      });

      if (!verification) {
        throw new AppError("User verification not found", 404);
      }

      throw new AppError(
        "Only pending verifications can be approved",
        409,
      );
    }

    const verification = await tx.userVerification.findUniqueOrThrow({
      where: { id: verificationId },
    });

    await createVerificationAuditLog(
      {
        actorId: adminId,
        actorType: VerificationAuditActorType.ADMIN,
        subjectUserId: verification.userId,
        verificationKind: VerificationAuditKind.USER,
        verificationId: verification.id,
        action: VerificationAuditAction.APPROVE,
        reason: VerificationAuditReason.REVIEW,
        ipAddress,
        userAgent,
      },
      tx,
    );

    return verification;
  });

  return toSafeVerificationResponse(updatedVerification);
};

export const rejectUserVerification = async (
  verificationId: string,
  adminId: string,
  rejectionReason: string,
  ipAddress: string | null,
  userAgent: string | null,
) => {
  const updatedVerification = await prisma.$transaction(async (tx) => {
    const result = await tx.userVerification.updateMany({
      where: {
        id: verificationId,
        status: VerificationStatus.PENDING,
      },
      data: {
        status: VerificationStatus.REJECTED,
        reviewedAt: new Date(),
        rejectionReason,
        reviewedBy: adminId,
      },
    });

    if (result.count === 0) {
      const verification = await tx.userVerification.findUnique({
        where: { id: verificationId },
        select: { id: true },
      });

      if (!verification) {
        throw new AppError("User verification not found", 404);
      }

      throw new AppError(
        "Only pending verifications can be rejected",
        409,
      );
    }

    const verification = await tx.userVerification.findUniqueOrThrow({
      where: { id: verificationId },
    });

    await createVerificationAuditLog(
      {
        actorId: adminId,
        actorType: VerificationAuditActorType.ADMIN,
        subjectUserId: verification.userId,
        verificationKind: VerificationAuditKind.USER,
        verificationId: verification.id,
        action: VerificationAuditAction.REJECT,
        reason: VerificationAuditReason.REVIEW,
        ipAddress,
        userAgent,
      },
      tx,
    );

    return verification;
  });

  return toSafeVerificationResponse(updatedVerification);
};


export const getAdminUserVerification = async (
  verificationId: string,
  adminId: string,
  ipAddress: string | null,
  userAgent: string | null,
) => {
  const verification = await prisma.$transaction(async (tx) => {
    const record = await tx.userVerification.findUnique({
      where: { id: verificationId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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

    if (!record) {
      throw new AppError("User verification not found", 404);
    }

    await createVerificationAuditLog(
      {
        actorId: adminId,
        actorType: VerificationAuditActorType.ADMIN,
        subjectUserId: record.userId,
        verificationKind: VerificationAuditKind.USER,
        verificationId: record.id,
        action: VerificationAuditAction.VIEW_DETAILS,
        reason: VerificationAuditReason.REVIEW,
        ipAddress,
        userAgent,
      },
      tx,
    );

    return record;
  });

  // Decrypt only after the audit transaction has committed.
  const decryptedIdNumber = decryptVerificationNumber(
    verification.idNumber,
  );

  return {
    ...verification,
    idNumber: decryptedIdNumber,
  };
};


export const getPendingUserVerifications = async (
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit;

  const [verifications, total] = await prisma.$transaction([
    prisma.userVerification.findMany({
      where: {
        status: VerificationStatus.PENDING,
      },
      select: {
        id: true,
        userId: true,
        idType: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        document: {
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
    prisma.userVerification.count({
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
