import crypto from "crypto";
import { Readable } from "stream";

import { v2 as cloudinary } from "cloudinary";

import { AppError } from "../common/errors/AppError.js";
import { prisma } from "../lib/prisma.js";
import { VerificationDocumentType } from "../generated/prisma/enums.js";

type VerificationDocumentParent =
  | {
      type: "USER";
      verificationId: string;
    }
  | {
      type: "OWNERSHIP";
      verificationId: string;
    }
  | {
      type: "BUSINESS";
      verificationId: string;
    };

interface UploadVerificationDocumentParams {
  buffer: Buffer;
}

interface UploadedVerificationDocument {
  storageKey: string;
  resourceType: string;
  format?: string;
}

interface CreateVerificationDocumentParams {
  parent: VerificationDocumentParent;
  docType: VerificationDocumentType;
  storageKey: string;
  fileUrl?: string;
}

interface UploadAndCreateVerificationDocumentParams {
  parent: VerificationDocumentParent;
  docType: VerificationDocumentType;
  buffer: Buffer;
}

const allowedDocumentTypes = {
  USER: ["NATIONAL_ID", "PASSPORT", "VOTERS_ID", "DRIVERS_LICENSE"],

  OWNERSHIP: ["PROPERTY_DEED", "UTILITY_BILL", "LEASE_AGREEMENT"],

  BUSINESS: ["BUSINESS_REGISTRATION"],
} as const;

const isAllowedDocumentType = (
  verificationType: VerificationDocumentParent["type"],
  docType: VerificationDocumentType,
): boolean => {
  return (allowedDocumentTypes[verificationType] as readonly string[]).includes(
    docType,
  );
};

/**
 * Upload a verification document to private Cloudinary storage.
 *
 * Verification documents are stored as:
 * - resource_type: raw
 * - type: authenticated
 *
 * The returned storageKey is the internal Cloudinary identifier.
 * No public URL is returned.
 */
