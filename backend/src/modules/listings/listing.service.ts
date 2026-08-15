import {
  Prisma,
  GhanaRegion,
  ListingType,
  RentPeriod,
} from "../../generated/prisma/client.js";
import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../lib/prisma.js";

type createListingInput = {
  userId: string;
  propertyId: string;
  listingType: "RENT" | "SALE" | "SHORT_STAY" | "LEASE";
  price: number;
  currency: string;
  rentPeriod?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  negotiable: boolean;
  isFeatured: boolean;
  expiresAt?: Date;
};

export async function createListing(input: createListingInput) {
  const {
    userId,
    propertyId,
    listingType,
    price,
    currency,
    rentPeriod,
    negotiable,
    isFeatured,
    expiresAt,
  } = input;

  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.ownerId !== userId) {
    throw new AppError(
      "You are not authorized to create a listing for this property",
      403,
    );
  }

  if (!property.isAvailable) {
    throw new AppError("This property is currently unavailable", 400);
  }

  const listing = await prisma.listing.create({
    data: {
      propertyId,
      listingType,
      price,
      currency,
      rentPeriod,
      negotiable,
      isFeatured,
      expiresAt,
    },
  });

  return listing;
}

type GetActiveListingsFilters = {
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

export async function getActiveListings(filters: GetActiveListingsFilters) {
  const {
    page,
    limit,
    listingType,
    region,
    propertyTypeId,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    isFurnished,
  } = filters;

  const skip = (page - 1) * limit;

  const propertyFilters: Prisma.PropertyWhereInput = {
    ...(region && {
      location: {
        region,
      },
    }),

    ...(propertyTypeId && {
      propertyTypeId,
    }),

    ...(bedrooms !== undefined && {
      bedrooms,
    }),

    ...(bathrooms !== undefined && {
      bathrooms,
    }),

    ...(isFurnished !== undefined && {
      isFurnished,
    }),
  };

  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
    deletedAt: null,

    ...(listingType && {
      listingType,
    }),

    ...(Object.keys(propertyFilters).length > 0 && {
      property: propertyFilters,
    }),

    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined && {
              gte: minPrice,
            }),
            ...(maxPrice !== undefined && {
              lte: maxPrice,
            }),
          },
        }
      : {}),
  };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,

      include: {
        property: {
          include: {
            location: true,

            propertyType: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          isFeatured: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      skip,
      take: limit,
    }),

    prisma.listing.count({
      where,
    }),
  ]);

  return {
    listings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getActiveListingById(listingId: string) {
  const listing = await prisma.listing.findFirst({
    where: {
      id: listingId,
      status: "ACTIVE",
      deletedAt: null,
    },
    include: {
      property: {
        include: {
          location: true,

          propertyType: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!listing) {
    throw new AppError("Listing not found", 404);
  }

  return listing;
}

type UpdateListingData = {
  price?: number;
  currency?: string;
  rentPeriod?: RentPeriod;
  negotiable?: boolean;
  expiresAt?: Date | null;
};

export async function updateListing(
  listingId: string,
  userId: string,
  data: UpdateListingData,
) {
  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
    include: {
      property: true,
    },
  });

  if (!listing) {
    throw new AppError("Listing not found", 404);
  }
  if (listing.property.ownerId !== userId) {
    throw new AppError("You are not authorize to update this listing", 403);
  }
  if (listing.deletedAt) {
    throw new AppError("This listing has been deleted", 400);
  }
  if (listing.status !== "DRAFT") {
    throw new AppError("Only draft listings can be updated", 400);
  }

  const updatedListing = await prisma.listing.update({
    where: {
      id: listingId,
    },

    data,

    include: {
      property: {
        include: {
          location: true,

          propertyType: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  return updatedListing;
}
