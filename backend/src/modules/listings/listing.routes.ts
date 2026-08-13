import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { createListingSchema } from "./listing.validation.js";
import { createListingController, getActiveListingsController } from "./listing.controller.js";


const listingRouter = Router();

listingRouter.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "AGENCY", "HOTEL", "OWNER"),
  validateRequest(createListingSchema),
 createListingController,
);

listingRouter.get("/", getActiveListingsController)

export default listingRouter;