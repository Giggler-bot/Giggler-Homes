
import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { validateVerificationFile } from "../../middleware/validateVerificationFile.js";
import { verificationUpload } from "../../middleware/verificationUpload.js";

import {
  createBusinessVerificationSchema,
  createOwnershipVerificationSchema,
  createUserVerificationSchema,
  ownershipPropertyIdSchema,
  verificationDocumentUploadSchema,
  getVerificationDocumentSchema,
} from "./verification.validation.js";

import {
  createBusinessVerificationController,
  createOwnershipVerificationController,
  createUserVerificationController,
  getBusinessVerificationController,
  getOwnershipVerificationController,
  getUserVerificationController,
} from "./verification.controller.js";

import {
  uploadBusinessVerificationDocumentController,
  uploadOwnershipVerificationDocumentController,
  uploadUserVerificationDocumentController,
  getVerificationDocumentController,
} from "./verificationDocument.controller.js";

const verificationRouter = Router();

verificationRouter.use(authenticate);

// ==========================================
// User Verification Routes
// ==========================================

verificationRouter.post(
  "/user",
  validateRequest(createUserVerificationSchema),
  createUserVerificationController,
);

verificationRouter.get(
  "/user/me",
  getUserVerificationController,
);

// ==========================================
// Ownership Verification Routes
// ==========================================

verificationRouter.post(
  "/ownership/properties/:propertyId",
  validateRequest(createOwnershipVerificationSchema),
  createOwnershipVerificationController,
);

verificationRouter.get(
  "/ownership/properties/:propertyId",
  validateRequest(ownershipPropertyIdSchema),
  getOwnershipVerificationController,
);

// ==========================================
// Business Verification Routes
// ==========================================

verificationRouter.post(
  "/business",
  authorizeRoles("AGENCY", "HOTEL"),
  validateRequest(createBusinessVerificationSchema),
  createBusinessVerificationController,
);

verificationRouter.get(
  "/business/me",
  authorizeRoles("AGENCY", "HOTEL"),
  getBusinessVerificationController,
);

// ==========================================
// Verification Document Upload Routes
// ==========================================

// User identity documents
verificationRouter.post(
  "/user/:verificationId/documents",
  verificationUpload.single("file"),
  validateRequest(verificationDocumentUploadSchema),
  validateVerificationFile,
  uploadUserVerificationDocumentController,
);

// Property ownership documents
verificationRouter.post(
  "/ownership/:verificationId/documents",
  verificationUpload.single("file"),
  validateRequest(verificationDocumentUploadSchema),
  validateVerificationFile,
  uploadOwnershipVerificationDocumentController,
);

// Business verification documents
verificationRouter.post(
  "/business/:verificationId/documents",
  verificationUpload.single("file"),
  validateRequest(verificationDocumentUploadSchema),
  validateVerificationFile,
  uploadBusinessVerificationDocumentController,
);

// ==========================================
// Secure Document Retrieval
// ==========================================

verificationRouter.get(
  "/documents/:documentId",
  validateRequest(getVerificationDocumentSchema),
  getVerificationDocumentController,
);

export default verificationRouter;
