
import type { RequestHandler } from "express";
import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../lib/prisma.js";

export function authorizeMediaPropertyOwner(): RequestHandler {
  return async (req, _res, next) => {
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
          deletedAt: true,
        },
      });

      if (!property) {
        throw new AppError("Property not found", 404);
      }

      if (property.deletedAt) {
        throw new AppError("This property has been deleted", 400);
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

async function authorizeMediaOwnership(
  mediaId: string,
  userId: string,
) {
  const media = await prisma.media.findUnique({
    where: {
      id: mediaId,
    },
    select: {
      property: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!media) {
    throw new AppError("Media not found", 404);
  }

  if (media.property.ownerId !== userId) {
    throw new AppError(
      "You are not authorized to perform this action",
      403,
    );
  }
}

function createMediaOwnershipMiddleware(): RequestHandler<{
  mediaId: string;
}> {
  return async (req, _res, next) => {
    try {
      if (!req.user) {
        throw new AppError("User not authenticated", 401);
      }

      if (req.user.role === "ADMIN") {
        return next();
      }

      await authorizeMediaOwnership(req.params.mediaId, req.user.id);

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function authorizeMediaUpdate() {
  return createMediaOwnershipMiddleware();
}

export function authorizeMediaDelete() {
  return createMediaOwnershipMiddleware();
}

export function authorizeMediaRestore() {
  return createMediaOwnershipMiddleware();
}
