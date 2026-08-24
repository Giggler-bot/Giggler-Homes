import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { authorizeListingOwner } from "../../middleware/authorizeListingOwner.js";

import {
  approveListingSchema,
  archiveListingSchema,
  createListingSchema,
  expireListingSchema,
  getListingsQuerySchema,
  markListingRentedSchema,
  markListingSoldSchema,
  rejectListingSchema,
  submitListingSchema,
  updateListingSchema,
} from "./listing.validation.js";
import {
  approveListingController,
  archiveListingController,
  createListingController,
  expireListingController,
  getActiveListingByIdController,
  getActiveListingsController,
  markListingRentedController,
  markListingSoldController,
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

listingRouter.post("/:listingId/expire",
  authenticate,
  authorizeRoles("ADMIN"),
  validateRequest(expireListingSchema),
  expireListingController,
)

listingRouter.post(
  "/:listingId/sold",
  authenticate,
  authorizeRoles("ADMIN"),
  validateRequest(markListingSoldSchema),
  markListingSoldController,
);

listingRouter.post(
  "/:listingId/rented",
  authenticate,
  authorizeRoles("ADMIN"),
  validateRequest(markListingRentedSchema),
  markListingRentedController,
);

listingRouter.post(
  "/:listingId/archive",
  authenticate,
  authorizeRoles("ADMIN"),
  validateRequest(archiveListingSchema),
  archiveListingController,
);

export default listingRouter;
