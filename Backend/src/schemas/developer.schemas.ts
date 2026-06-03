import z from "zod";
import { PartnershipStatus } from "@prisma/client";

export const createDeveloperSchema = z.object({
  companyName: z
    .string()
    .min(3, "Company name must be at least 3 characters"),
  logoUrl: z.string().optional().nullable(),
  bannerImageUrl: z.string().optional().nullable(),
  contactName: z
    .string()
    .min(3, "Contact name must be at least 3 characters"),
  contactEmail: z
    .string()
    .email("Must be a valid email address"),
  contactPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits"),
  websiteUrl: z.string().optional().nullable(),
  establishedYear: z.preprocess((val) => {
    if (typeof val === "string") {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z
    .number()
    .int()
    .min(1800, "Established year must be valid")
    .max(new Date().getFullYear(), "Established year cannot be in the future")
    .optional()
    .nullable()),
  description: z.string().optional().nullable(),
  headquartersCity: z.string().optional().nullable(),
  reraRegistered: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val.toLowerCase() === "true") return true;
      if (val.toLowerCase() === "false") return false;
    }
    return val;
  }, z.boolean().optional().default(false)),
  partnershipStatus: z
    .nativeEnum(PartnershipStatus)
    .optional()
    .default(PartnershipStatus.ACTIVE),
  partnershipStart: z
    .string()
    .transform((str) => (str ? new Date(str) : undefined))
    .optional()
    .nullable(),
});

export const updateDeveloperSchema = createDeveloperSchema.partial();
