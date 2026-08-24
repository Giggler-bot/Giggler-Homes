import { prisma } from "../../lib/prisma.js";
import { generateSlug } from "../../common/utils/slug.js";
import { AppError } from "../../common/errors/AppError.js";

type CreatePropertyInput = {
  ownerId: string;
  locationId: string;
  propertyTypeId: string;
  title: string;
  description: string;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  parkingSpaces?: number;
  squareMeters?: number;
  yearBuilt?: number;
  isFurnished?: boolean;
};

export async function createProperty(data: CreatePropertyInput) {
  const slug = generateSlug(data.title);

  return prisma.property.create({
    data: {
      ownerId: data.ownerId,
      locationId: data.locationId,
      propertyTypeId: data.propertyTypeId,
      title: data.title,
      slug,
      description: data.description,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      toilets: data.toilets,
      parkingSpaces: data.parkingSpaces,
      squareMeters: data.squareMeters,
      yearBuilt: data.yearBuilt,
      isFurnished: data.isFurnished ?? false,
    },
  });
}

export async function updatePropertyAvailability(
  propertyId: string,
  isAvailable: boolean,
) {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.deletedAt) {
    throw new AppError("This property has been deleted", 400);
  }

  const updatedProperty = await prisma.property.update({
    where: {
      id: propertyId,
    },

    data: {
      isAvailable,
    },
  });

  return updatedProperty;
}
