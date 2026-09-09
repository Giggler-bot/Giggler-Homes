import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest.js";

import {
  createMediaSchema,
  deleteMediaSchema,
  getMediaByIdSchema,
  getPropertyMediaSchema,
  updateMediaSchema,
} from "./media.validation.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import {
  createMediaController,
  deleteMediaController,
  getMediaByIdController,
  getPropertyMediaController,
  updatemediaController,
} from "./media.controller.js";
import {
  authorizeMediaDelete,
  authorizeMediaPropertyOwner,
  authorizeMediaUpdate,
} from "./media.middleware.js";

const mediaRouter = Router();

mediaRouter.post(
  "/",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(createMediaSchema),
  authorizeMediaPropertyOwner(),
  createMediaController,
);

mediaRouter.get(
  "/property/:propertyId",
  validateRequest(getPropertyMediaSchema),
  getPropertyMediaController,
);

mediaRouter.get(
  "/:mediaId",
  validateRequest(getMediaByIdSchema),
  getMediaByIdController,
);

mediaRouter.patch(
  "/:mediaId",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(updateMediaSchema),
  authorizeMediaUpdate(),
  updatemediaController,
);

mediaRouter.delete(
  "/:mediaId",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(deleteMediaSchema),
  authorizeMediaDelete(),
  deleteMediaController,
);

export default mediaRouter;
