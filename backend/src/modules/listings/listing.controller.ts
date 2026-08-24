import { response, type Request, type Response } from "express";
import {
  createListing,
  getActiveListingById,
  getActiveListings,
  submitListingForReview,
  updateListing,
  approveListing,
  rejectListing,
} from "./listing.service.js";
import {
  Prisma,
  GhanaRegion,
  ListingType,
} from "../../generated/prisma/client.js";
import { success } from "zod";

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

export async function updateListingController(
  req: Request<{ listingId: string }>,
  res: Response,
) {
  const listing = await updateListing(req.params.listingId, req.body);

  res.status(200).json({
    success: true,
    message: "Listing updated successfully",
    data: listing,
  });
}

export async function submitListingController(
  req: Request<{ listingId: string }>,
  res: Response,
) {
  const listing = await submitListingForReview(req.params.listingId);

  res.status(200).json({
    success: true,
    message: "Listing submited for review successfully",
    data: {
      listingId: listing.id,
      status: listing.status,
    },
  });
}

export async function approveListingController(
  req: Request<{ listingId: string }>,
  res: Response,
) {
  const listing = await approveListing(req.params.listingId);

  res.status(200).json({
    success: true,
    message: "Listing approved successfully",
    data: {
      listingId: listing.id,
      status: listing.status,
      publishedAt: listing.publishedAt,
    },
  });
}

export async function rejectListingController(
  req: Request<{ listingId: string }>,
  res: Response,
) {
  const listing = await rejectListing(req.params.listingId);

  res.status(200).json({
    success: true,
    message: "Listing rejected successfully",
    data: {
      listingId: listing.id,
      status: listing.status,
    },
  });
}
