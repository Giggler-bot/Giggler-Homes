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
    }
  });

  return listing;
}

export async function getActiveListings() {
    const listing = await prisma.listing.findMany({
        where: {
            status: "ACTIVE",
            deletedAt: null
        },
        include: {
            property: {
                include: {
                    location: true,

                    propertyType: {
                        include: {
                            category: true,
                        }
                    }
                }
            }
        },
        orderBy: [
            {
                isFeatured: "desc",
            },
            {
                createdAt: "desc",
            },
        ],
    });

    return listing;
}
















