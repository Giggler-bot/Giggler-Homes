import { z } from "zod";

const listingReportReasons = [
  "FRAUD",
  "SCAM",
  "MISLEADING_INFORMATION",
  "DUPLICATE_LISTING",
  "WRONG_PRICE",
  "WRONG_LOCATION",
  "ALREADY_UNAVAILABLE",
  "INAPPROPRIATE_CONTENT",
  "OTHER",
] as const;

export const createListingReportSchema = z.object({
  params: z.object({
    listingId: z.uuid(),
  }),

  body: z
    .object({
      reason: z.enum(listingReportReasons),
      description: z.string().trim().max(1000).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.reason === "OTHER" && !data.description) {
        ctx.addIssue({
          code: "custom",
          path: ["description"],
          message: "Description is required when reason is OTHER",
        });
      }
    }),
});

export const reportIdSchema = z.object({
  params: z.object({
    reportId: z.uuid(),
  }),
});

export const listReportsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    status: z
      .enum(["PENDING", "UNDER_REVIEW", "RESOLVED", "DISMISSED"])
      .optional(),

    reason: z.enum(listingReportReasons).optional(),
  }),
});

const moderationActionTypes = [
  "SUSPEND_LISTING",
  "REMOVE_LISTING",
  "RESTORE_LISTING",
  "WARN_USER",
  "SUSPEND_USER",
  "BAN_USER",
] as const;

export const createModerationActionSchema = z.object({
  params: z.object({
    reportId: z.uuid(),
  }),

  body: z.object({
    actionType: z.enum(moderationActionTypes),

    reason: z
      .string()
      .trim()
      .min(1, "Reason is required")
      .max(1000, "Reason must not exceed 1000 characters"),
  }),
});
