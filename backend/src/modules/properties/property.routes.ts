import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { authorizepropertyOwner } from "../../middleware/authorizePropertyOwner.js";

import { createPropertycontroller, updatePropertyAvailabilityController } from "./property.controller.js";

import { validateRequest } from "../../middleware/validateRequest.js";
import { createPropertySchema, updatePropertyAvailabilitySchema } from "./property.validation.js";

import { getPropertyMediaController } from "../media/media.controller.js";
import { getPropertyMediaSchema } from "../media/media.validation.js";

const propertyRouter = Router();

propertyRouter.post(
  "/",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(createPropertySchema),
  createPropertycontroller,
);

propertyRouter.patch(
  "/:propertyId",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  authorizepropertyOwner(),
);

propertyRouter.patch(
  "/:propertyId/availability",
  authenticate,
  authorizeRoles(
    "OWNER",
    "AGENCY",
    "HOTEL",
    "ADMIN",
  ),
  validateRequest(updatePropertyAvailabilitySchema),
  authorizepropertyOwner(),
  updatePropertyAvailabilityController,
);

propertyRouter.get(
  "/:propertyId/media",
  validateRequest(getPropertyMediaSchema),
  getPropertyMediaController,
);

export default propertyRouter;
