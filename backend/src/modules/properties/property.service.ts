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

export async function assignAmenityToProperty(
  propertyId: string,
  amenityId: string,
) {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
    select: {
      id: true,
      deletedAt: true,
    },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.deletedAt) {
    throw new AppError("This property has been deleted", 400);
  }

  const amenity = await prisma.amenity.findUnique({
    where: {
      id: amenityId,
    },
    select: {
      id: true,
      deletedAt: true,
    },
  });

  if (!amenity) {
    throw new AppError("Amenity not found", 404);
  }

  if (amenity.deletedAt) {
    throw new AppError("This amenity has been deleted", 400);
  }

  const existingAssignment = await prisma.propertyAmenity.findUnique({
    where: {
      propertyId_amenityId: {
        propertyId,
        amenityId,
      },
    },
  });

  if (existingAssignment) {
    throw new AppError("Amenity is already assigned to this property", 409);
  }

  return prisma.propertyAmenity.create({
    data: {
      propertyId,
      amenityId,
    },
    include: {
      amenity: true,
    },
  });
}

export async function getPropertyAmenities(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
    select: {
      id: true,
      deletedAt: true,
    },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.deletedAt) {
    throw new AppError("This property has been deleted", 400);
  }

  return prisma.propertyAmenity.findMany({
    where: {
      propertyId,
      amenity: {
        deletedAt: null,
      },
    },
    include: {
      amenity: true,
    },
    orderBy: {
      amenity: {
        name: "asc",
      },
    },
  });
}

export async function removeAmenityFromProperty(
  propertyId: string,
  amenityId: string,
) {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
    select: {
      id: true,
      deletedAt: true,
    },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.deletedAt) {
    throw new AppError("This property has been deleted", 400);
  }

  const assignment = await prisma.propertyAmenity.findUnique({
    where: {
      propertyId_amenityId: {
        propertyId,
        amenityId,
      },
    },
  });

  if (!assignment) {
    throw new AppError("This amenity is not assigned to this property", 404);
  }

  await prisma.propertyAmenity.delete({
    where: {
      propertyId_amenityId: {
        propertyId,
        amenityId,
      },
    },
  });
}
