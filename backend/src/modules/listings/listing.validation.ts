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
        .default("GHC"),
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
        message: "Rent period must not be provoded for a sale listing.",
      });
    }
  });
