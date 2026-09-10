import { z } from "zod";

export const createMediaSchema = z.object({
  body: z.object({
    propertyId: z.uuid(),
    title: z.string().trim().min(1).max(255).optional(),
    altText: z.string().trim().min(1).max(255).optional(),
    sortOrder: z.coerce.number().int().min(0).default(0),
    isPrimary: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .default(false),
  }),
});

export const getPropertyMediaSchema = z.object({
  params: z.object({
    propertyId: z.string().uuid(),
  }),
});

export const getMediaByIdSchema = z.object({
  params: z.object({
    mediaId: z.string().uuid(),
  }),
});

export const updateMediaSchema = z.object({
  params: z.object({
    mediaId: z.uuid(),
  }),
  body: z
    .object({
      title: z.string().trim().min(1).max(255).optional(),
      altText: z.string().trim().min(1).max(255).optional(),
      sortOrder: z.number().int().min(0).optional(),
      isPrimary: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const deleteMediaSchema = z.object({
  params: z.object({
    mediaId: z.uuid(),
  }),
});
