import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { authorizeListingOwner } from "../../middleware/authorizeListingOwner.js";

import {
  approveListingSchema,
  createListingSchema,
  getListingsQuerySchema,
  rejectListingSchema,
  submitListingSchema,
  updateListingSchema,
} from "./listing.validation.js";
import {
  approveListingController,
  createListingController,
  getActiveListingByIdController,
  getActiveListingsController,
  rejectListingController,
  submitListingController,
  updateListingController,
} from "./listing.controller.js";

const listingRouter = Router();

listingRouter.get(
  "/",
  validateRequest(getListingsQuerySchema),
  getActiveListingsController,
);

listingRouter.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "AGENCY", "HOTEL", "OWNER"),
  validateRequest(createListingSchema),
  createListingController,
);

listingRouter.get("/:listingId", getActiveListingByIdController);

listingRouter.patch(
  "/:listingId",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(updateListingSchema),
  authorizeListingOwner(),
  updateListingController,
);

listingRouter.post(
  "/:listingId/submit",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL"),
  validateRequest(submitListingSchema),
  authorizeListingOwner(),
  submitListingController,
);

listingRouter.post(
  "/:listingId/approve",
  authenticate,
  authorizeRoles("ADMIN"),
  validateRequest(approveListingSchema),
  approveListingController,
);

listingRouter.post(
  "/:listingId/reject",
  authenticate,
  authorizeRoles("ADMIN"),
  validateRequest(rejectListingSchema),
  rejectListingController,
);

export default listingRouter;
