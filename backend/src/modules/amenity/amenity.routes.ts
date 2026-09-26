import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  amenityIdSchema,
  createAmenitySchema,
  listAmenitiesSchema,
  updateAmenitySchema,
} from "./amenity.validation.js";
import {
  createAmenityController,
  deleteAmenityController,
  getAmenitiesController,
  getAmenityByIdController,
  reactivateAmenityController,
  updateAmenityController,
} from "./amenity.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";

const amenityRouter = Router();

amenityRouter.get(
  "/",
  validateRequest(listAmenitiesSchema),
  getAmenitiesController,
);

amenityRouter.get(
  "/:amenityId",
  validateRequest(amenityIdSchema),
  getAmenityByIdController,
);

amenityRouter.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  validateRequest(createAmenitySchema),
  createAmenityController,
);

amenityRouter.patch(
  "/:amenityId",
  authenticate,
  authorizeRoles("ADMIN"),
  validateRequest(updateAmenitySchema),
  updateAmenityController,
);

amenityRouter.patch(
  "/:amenityId/reactivate",
  authenticate,
  authorizeRoles("ADMIN"),
  validateRequest(amenityIdSchema),
  reactivateAmenityController,
);

amenityRouter.delete(
  "/:amenityId",
  authenticate,
  authorizeRoles("ADMIN"),
  validateRequest(amenityIdSchema),
  deleteAmenityController,
);

export default amenityRouter;
