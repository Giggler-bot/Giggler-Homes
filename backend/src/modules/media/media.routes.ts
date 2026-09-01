import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest.js";

import { createMediaSchema } from "./media.validation.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { createMediaController } from "./media.controller.js";
import { authorizeMediaPropertyOwner } from "./media.middleware.js";

const mediaRouter = Router();

mediaRouter.post(
  "/",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN"),
  validateRequest(createMediaSchema),
  authorizeMediaPropertyOwner(),
  createMediaController,
);

export default mediaRouter;
