import { prisma } from "../../lib/prisma.js";
import { generateSlug } from "../../common/utils/slug.js";

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