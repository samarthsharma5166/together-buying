import z from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(3),
  lastName: z.string().min(3),
  email: z.string().email(),
  phone:z.string().length(10),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().length(10).optional(),
  password: z.string().min(8),
}).refine((data) => data.email || data.phone, {
  message: "Either email or phone is required",
  path: ["email"],
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().length(10).optional(),
  addressLine1: z.string().nullable().optional(),
  addressLine2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  pincode: z.string().length(6).nullable().optional(),
  password: z.string().min(8).optional(),
});