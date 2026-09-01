import { z } from "zod";

export const createMediaSchema = z.object({
  body: z.object({
    propertyId: z.uuid(),
    type: z.enum(["IMAGE", "VIDEO"]),
    url: z.url(),
    publicId: z.string().min(1),
    title: z.string().trim().min(1).max(255).optional(),
    altText: z.string().trim().min(1).max(255).optional(),
    sortOrder: z.number().int().min(0).default(0),
    isPrimary: z.boolean().default(false),
  }),
});
