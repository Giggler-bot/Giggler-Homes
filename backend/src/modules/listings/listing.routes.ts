import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { createListingSchema } from "./listing.validation.js";


const listingRouter = Router();

listingRouter.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "AGENCY", "HOTEL", "OWNER"),
  validateRequest(createListingSchema),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Listing validation passed",
      data: req.body,
    });
  },
);


export default listingRouter;