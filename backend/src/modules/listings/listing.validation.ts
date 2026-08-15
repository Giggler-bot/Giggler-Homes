import { z } from "zod";

const listingTypes = ["RENT", "SALE", "SHORT_STAY", "LEASE"] as const;

const rentPeriods = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as const;

const rentalListingTypes = ["RENT", "SHORT_STAY", "LEASE"] as const;

export const createListingSchema = z
  .object({
    body: z.object({
      propertyId: z.uuid(),
      listingType: z.enum(listingTypes),
      price: z.number().positive(),
      currency: z
        .string()
        .length(3)
        .transform((value) => value.toUpperCase())
        .default("GHS"),
      rentPeriod: z.enum(rentPeriods).optional(),
      negotiable: z.boolean().default(false),
      isFeatured: z.boolean().default(false),
      expiresAt: z.coerce
        .date()
        .refine((date) => date > new Date(), {
          message: "Expiry date must be in the future.",
        })
        .optional(),
    }),
  })
  .superRefine((data, ctx) => {
    const { listingType, rentPeriod } = data.body;

    if (
      rentalListingTypes.includes(
        listingType as (typeof rentalListingTypes)[number],
      ) &&
      !rentPeriod
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["body", "rentPeriod"],
        message: "Rent period is required for this listing type.",
      });
    }
    if (listingType === "SALE" && rentPeriod) {
      ctx.addIssue({
        code: "custom",
        path: ["body", "rentPeriod"],
        message: "Rent period must not be provided for a sale listing.",
      });
    }
  });

const listingQueryTypes = ["RENT", "SALE", "SHORT_STAY", "LEASE"] as const;

const ghanaRegions = [
  "GREATER_ACCRA",
  "ASHANTI",
  "CENTRAL",
  "EASTERN",
  "WESTERN",
  "WESTERN_NORTH",
  "VOLTA",
  "OTI",
  "NORTHERN",
  "NORTH_EAST",
  "SAVANNAH",
  "UPPER_EAST",
  "UPPER_WEST",
  "BONO",
  "BONO_EAST",
  "AHAFO",
] as const;

const booleanQuery = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const listingQuerySchema = z
  .object({
    listingType: z.enum(listingQueryTypes).optional(),
    region: z.enum(ghanaRegions).optional(),
    propertyTypeId: z.uuid().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    bedrooms: z.coerce.number().int().nonnegative().optional(),
    bathrooms: z.coerce.number().int().nonnegative().optional(),
    isFurnished: booleanQuery.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .superRefine((query, ctx) => {
    if (
      query.minPrice !== undefined &&
      query.maxPrice !== undefined &&
      query.minPrice > query.maxPrice
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["maxPrice"],
        message:
          "Maximum price must be greater than or equal to minimum price.",
      });
    }
  });
export const getListingsQuerySchema = z.object({
  query: listingQuerySchema,
});

export const updateListingSchema = z.object({
  params: z.object({
    listingId: z.uuid(),
  }),
  body: z
    .object({
      price: z.coerce.number().positive().optional(),
      currency: z.string().length(3).toUpperCase().optional(),
      rentPeriod: z
        .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
        .nullable()
        .optional(),
      negotiable: z.boolean().optional(),
      expiresAt: z.coerce.date().nullable().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided.",
    }),
});
