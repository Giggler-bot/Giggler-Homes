import { z } from "zod";

const identityDocumentTypes = [
  "NATIONAL_ID",
  "PASSPORT",
  "VOTERS_ID",
  "DRIVERS_LICENSE",
] as const;

export const createUserVerificationSchema = z.object({
  body: z.object({
    idType: z.enum(identityDocumentTypes),
    idNumber: z.string().trim().min(1).max(100),
  }),
});

const ownershipDocumentTypes = [
  "PROPERTY_DEED",
  "UTILITY_BILL",
  "LEASE_AGREEMENT",
] as const;

export const createOwnershipVerificationSchema = z.object({
  params: z.object({
    propertyId: z.uuid(),
  }),

  body: z.object({
    proofType: z.enum(ownershipDocumentTypes),
  }),
});

export const ownershipPropertyIdSchema = z.object({
  params: z.object({
    propertyId: z.uuid(),
  }),
});

const businessTypes = ["AGENCY", "HOTEL"] as const;

export const createBusinessVerificationSchema = z.object({
  body: z.object({
    businessType: z.enum(businessTypes),
    businessName: z.string().trim().min(1).max(200),
    registrationNumber: z.string().trim().min(1).max(100),
  }),
});

export const verificationIdSchema = z.object({
  params: z.object({
    verificationId: z.cuid(),
  }),
});

export const rejectVerificationSchema = z.object({
  params: z.object({
    verificationId: z.cuid(),
  }),

  body: z.object({
    rejectionReason: z
      .string()
      .trim()
      .min(1, "Rejection reason is required")
      .max(1000, "Rejection reason must not exceed 1000 characters"),
  }),
});