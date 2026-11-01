import { z } from "zod";

export const createPropertySchema = z
  .object({
    body: z
      .object({
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
      })
      .strict(),
  })
  .strict();

export const updatePropertySchema = z
  .object({
    params: z
      .object({
        propertyId: z.uuid("Invalid property ID"),
      })
      .strict(),

    body: z
      .object({
        title: z.string().trim().min(5).max(100).optional(),
        description: z.string().trim().min(10).max(1000).optional(),
        locationId: z.uuid("Invalid location ID").optional(),
        propertyTypeId: z.uuid("Invalid property type ID").optional(),
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
        isFurnished: z.boolean().optional(),
      })
      .strict()
      .refine((data) => Object.keys(data).length > 0, {
        message: "At least one property field must be provided",
      }),
  })
  .strict();

export const updatePropertyAvailabilitySchema = z
  .object({
    params: z
      .object({
        propertyId: z.uuid("Invalid property ID"),
      })
      .strict(),

    body: z
      .object({
        isAvailable: z.boolean(),
      })
      .strict(),
  })
  .strict();

export const assignPropertyAmenitySchema = z
  .object({
    params: z
      .object({
        propertyId: z.uuid("Invalid property ID"),
      })
      .strict(),

    body: z
      .object({
        amenityId: z.uuid("Invalid amenity ID"),
      })
      .strict(),
  })
  .strict();

export const getPropertyAmenitiesSchema = z
  .object({
    params: z
      .object({
        propertyId: z.uuid("Invalid property ID"),
      })
      .strict(),
  })
  .strict();

export const removePropertyAmenitySchema = z
  .object({
    params: z
      .object({
        propertyId: z.uuid("Invalid property ID"),
        amenityId: z.uuid("Invalid amenity ID"),
      })
      .strict(),
  })
  .strict();