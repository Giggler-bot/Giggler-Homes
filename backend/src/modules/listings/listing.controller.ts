import type { Request, Response } from "express";
import {
  createListing,
  getActiveListingById,
  getActiveListings,
} from "./listing.service.js";

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
  const listings = await getActiveListings();

  res.status(200).json({
    success: true,
    message: "Listings retrieved successfully",
    data: listings,
  });
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
