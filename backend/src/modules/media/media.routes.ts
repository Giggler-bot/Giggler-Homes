import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest.js";

import {
  createMediaSchema,
  deleteMediaSchema,
  getMediaByIdSchema,
  getPropertyMediaSchema,
  updateMediaSchema,
  restoreMediaSchema
} from "./media.validation.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import {
  createMediaController,
  deleteMediaController,
  getMediaByIdController,
  getPropertyMediaController,
  updatemediaController,
  restoreMediaController,
} from "./media.controller.js";
import {
  authorizeMediaDelete,
  authorizeMediaPropertyOwner,
  authorizeMediaRestore,
  authorizeMediaUpdate,
} from "./media.middleware.js";
import { uploadMediaFile } from "../../middleware/upload.middleware.js";

const mediaRouter = Router();

mediaRouter.post(
  "/",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  uploadMediaFile.single("file"),
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

mediaRouter.patch(
  "/:mediaId/restore",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(restoreMediaSchema),
  authorizeMediaRestore(),
  restoreMediaController,
);

export default mediaRouter;
