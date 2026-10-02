import { z } from "zod";

const inquiryStatuses = [
  "OPEN",
  "RESPONDED",
  "CLOSED",
] as const;

export const createInquirySchema = z.object({
  params: z.object({
    listingId: z.uuid(),
  }),

  body: z.object({
    message: z.string().trim().min(1).max(2000),
  }),
});

export const inquiryIdSchema = z.object({
  params: z.object({
    inquiryId: z.uuid(),
  }),
});

export const listInquiriesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(inquiryStatuses).optional(),
  }),
});


