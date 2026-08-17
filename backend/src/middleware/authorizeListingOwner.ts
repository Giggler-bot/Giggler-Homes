import type { RequestHandler } from "express";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../common/errors/AppError.js";

export function authorizeListingOwner(): RequestHandler<{ listingId: string}> {
  return async (req, res, next) => {
    try {
      const listingId = req.params.listingId;
      const user = req.user;

      if (!user) {
        next(new AppError("Authorization required", 401));
        return;
      }

      const listing = await prisma.listing.findUnique({
        where: {
          id: listingId,
        },
        include: {
          property: {
            select: {
              ownerId: true,
            },
          },
        },
      });

      if (!listing) {
        next(new AppError("Listing not found", 404));
        return;
      }

      if (user.role === "ADMIN") {
        res.locals.listing = listing;
        next();
        return;
      }

      if (listing.property.ownerId !== user.id) {
        next(
          new AppError(
            "You are not authorized to access this listing",
            403,
          ),
        );
        return;
      }

      res.locals.listing = listing;
      next();
    } catch (error) {
      next(error);
    }
  };
}