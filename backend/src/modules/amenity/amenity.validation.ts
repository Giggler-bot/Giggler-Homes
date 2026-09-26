import { z } from "zod";

const amenityCategories = [
  "SECURITY",
  "UTILITIES",
  "COMFORT",
  "OUTDOOR",
  "PARKING",
  "CONNECTIVITY",
] as const;

export const createAmenitySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(100),

    icon: z.string().trim().min(1).max(100).optional(),

    category: z.enum(amenityCategories).optional(),
  }),
});

export const updateAmenitySchema = z.object({
  params: z.object({
    amenityId: z.uuid(),
  }),

  body: z.object({
    name: z.string().trim().min(1).max(100).optional(),
    icon: z.string().trim().min(1).max(100).optional(),

    category: z.enum(amenityCategories).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field must be provided",
    },
  ),
});


export const amenityIdSchema = z.object({
    params:z.object({
        amenityId: z.uuid(),
    }),

});

export const listAmenitiesSchema = z.object({
    query: z.object({
        category: z.enum(amenityCategories).optional(),
    }),
});

