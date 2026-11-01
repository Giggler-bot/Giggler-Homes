import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { authorizePropertyOwner } from "../../middleware/authorizePropertyOwner.js";

import {
  assignPropertyAmenityController,
  createPropertyController,
  updatePropertyController,
  getPropertyAmenitiesController,
  removePropertyAmenityController,
  updatePropertyAvailabilityController,
} from "./property.controller.js";

import { validateRequest } from "../../middleware/validateRequest.js";
import {
  assignPropertyAmenitySchema,
  createPropertySchema,
  updatePropertySchema,
  getPropertyAmenitiesSchema,
  removePropertyAmenitySchema,
  updatePropertyAvailabilitySchema,
} from "./property.validation.js";

import { getPropertyMediaController } from "../media/media.controller.js";
import { getPropertyMediaSchema } from "../media/media.validation.js";

const propertyRouter = Router();

propertyRouter.post(
  "/",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(createPropertySchema),
  createPropertyController,
);

propertyRouter.patch(
  "/:propertyId",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(updatePropertySchema),
  authorizePropertyOwner(),
  updatePropertyController,
);

propertyRouter.patch(
  "/:propertyId/availability",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(updatePropertyAvailabilitySchema),
  authorizePropertyOwner(),
  updatePropertyAvailabilityController,
);

propertyRouter.post(
  "/:propertyId/amenities",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(assignPropertyAmenitySchema),
  authorizePropertyOwner(),
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
  authorizePropertyOwner(),
  removePropertyAmenityController,
);

propertyRouter.get(
  "/:propertyId/media",
  validateRequest(getPropertyMediaSchema),
  getPropertyMediaController,
);

export default propertyRouter;
