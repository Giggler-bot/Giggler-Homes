import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, { message: "First name must be at least 2 characters long" })
    .max(50, { message: "First name must be at most 50 characters long" }),
  lastName: z
    .string()
    .trim()
    .min(2, { message: "Last name must be at least 2 characters long" })
    .max(50, { message: "Last name must be at most 50 characters long" }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
    .max(255),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  phone: z
    .string()
    .trim()
    .min(10, { message: "Please provide a valid phone number" })
    .max(20, { message: "Please provide a valid phone number" }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
