import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  createModerationActionSchema,
  listReportsSchema,
  reportIdSchema,
} from "./report.validation.js";
import {
  createModerationActionController,
  dismissReportController,
  getAdminReportByIdController,
  getAdminReportQueueController,
  getModerationHistoryController,
  resolveReportController,
  startReportReviewController,
} from "./report.controller.js";


const adminReportRouter = Router();

adminReportRouter.use(authenticate, authorizeRoles("ADMIN"));

// View the moderation queue
adminReportRouter.get(
  "/",
  validateRequest(listReportsSchema),
  getAdminReportQueueController,
);

// Review a specific report
adminReportRouter.get(
  "/:reportId",
  validateRequest(reportIdSchema),
  getAdminReportByIdController,
);

// Move a pending report into review
adminReportRouter.patch(
  "/:reportId/review",
  validateRequest(reportIdSchema),
  startReportReviewController,
);

// Ressolve a report without automatically changing listing status
adminReportRouter.patch(
  "/:reportId/resolve",
  validateRequest(reportIdSchema),
  resolveReportController,
);

// Dissmiss a report
adminReportRouter.patch(
  "/:reportId/dismiss",
  validateRequest(reportIdSchema),
  dismissReportController,
);

// Apply and record a moderation action
adminReportRouter.post(
  "/:reportId/actions",
  validateRequest(createModerationActionSchema),
  createModerationActionController,
);

// View the moderation audit history for a report
adminReportRouter.get(
  "/:reportId/history",
  validateRequest(reportIdSchema),
  getModerationHistoryController,
);

export default adminReportRouter;
