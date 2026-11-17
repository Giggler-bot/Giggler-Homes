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

interface UploadAndCreateVerificationDocumentParams {
  parent: VerificationDocumentParent;
  userId: string,
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


const authorizeVerificationDocumentUploadInTransaction = async (
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  parent: VerificationDocumentParent,
  userId: string,
) => {
  if (parent.type === "USER") {
    const lockedRows = await tx.$queryRaw<{ id: string }[]>`
      SELECT "id"
      FROM "userVerification"
      WHERE "id" = ${parent.verificationId}
      FOR UPDATE
    `;

    if (lockedRows.length === 0) {
      throw new AppError("User verification not found", 404);
    }

    const verification = await tx.userVerification.findUnique({
      where: { id: parent.verificationId },
      select: {
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

    return;
  }

  if (parent.type === "OWNERSHIP") {
    // Read the property ID so we can acquire locks in a consistent order:
    // Property first, then OwnershipVerification.
    const initialVerification =
      await tx.ownershipVerification.findUnique({
        where: { id: parent.verificationId },
        select: { propertyId: true },
      });

    if (!initialVerification) {
      throw new AppError("Ownership verification not found", 404);
    }

    const lockedProperties = await tx.$queryRaw<{ id: string }[]>`
      SELECT "id"
      FROM "Property"
      WHERE "id" = ${initialVerification.propertyId}
      FOR UPDATE
    `;

    if (lockedProperties.length === 0) {
      throw new AppError("Property not found", 404);
    }

    const lockedVerifications = await tx.$queryRaw<{ id: string }[]>`
      SELECT "id"
      FROM "OwnershipVerification"
      WHERE "id" = ${parent.verificationId}
      FOR UPDATE
    `;

    if (lockedVerifications.length === 0) {
      throw new AppError("Ownership verification not found", 404);
    }

    const verification = await tx.ownershipVerification.findUnique({
      where: { id: parent.verificationId },
      include: {
        property: {
          select: {
            ownerId: true,
            deletedAt: true,
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

    if (verification.property.deletedAt) {
      throw new AppError(
        "Cannot upload documents for a deleted property",
        404,
      );
    }

    if (verification.status !== "PENDING") {
      throw new AppError(
        "Documents can only be uploaded while verification is pending",
        409,
      );
    }

    return;
  }

  const lockedRows = await tx.$queryRaw<{ id: string }[]>`
    SELECT "id"
    FROM "BusinessVerification"
    WHERE "id" = ${parent.verificationId}
    FOR UPDATE
  `;

  if (lockedRows.length === 0) {
    throw new AppError("Business verification not found", 404);
  }

  const verification = await tx.businessVerification.findUnique({
    where: { id: parent.verificationId },
    select: {
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
 * Upload a document to Cloudinary and then create its
 * VerificationDocument database record.
 *
 * If Cloudinary succeeds but Prisma fails, the uploaded
 * Cloudinary object is deleted to prevent orphaned files.
 */

export const uploadAndCreateVerificationDocument = async ({
  parent,
  userId,
  docType,
  buffer,
}: UploadAndCreateVerificationDocumentParams) => {
  if (!isAllowedDocumentType(parent.type, docType)) {
    throw new AppError(
      "Document type is not allowed for this verification",
      400,
    );
  }

  // Cloudinary upload happens before opening the database transaction.
  const uploaded = await uploadVerificationDocument({ buffer });


  try {
    const document = await prisma.$transaction(
      async (tx) => {
        // Recheck authorization while holding the relevant row locks.
        await authorizeVerificationDocumentUploadInTransaction(
          tx,
          parent,
          userId,
        );

        const data = {
          storageKey: uploaded.storageKey,
          fileUrl: null,
          docType,

          ...(parent.type === "USER"
            ? { userVerificationId: parent.verificationId }
            : {}),

          ...(parent.type === "OWNERSHIP"
            ? { ownershipVerificationId: parent.verificationId }
            : {}),

          ...(parent.type === "BUSINESS"
            ? { businessVerificationId: parent.verificationId }
            : {}),
        };

        return tx.verificationDocument.create({ data });
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );

    return document;
  } catch (error) {
    // The upload succeeded, but the database operation failed.
    // Remove the Cloudinary asset to prevent an orphaned file.
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
          deletedAt: true,
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

  if (verification.property.deletedAt) {
    throw new AppError(
      "Cannot upload documents for a deleted property",
      404,
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
    userId,
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
    userId,
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
    userId,
    docType,
    buffer,
  });
};