import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest.js";

import {
  deleteMediaSchema,
  getMediaByIdSchema,
  updateMediaSchema,
  restoreMediaSchema,
} from "./media.validation.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import {
  deleteMediaController,
  getMediaByIdController,
  updateMediaController,
  restoreMediaController,
} from "./media.controller.js";
import {
  authorizeMediaDelete,
  authorizeMediaRestore,
  authorizeMediaUpdate,
} from "./media.middleware.js";

const mediaRouter = Router();

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
  updateMediaController,
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
