import { Request, Response } from "express";

import {
  uploadUserVerificationDocument,
  uploadOwnershipVerificationDocument,
  uploadBusinessVerificationDocument,
} from "../../services/verificationDocument.service.js";

import { AppError } from "../../common/errors/AppError.js";

export const uploadUserVerificationDocumentController = async (
  req: Request<{ verificationId: string }>,
  res: Response,
) => {
  if (!req.file) {
    throw new AppError("Verification document is required", 400);
  }

  const document = await uploadUserVerificationDocument({
    verificationId: req.params.verificationId,
    userId: req.user!.id,
    docType: req.body.docType,
    buffer: req.file.buffer,
  });

  res.status(201).json({
    success: true,
    data: {
      id: document.id,
      docType: document.docType,
      uploadedAt: document.uploadedAt,
    },
  });
};

export const uploadOwnershipVerificationDocumentController = async (
  req: Request<{ verificationId: string }>,
  res: Response,
) => {
  if (!req.file) {
    throw new AppError("Verification document is required", 400);
  }

  const document = await uploadOwnershipVerificationDocument({
    verificationId: req.params.verificationId,
    userId: req.user!.id,
    docType: req.body.docType,
    buffer: req.file.buffer,
  });

  res.status(201).json({
    success: true,
    data: {
      id: document.id,
      docType: document.docType,
      uploadedAt: document.uploadedAt,
    },
  });
};

export const uploadBusinessVerificationDocumentController = async (
  req: Request<{ verificationId: string }>,
  res: Response,
) => {
  if (!req.file) {
    throw new AppError("Verification document is required", 400);
  }

  const document = await uploadBusinessVerificationDocument({
    verificationId: req.params.verificationId,
    userId: req.user!.id,
    docType: req.body.docType,
    buffer: req.file.buffer,
  });

  res.status(201).json({
    success: true,
    data: {
      id: document.id,
      docType: document.docType,
      uploadedAt: document.uploadedAt,
    },
  });
};
