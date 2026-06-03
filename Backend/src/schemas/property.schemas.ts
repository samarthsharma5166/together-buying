import z from "zod";
import { PropertyType, PropertyStatus, PossessionStatus, PropertyImageType, UnitType, UnitImageType } from "@prisma/client";

// Nested structures
export const propertyImageSchema = z.object({
  imageUrl: z.string().url("Image URL must be valid"),
  caption: z.string().optional().nullable(),
  imageType: z.nativeEnum(PropertyImageType),
  sortOrder: z.number().int().optional().default(0),
});

export const unitImageSchema = z.object({
  imageUrl: z.string().url("Image URL must be valid"),
  imageType: z.nativeEnum(UnitImageType),
  caption: z.string().optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
});

export const propertyUnitSchema = z.object({
  unitType: z.nativeEnum(UnitType),
  carpetAreaSqft: z.number().positive("Carpet area must be positive"),
  superAreaSqft: z.number().positive("Super area must be positive").optional().nullable(),
  price: z
    .union([z.number(), z.string()])
    .transform((val) => BigInt(val))
    .refine((val) => val >= 0n, "Price must be non-negative"),
  availableUnits: z.number().int().nonnegative().optional().nullable(),
  images: z.array(unitImageSchema).optional(),
});

// Base ZodObject shape of property fields
export const propertyBaseObject = z.object({
  developerId: z.string().uuid("Developer ID must be a valid UUID"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),
  description: z.string().optional().nullable(),
  propertyType: z.nativeEnum(PropertyType),
  status: z.nativeEnum(PropertyStatus).optional().default(PropertyStatus.DRAFT),
  city: z.string().min(2),
  locality: z.string().min(2),
  address: z.string().min(5),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  reraNumber: z.string(),
  reraState: z.string(),
  possessionDate: z
    .string()
    .transform((str) => (str ? new Date(str) : undefined))
    .optional()
    .nullable(),
  possessionStatus: z.nativeEnum(PossessionStatus),
  minPrice: z
    .union([z.number(), z.string()])
    .transform((val) => BigInt(val))
    .refine((val) => val >= 0n, "Minimum price must be non-negative"),
  maxPrice: z
    .union([z.number(), z.string()])
    .transform((val) => BigInt(val))
    .refine((val) => val >= 0n, "Maximum price must be non-negative"),
  totalUnits: z.coerce.number().int().nonnegative().optional().nullable(),
  isFeatured: z.coerce.boolean().optional().default(false),
  isPreLaunch: z.coerce.boolean().optional().default(false),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  images: z.array(propertyImageSchema).optional().default([]),
  units: z.array(propertyUnitSchema).optional().default([]),
});

// Create property schema with validation logic
export const createPropertySchema = propertyBaseObject.refine((data) => data.minPrice <= data.maxPrice, {
  message: "Minimum price cannot be greater than maximum price",
  path: ["minPrice"],
});

// Update property schema with partial fields & conditional validation logic
export const updatePropertySchema = propertyBaseObject.partial().refine((data) => {
  if (data.minPrice !== undefined && data.maxPrice !== undefined) {
    return data.minPrice <= data.maxPrice;
  }
  return true;
}, {
  message: "Minimum price cannot be greater than maximum price",
  path: ["minPrice"],
});

export const updateUnitSchema = propertyUnitSchema.partial();

export const toggleFeaturedSchema = z.object({
  isFeatured: z.boolean(),
});

export const updatePossessionStatusSchema = z.object({
  possessionStatus: z.nativeEnum(PossessionStatus),
});
