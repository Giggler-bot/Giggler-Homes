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
  deletePropertyController,
  getRecentlyDeletedPropertiesController,
  restorePropertyController,
} from "./property.controller.js";

import { validateRequest } from "../../middleware/validateRequest.js";
import {
  assignPropertyAmenitySchema,
  createPropertySchema,
  updatePropertySchema,
  getPropertyAmenitiesSchema,
  removePropertyAmenitySchema,
  updatePropertyAvailabilitySchema,
  deletePropertySchema,
  getRecentlyDeletedPropertiesSchema,
  restorePropertySchema,
} from "./property.validation.js";

import {
  createMediaController,
  getPropertyMediaController,
} from "../media/media.controller.js";

import {
  createMediaParamsSchema,
  createMediaBodySchema,
  getPropertyMediaSchema,
} from "../media/media.validation.js";

import { authorizeMediaPropertyOwner } from "../media/media.middleware.js";
import { uploadRateLimiter } from "../../middleware/uploadRateLimiter.js";
import { uploadMediaFile } from "../../middleware/upload.middleware.js";
import { validateMediaFile } from "../../middleware/validateMediaFile.js";

const propertyRouter = Router();

propertyRouter.post(
  "/",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(createPropertySchema),
  createPropertyController,
);

propertyRouter.post(
  "/:propertyId/media",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(createMediaParamsSchema),
  authorizeMediaPropertyOwner(),
  uploadRateLimiter,
  uploadMediaFile.single("file"),
  validateRequest(createMediaBodySchema),
  validateMediaFile,
  createMediaController,
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

propertyRouter.delete(
  "/:propertyId",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(deletePropertySchema),
  authorizePropertyOwner(),
  deletePropertyController,
);

propertyRouter.get(
  "/recently-deleted",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(getRecentlyDeletedPropertiesSchema),
  getRecentlyDeletedPropertiesController,
);

propertyRouter.post(
  "/:propertyId/restore",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(restorePropertySchema),
  authorizePropertyOwner({ allowDeleted: true }),
  restorePropertyController,
);

export default propertyRouter;
