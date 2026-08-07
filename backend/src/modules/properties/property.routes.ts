import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { authorizepropertyOwner } from "../../middleware/authorizePropertyOwner.js";

import { createPropertycontroller } from "./property.controller.js";

import { validateRequest } from "../../middleware/validateRequest.js";
import { createPropertySchema } from "./property.validation.js";

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

export default propertyRouter;
