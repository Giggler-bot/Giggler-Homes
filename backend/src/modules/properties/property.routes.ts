import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { authorizepropertyOwner } from "../../middleware/authorizePropertyOwner.js";

import { createPropertycontroller } from "./property.controller.js";

import { validateRequest } from "../../middleware/validateRequest.js";
import { createPropertySchema } from "./property.validation.js";

const propertyRouter = Router();

propertyRouter.patch(
  "/:propertyId",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN" ),
  authorizepropertyOwner(),
  validateRequest(createPropertySchema),
  createPropertycontroller,
);


export default propertyRouter;