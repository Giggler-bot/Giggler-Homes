import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import {
  verificationIdSchema,
  rejectVerificationSchema,
} from "../verification/verification.validation.js";

import {
  approveUserVerificationController,
  rejectUserVerificationController,
  getAdminUserVerificationController,
  approveOwnershipVerificationController,
  rejectOwnershipVerificationController,
  approveBusinessVerificationController,
  rejectBusinessVerificationController,
  getPendingUserVerificationsController,
  getPendingOwnershipVerificationsController,
  getPendingBusinessVerificationsController,
} from "../verification/verification.controller.js";

import { getAdminDashboard } from "./admin.controller.js";

const adminRouter = Router();

// ==========================================
// Admin Authentication & Authorization
// ==========================================

adminRouter.use(authenticate, authorizeRoles("ADMIN"));

// ==========================================
// Admin Dashboard
// ==========================================

adminRouter.get("/dashboard", getAdminDashboard());

// ==========================================
// User Identity Verification Management
// ==========================================

// Get pending user verifications
adminRouter.get("/verifications/users", getPendingUserVerificationsController);

// Get individual user verification details
adminRouter.get(
  "/verifications/users/:verificationId",
  validateRequest(verificationIdSchema),
  getAdminUserVerificationController,
);

// Approve user verification
adminRouter.patch(
  "/verifications/users/:verificationId/approve",
  validateRequest(verificationIdSchema),
  approveUserVerificationController,
);

// Reject user verification
adminRouter.patch(
  "/verifications/users/:verificationId/reject",
  validateRequest(rejectVerificationSchema),
  rejectUserVerificationController,
);

// ==========================================
// Property Ownership Verification Management
// ==========================================

// Get pending ownership verification
adminRouter.get(
  "/verifications/ownership",
  getPendingOwnershipVerificationsController,
);

// Approve ownership verification
adminRouter.patch(
  "/verifications/ownership/:verificationId/approve",
  validateRequest(verificationIdSchema),
  approveOwnershipVerificationController,
);

// Reject ownership verification
adminRouter.patch(
  "/verifications/ownership/:verificationId/reject",
  validateRequest(rejectVerificationSchema),
  rejectOwnershipVerificationController,
);

// ==========================================
// Business Verification Management
// ==========================================

// Get pending business verification
adminRouter.get(
  "/verifications/business",
  getPendingBusinessVerificationsController,
);

// Approve business verification
adminRouter.patch(
  "/verifications/business/:verificationId/approve",
  validateRequest(verificationIdSchema),
  approveBusinessVerificationController,
);

// Reject business verification
adminRouter.patch(
  "/verifications/business/:verificationId/reject",
  validateRequest(rejectVerificationSchema),
  rejectBusinessVerificationController,
);

export default adminRouter;
