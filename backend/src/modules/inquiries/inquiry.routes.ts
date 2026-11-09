import { Router } from "express";

import { validateRequest } from "../../middleware/validateRequest.js";
import { authenticate } from "../../middleware/authenticate.js";
import {
  createInquirySchema,
  inquiryIdSchema,
  listInquiriesSchema,
} from "./inquiry.validation.js";
import {
  closeInquiryController,
  createInquiryController,
  getInquiryByIdController,
  getReceivedInquriesController,
  getSentInquriesController,
  respondToInquiryController,
} from "./inquiry.controller.js";

const inquiryRouter = Router();

inquiryRouter.use(authenticate);

inquiryRouter.post(
  "/listings/:listingId",
  validateRequest(createInquirySchema),
  createInquiryController,
);

inquiryRouter.get(
  "/sent",
  validateRequest(listInquiriesSchema),
  getSentInquriesController,
);

inquiryRouter.get(
  "/received",
  validateRequest(listInquiriesSchema),
  getReceivedInquriesController,
);

inquiryRouter.get(
  "/:inquiryId",
  validateRequest(inquiryIdSchema),
  getInquiryByIdController,
);

inquiryRouter.patch(
  "/:inquiryId/respond",
  validateRequest(inquiryIdSchema),
  respondToInquiryController,
);

inquiryRouter.patch(
  "/:inquiryId/close",
  validateRequest(inquiryIdSchema),
  closeInquiryController,
);

export default inquiryRouter;
