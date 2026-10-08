import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  createBusinessVerificationSchema,
  createOwnershipVerificationSchema,
  createUserVerificationSchema,
  ownershipPropertyIdSchema,
  rejectVerificationSchema,
  verificationDocumentUploadSchema,
  verificationIdSchema,
} from "./verification.validation.js";
import {
  approveBusinessVerificationController,
  approveOwnershipVerificationController,
  approveUserVerificationController,
  createBusinessVerificationController,
  createOwnershipVerificationController,
  createUserVerificationController,
  getBusinessVerificationController,
  getOwnershipVerificationController,
  getUserVerificationController,
  rejectBusinessVerificationController,
  rejectOwnershipVerificationController,
  rejectUserVerificationController,
} from "./verification.controller.js";

import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { verificationUpload } from "../../middleware/verificationUpload.js";
import { uploadBusinessVerificationDocumentController, uploadOwnershipVerificationDocumentController, uploadUserVerificationDocumentController } from "./verificationDocument.controller.js";

const verificationRouter = Router();

verificationRouter.use(authenticate);

// User Verification Routes
verificationRouter.post(
  "/user",
  validateRequest(createUserVerificationSchema),
  createUserVerificationController,
);

verificationRouter.get("/user/me", getUserVerificationController);

// owner Verification Routes
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

// Business Verification Routes
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

// verification document upload
    // user
verificationRouter.post(
  "/user/:verificationId/documents",
  verificationUpload.single("file"),
  validateRequest(verificationDocumentUploadSchema),
  uploadUserVerificationDocumentController,
);

    // ownership
verificationRouter.post(
  "/ownership/:verificationId/documents",
  verificationUpload.single("file"),
  validateRequest(verificationDocumentUploadSchema),
  uploadOwnershipVerificationDocumentController,
);

verificationRouter.post(
  "/business/:verificationId/documents",
  verificationUpload.single("file"),
  validateRequest(verificationDocumentUploadSchema),
  uploadBusinessVerificationDocumentController,
);

// Admin Routes
    // user
verificationRouter.patch(
  "/user/:verificationId/approve",
  authorizeRoles("ADMIN"),
  validateRequest(verificationIdSchema),
  approveUserVerificationController,
);

verificationRouter.patch(
  "/user/:verificationId/reject",
  authorizeRoles("ADMIN"),
  validateRequest(rejectVerificationSchema),
  rejectUserVerificationController,
);

    // owner
verificationRouter.patch(
  "/ownership/:verificationId/approve",
  authorizeRoles("ADMIN"),
  validateRequest(verificationIdSchema),
  approveOwnershipVerificationController,
);

verificationRouter.patch(
  "/ownership/:verificationId/reject",
  authorizeRoles("ADMIN"),
  validateRequest(rejectVerificationSchema),
  rejectOwnershipVerificationController,
);

    // business
verificationRouter.patch(
  "/business/:verificationId/approve",
  authorizeRoles("ADMIN"),
  validateRequest(verificationIdSchema),
  approveBusinessVerificationController,
);

verificationRouter.patch(
  "/business/:verificationId/reject",
  authorizeRoles("ADMIN"),
  validateRequest(rejectVerificationSchema),
  rejectBusinessVerificationController,
);

export default verificationRouter;