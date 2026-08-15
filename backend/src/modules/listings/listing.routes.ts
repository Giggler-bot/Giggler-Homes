import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import {
  createListingSchema,
  getListingsQuerySchema,
  updateListingSchema,
} from "./listing.validation.js";
import {
  createListingController,
  getActiveListingByIdController,
  getActiveListingsController,
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
  updateListingController,
);

export default listingRouter;
