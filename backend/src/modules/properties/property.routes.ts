import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { authorizepropertyOwner } from "../../middleware/authorizePropertyOwner.js";

import { updateProperty } from "./property.controller.js";

const propertyRouter = Router();

propertyRouter.patch(
  "/:propertyId",
  authenticate,
  authorizeRoles("OWNER", "AGENCY", "HOTEL", "ADMIN" ),
  authorizepropertyOwner(),
  updateProperty,
);


export default propertyRouter;