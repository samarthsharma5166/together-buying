import type { Response } from "express";
import { prisma } from "../db/db.js";
import AppError from "../utils/error.utils.js";
import { tryCatch } from "../utils/tryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { createPropertySchema, updatePropertySchema } from "../schemas/property.schemas.js";
import { PropertyStatus } from "@prisma/client";
import { serializeBigInt, removeUndefined } from "../utils/serialize.js";

// Helper to generate a slug
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Helper to ensure slug is unique
const getUniquePropertySlug = async (title: string): Promise<string> => {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let count = 1;
  while (true) {
    const existing = await prisma.property.findUnique({
      where: { slug },
    });
    if (!existing) break;
    slug = `${baseSlug}-${count}`;
    count++;
  }
  return slug;
};

/**
 * @desc Create a new property listing with nested units and images
 * @route POST /api/properties
 * @access Admin/Super Admin
 */
export const createProperty = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const parsedData = createPropertySchema.parse(req.body);

  // Verify developer exists
  const developer = await prisma.developer.findUnique({
    where: { id: parsedData.developerId },
  });
  if (!developer) {
    throw new AppError("Developer profile not found for the provided developerId", 400);
  }

  // Generate unique slug
  const slug = await getUniquePropertySlug(parsedData.title);

  // Extract nested creations
  const { images, units, ...basePropertyData } = parsedData;

  // Use database transaction/nested writes for atomic creation
  const property = await prisma.property.create({
    data: removeUndefined({
      ...basePropertyData,
      slug,
      createdById: req.user.id,
      images: {
        create: images.map((img) => ({
          imageUrl: img.imageUrl,
          caption: img.caption ?? null,
          imageType: img.imageType,
          sortOrder: img.sortOrder,
        })),
      },
      units: {
        create: units.map((unit) => {
          const unitData: any = {
            unitType: unit.unitType,
            carpetAreaSqft: unit.carpetAreaSqft,
            superAreaSqft: unit.superAreaSqft ?? null,
            price: unit.price,
            availableUnits: unit.availableUnits ?? null,
          };
          if (unit.images && unit.images.length > 0) {
            unitData.images = {
              create: unit.images.map((img) => ({
                imageUrl: img.imageUrl,
                imageType: img.imageType,
                caption: img.caption ?? null,
                sortOrder: img.sortOrder,
              })),
            };
          }
          return unitData;
        }),
      },
    }),
    include: {
      images: true,
      units: {
        include: {
          images: true,
        },
      },
    },
  });

  return res.status(201).json({
    success: true,
    message: "Property listing created successfully",
    data: serializeBigInt(property),
  });
});

/**
 * @desc Get property by ID or Slug
 * @route GET /api/properties/:idOrSlug
 * @access Public
 */
export const getProperty = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { idOrSlug } = req.params as { idOrSlug: string };

  // Check if idOrSlug is UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  const property = await prisma.property.findFirst({
    where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
    include: {
      developer: {
        select: {
          id: true,
          companyName: true,
          slug: true,
          logoUrl: true,
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
      units: {
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  if (!property) {
    throw new AppError("Property listing not found", 404);
  }

  return res.status(200).json({
    success: true,
    data: serializeBigInt(property),
  });
});

/**
 * @desc Update property listing
 * @route PATCH /api/properties/:id
 * @access Admin/Super Admin
 */
export const updateProperty = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const parsedData = updatePropertySchema.parse(req.body);

  const property = await prisma.property.findUnique({
    where: { id },
  });
  if (!property) {
    throw new AppError("Property listing not found", 404);
  }

  // Verify developer if developerId is being updated
  if (parsedData.developerId && parsedData.developerId !== property.developerId) {
    const developer = await prisma.developer.findUnique({
      where: { id: parsedData.developerId },
    });
    if (!developer) {
      throw new AppError("Developer profile not found for the provided developerId", 400);
    }
  }

  // Regenerate slug if title is updated
  let slug = property.slug;
  if (parsedData.title && parsedData.title !== property.title) {
    slug = await getUniquePropertySlug(parsedData.title);
  }

  // Exclude nested objects from direct patch update
  const { images, units, ...updateData } = parsedData;

  const updatedProperty = await prisma.property.update({
    where: { id },
    data: removeUndefined({
      ...updateData,
      slug,
    }),
    include: {
      images: true,
      units: true,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Property listing updated successfully",
    data: serializeBigInt(updatedProperty),
  });
});

/**
 * @desc List properties with multi-faceted filtering & pagination
 * @route GET /api/properties
 * @access Public
 */
export const listProperties = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Filter params
  const city = typeof req.query.city === "string" ? req.query.city : undefined;
  const locality = typeof req.query.locality === "string" ? req.query.locality : undefined;
  const propertyType = typeof req.query.propertyType === "string" ? req.query.propertyType : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const possessionStatus = typeof req.query.possessionStatus === "string" ? req.query.possessionStatus : undefined;
  const minPrice = typeof req.query.minPrice === "string" ? req.query.minPrice : undefined;
  const maxPrice = typeof req.query.maxPrice === "string" ? req.query.maxPrice : undefined;
  const isFeatured = typeof req.query.isFeatured === "string" ? req.query.isFeatured : undefined;
  const isPreLaunch = typeof req.query.isPreLaunch === "string" ? req.query.isPreLaunch : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;

  // Build filter object
  const where: any = {};

  // For public endpoints, default to ACTIVE properties unless specified by admins
  if (status) {
    where.status = status;
  } else {
    // Basic users should only see active properties
    where.status = PropertyStatus.ACTIVE;
  }

  if (city) where.city = { contains: city as string };
  if (locality) where.locality = { contains: locality as string };
  if (propertyType) where.propertyType = propertyType;
  if (possessionStatus) where.possessionStatus = possessionStatus;
  
  if (isFeatured) where.isFeatured = isFeatured === "true";
  if (isPreLaunch) where.isPreLaunch = isPreLaunch === "true";

  // Price range filters (handling BigInt translation)
  if (minPrice || maxPrice) {
    where.AND = [];
    if (minPrice) {
      where.AND.push({ minPrice: { gte: BigInt(minPrice as string) } });
    }
    if (maxPrice) {
      where.AND.push({ maxPrice: { lte: BigInt(maxPrice as string) } });
    }
  }

  // Search filter (searches title and description)
  if (search) {
    where.OR = [
      { title: { contains: search as string } },
      { description: { contains: search as string } },
      { locality: { contains: search as string } },
    ];
  }

  const [properties, total] = await prisma.$transaction([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        developer: {
          select: {
            companyName: true,
            logoUrl: true,
          },
        },
        images: {
          take: 1, // Get primary showcase image
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return res.status(200).json({
    success: true,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: serializeBigInt(properties),
  });
});

/**
 * @desc Soft delete a property listing (Set status to ARCHIVED)
 * @route DELETE /api/properties/:id
 * @access Admin/Super Admin
 */
export const deleteProperty = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };

  const property = await prisma.property.findUnique({
    where: { id },
  });
  if (!property) {
    throw new AppError("Property listing not found", 404);
  }

  await prisma.property.update({
    where: { id },
    data: {
      status: PropertyStatus.ARCHIVED,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Property listing archived successfully",
  });
});
