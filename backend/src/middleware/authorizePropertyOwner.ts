import { RequestHandler } from "express";

import { AppError } from "../common/errors/AppError.js";
import { canManageProperty } from "../common/authorization/property.js";
import { prisma } from "../lib/prisma.js";

export function authorizePropertyOwner(): RequestHandler {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required", 401);
      }
      const propertyId = req.params.propertyId as string;

      if (!propertyId) {
        throw new AppError("Property ID is required", 400);
      }

      const property = await prisma.property.findUnique({
        where: {
          id: propertyId,
        },
        select: {
          id: true,
          ownerId: true,
          deletedAt: true,
        },
      });

      if (!property) {
        throw new AppError("Property not found", 404);
      }

      if (property.deletedAt) {
        throw new AppError("This property has been deleted", 404);
      }

      if (!canManageProperty(req.user, property)) {
        throw new AppError(
          "You are not authorized to manage this property",
          403,
        );
      }

      
      next();
    } catch (error) {
      next(error);
    }
  };
}
