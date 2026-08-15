import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { createListingSchema, getListingsQuerySchema } from "./listing.validation.js";
import { createListingController, getActiveListingByIdController, getActiveListingsController } from "./listing.controller.js";


const listingRouter = Router();

listingRouter.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "AGENCY", "HOTEL", "OWNER"),
  validateRequest(createListingSchema),
 createListingController,
);

listingRouter.get("/", validateRequest(getListingsQuerySchema),  getActiveListingsController);

listingRouter.get("/:listingId", getActiveListingByIdController,)

export default listingRouter;