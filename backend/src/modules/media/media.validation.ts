
import { z } from "zod";

export const createMediaSchema = z.object({
  body: z
    .object({
      propertyId: z.uuid("Invalid property ID"),
      title: z.string().trim().min(1).max(255).optional(),
      altText: z.string().trim().min(1).max(255).optional(),
      sortOrder: z.preprocess(
        (value) => (value === "" ? Number.NaN : value),
        z.coerce.number().int().min(0).default(0),
      ),
      isPrimary: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .default(false),
    })
    .strict(),
});

export const getPropertyMediaSchema = z.object({
  params: z
    .object({
      propertyId: z.uuid("Invalid property ID"),
    })
    .strict(),
});

export const getMediaByIdSchema = z.object({
  params: z
    .object({
      mediaId: z.uuid("Invalid media ID"),
    })
    .strict(),
});

export const updateMediaSchema = z.object({
  params: z
    .object({
      mediaId: z.uuid("Invalid media ID"),
    })
    .strict(),

  body: z
    .object({
      title: z.string().trim().min(1).max(255).nullable().optional(),
      altText: z.string().trim().min(1).max(255).nullable().optional(),
      sortOrder: z.number().int().min(0).optional(),
      isPrimary: z.boolean().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const deleteMediaSchema = z.object({
  params: z
    .object({
      mediaId: z.uuid("Invalid media ID"),
    })
    .strict(),
});

export const restoreMediaSchema = z.object({
  params: z
    .object({
      mediaId: z.uuid("Invalid media ID"),
    })
    .strict(),
});
