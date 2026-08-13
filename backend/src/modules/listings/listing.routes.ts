import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { createListingSchema } from "./listing.validation.js";
import { createListingController, getActiveListingByIdController, getActiveListingsController } from "./listing.controller.js";


const listingRouter = Router();

listingRouter.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "AGENCY", "HOTEL", "OWNER"),
  validateRequest(createListingSchema),
 createListingController,
);

listingRouter.get("/", getActiveListingsController);

listingRouter.get("/:listingId", getActiveListingByIdController,)

export default listingRouter;