import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { authorizepropertyOwner } from "../../middleware/authorizePropertyOwner.js";

import { assignPropertyAmenityController, createPropertycontroller, getPropertyAmenitiesController, removePropertyAmenityController, updatePropertyAvailabilityController } from "./property.controller.js";

import { validateRequest } from "../../middleware/validateRequest.js";
import { assignPropertyAmenitySchema, createPropertySchema, getPropertyAmenitiesSchema, removePropertyAmenitySchema, updatePropertyAvailabilitySchema } from "./property.validation.js";

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


propertyRouter.post(
  "/:propertyId/amenities",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(assignPropertyAmenitySchema),
  authorizepropertyOwner(),
  assignPropertyAmenityController,
);


propertyRouter.get(
  "/:propertyId/amenities",
  validateRequest(getPropertyAmenitiesSchema),
  getPropertyAmenitiesController,
);



propertyRouter.delete(
  "/:propertyId/amenities/:amenityId",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(removePropertyAmenitySchema),
  authorizepropertyOwner(),
  removePropertyAmenityController,
);


propertyRouter.get(
  "/:propertyId/media",
  validateRequest(getPropertyMediaSchema),
  getPropertyMediaController,
);


export default propertyRouter;
