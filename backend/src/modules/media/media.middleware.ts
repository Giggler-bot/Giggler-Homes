import { RequestHandler } from "express";
import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../lib/prisma.js";

export function authorizeMediaPropertyOwner(): RequestHandler {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        throw new AppError("User not authenticated", 401);
      }


      if (user.role === "ADMIN") {
        return next();
      }

      const property = await prisma.property.findUnique({
        where: {
          id: req.body.propertyId,
        },
        select: {
          ownerId: true,
        },
      });

      if (!property) {
        throw new AppError("Property not found", 404);
      }

      if (property.ownerId !== user.id) {
        throw new AppError(
          "You are not authorized to perform this action",
          403,
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
