import type { Request, Response } from "express";
import {
  createListing,
  getActiveListingById,
  getActiveListings,
} from "./listing.service.js";
import {
  Prisma,
  GhanaRegion,
  ListingType,
} from "../../generated/prisma/client.js";

export async function createListingController(req: Request, res: Response) {
  const listing = await createListing({
    userId: req.user!.id,
    ...req.body,
  });

  res.status(200).json({
    success: true,
    message: "Listing created successfully",
    data: listing,
  });
}

export async function getActiveListingsController(req: Request, res: Response) {
  const query = req.query as unknown as {
    page: number;
    limit: number;
    listingType?: ListingType;
    region?: GhanaRegion;
    propertyTypeId?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    isFurnished?: boolean;
  };

  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);
  
  const result = await getActiveListings({
    ...query,
    page,
    limit,
  });
  res.status(200).json({
    success: true,
    message: "Listings retrieved successfully",
    data: result,
  });
  console.log("LISTING QUERY:", req.query);
  console.log("PAGE:", req.query.page, typeof req.query.page);
  console.log("LIMIT:", req.query.limit, typeof req.query.limit);
  console.log("REGION:", req.query.region, typeof req.query.region);
}

export async function getActiveListingByIdController(
  req: Request<{ listingId: string }>,
  res: Response,
) {
  const listings = await getActiveListingById(req.params.listingId);

  res.status(200).json({
    success: true,
    message: "Listing retrieved successfully",
    data: listings,
  });
}
