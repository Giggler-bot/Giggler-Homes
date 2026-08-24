import { z } from "zod";

export const createPropertySchema = z.object({
  body: z.object({
    title: z.string().trim().min(5).max(100),
    description: z.string().trim().min(10).max(1000),
    locationId: z.uuid("Invalid location ID"),
    propertyTypeId: z.uuid("Invalid property type ID"),
    bedrooms: z.number().int().min(0).optional(),
    bathrooms: z.number().int().min(0).optional(),
    toilets: z.number().int().min(0).optional(),
    parkingSpaces: z.number().int().min(0).optional(),
    squareMeters: z.number().positive().nullable().optional(),
    yearBuilt: z
      .number()
      .int()
      .min(1800)
      .max(new Date().getFullYear())
      .optional(),

    isFurnished: z.boolean().default(false),
  }),
});


export const updatePropertyAvailabilitySchema = z.object({
  params: z.object({
    propertyId: z.uuid(),
  }),

  body: z.object({
    isAvailable: z.boolean(),
  }),
});