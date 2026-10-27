import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  createListingReportSchema,
  listReportsSchema,
  reportIdSchema,
} from "./report.validation.js";
import {
  createReportController,
  getMyReportByIdController,
  getMyReportsController,
} from "./report.controller.js";

const reportRouter = Router();

reportRouter.use(authenticate);

reportRouter.post(
  "/listings/:listingId",
  validateRequest(createListingReportSchema),
  createReportController,
);

reportRouter.get(
  "/me",
  validateRequest(listReportsSchema),
  getMyReportsController,
);


reportRouter.get(
    "/me/:reportId",
    validateRequest(reportIdSchema),
    getMyReportByIdController,
)

export default reportRouter;