export const uploadVerificationDocument = async ({
  buffer,
}: UploadVerificationDocumentParams): Promise<UploadedVerificationDocument> => {
  const storageKey = `giggler-homes/verifications/${crypto.randomUUID()}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: storageKey,
        resource_type: "raw",
        type: "authenticated",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(new Error("Cloudinary upload returned no result"));
        }

        resolve({
          storageKey: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
        });
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

/**
 * Delete a verification document from private Cloudinary storage.
 */
export const deleteVerificationDocument = async (
  storageKey: string,
): Promise<void> => {
  await cloudinary.uploader.destroy(storageKey, {
    resource_type: "raw",
    type: "authenticated",
  });
};

/**
 * Create the VerificationDocument database record.
 *
 * Exactly one verification parent is assigned based on the
 * parent.type discriminator.
 */
export const createVerificationDocument = async ({
  parent,
  docType,
  storageKey,
  fileUrl,
}: CreateVerificationDocumentParams) => {
  if (!isAllowedDocumentType(parent.type, docType)) {
    throw new AppError(
      "Document type is not allowed for this verification",
      400,
    );
  }

  const data = {
    storageKey,
    fileUrl: fileUrl ?? null,
    docType,

    ...(parent.type === "USER"
      ? {
          userVerificationId: parent.verificationId,
        }
      : {}),

    ...(parent.type === "OWNERSHIP"
      ? {
          ownershipVerificationId: parent.verificationId,
        }
      : {}),

    ...(parent.type === "BUSINESS"
      ? {
          businessVerificationId: parent.verificationId,
        }
      : {}),
  };

  return prisma.verificationDocument.create({
    data,
  });
};

/**
 * Upload a document to Cloudinary and then create its
 * VerificationDocument database record.
 *
 * If Cloudinary succeeds but Prisma fails, the uploaded
 * Cloudinary object is deleted to prevent orphaned files.
 */
export const uploadAndCreateVerificationDocument = async ({
  parent,
  docType,
  buffer,
}: UploadAndCreateVerificationDocumentParams) => {
  if (!isAllowedDocumentType(parent.type, docType)) {
    throw new AppError(
      "Document type is not allowed for this verification",
      400,
    );
  }

  const uploaded = await uploadVerificationDocument({
    buffer,
  });

  try {
    const document = await createVerificationDocument({
      parent,
      docType,
      storageKey: uploaded.storageKey,
    });

    return document;
  } catch (error) {
    try {
      await deleteVerificationDocument(uploaded.storageKey);
    } catch (cleanupError) {
      console.error(
        "Failed to clean up verification document after database failure",
        {
          storageKey: uploaded.storageKey,
          error: cleanupError,
        },
      );
    }

    throw error;
  }
};

export const authorizeUserVerificationDocumentUpload = async (
  verificationId: string,
  userId: string,
) => {
  const verification = await prisma.userVerification.findUnique({
    where: { id: verificationId },
    select: {
      id: true,
      userId: true,
      status: true,
    },
  });

  if (!verification) {
    throw new AppError("User verification not found", 404);
  }

  if (verification.userId !== userId) {
    throw new AppError(
      "Unauthorized to upload document for this verification",
      403,
    );
  }

  if (verification.status !== "PENDING") {
    throw new AppError(
      "Documents can only be uploaded while verification is pending",
      409,
    );
  }

  return verification;
};

export const authorizeOwnershipVerificationDocumentUpload = async (
  verificationId: string,
  userId: string,
) => {
  const verification = await prisma.ownershipVerification.findUnique({
    where: { id: verificationId },
    include: {
      property: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!verification) {
    throw new AppError("Ownership verification not found", 404);
  }

  if (verification.property.ownerId !== userId) {
    throw new AppError(
      "You are not authorized to upload documents for this verification",
      403,
    );
  }

  if (verification.status !== "PENDING") {
    throw new AppError(
      "Documents can only be uploaded while verification is pending",
      409,
    );
  }

  return verification;
};

export const authorizeBusinessVerificationDocumentUpload = async (
  verificationId: string,
  userId: string,
) => {
  const verification = await prisma.businessVerification.findUnique({
    where: { id: verificationId },
    select: {
      id: true,
      ownerId: true,
      status: true,
    },
  });

  if (!verification) {
    throw new AppError("Business verification not found", 404);
  }

  if (verification.ownerId !== userId) {
    throw new AppError(
      "You are not authorized to upload documents for this verification",
      403,
    );
  }

  if (verification.status !== "PENDING") {
    throw new AppError(
      "Documents can only be uploaded while verification is pending",
      409,
    );
  }

  return verification;
};

export const uploadUserVerificationDocument = async ({
  verificationId,
  userId,
  docType,
  buffer,
}: {
  verificationId: string;
  userId: string;
  docType: VerificationDocumentType;
  buffer: Buffer;
}) => {
  await authorizeUserVerificationDocumentUpload(verificationId, userId);

  return uploadAndCreateVerificationDocument({
    parent: {
      type: "USER",
      verificationId,
    },
    docType,
    buffer,
  });
};

export const uploadOwnershipVerificationDocument = async ({
  verificationId,
  userId,
  docType,
  buffer,
}: {
  verificationId: string;
  userId: string;
  docType: VerificationDocumentType;
  buffer: Buffer;
}) => {
  await authorizeOwnershipVerificationDocumentUpload(
    verificationId,
    userId,
  );

  return uploadAndCreateVerificationDocument({
    parent: {
      type: "OWNERSHIP",
      verificationId,
    },
    docType,
    buffer,
  });
};

export const uploadBusinessVerificationDocument = async ({
  verificationId,
  userId,
  docType,
  buffer,
}: {
  verificationId: string;
  userId: string;
  docType: VerificationDocumentType;
  buffer: Buffer;
}) => {
  await authorizeBusinessVerificationDocumentUpload(
    verificationId,
    userId,
  );

  return uploadAndCreateVerificationDocument({
    parent: {
      type: "BUSINESS",
      verificationId,
    },
    docType,
    buffer,
  });
};