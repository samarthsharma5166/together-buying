import type { Response } from "express";
import { prisma } from "../db/db.js";
import AppError from "../utils/error.utils.js";
import { tryCatch } from "../utils/tryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { createPropertySchema, updatePropertySchema, toggleFeaturedSchema, updatePossessionStatusSchema, propertyUnitSchema, updateUnitSchema } from "../schemas/property.schemas.js";
import { PropertyStatus } from "@prisma/client";
import { serializeBigInt, removeUndefined } from "../utils/serialize.js";
import fs from "fs";
import path from "path";

// Helper to delete physical files from the uploads directory safely
const deleteFileSafe = (filename: string | null | undefined) => {
  if (!filename) return;
  const filePath = path.join("uploads", filename);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error(`Failed to delete file from disk: ${filePath}`, err);
  }
};

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

// Helper to parse serialized lists back into arrays
export const formatProperty = (property: any) => {
  if (!property) return null;
  const formatted = { ...property };
  
  if (typeof formatted.highlights === "string") {
    try {
      formatted.highlights = JSON.parse(formatted.highlights);
    } catch {
      formatted.highlights = [];
    }
  } else if (!formatted.highlights) {
    formatted.highlights = [];
  }
  
  if (typeof formatted.amenities === "string") {
    try {
      formatted.amenities = JSON.parse(formatted.amenities);
    } catch {
      formatted.amenities = [];
    }
  } else if (!formatted.amenities) {
    formatted.amenities = [];
  }

  if (typeof formatted.specifications === "string") {
    try {
      formatted.specifications = JSON.parse(formatted.specifications);
    } catch {
      formatted.specifications = [];
    }
  } else if (!formatted.specifications) {
    formatted.specifications = [];
  }
  
  return formatted;
};
1234

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
  const { images, units, highlights, amenities, specifications, groupName, rmId, minGroupSize, targetGroupSize, targetDiscount, ...basePropertyData } = parsedData;

  // Use database transaction for atomic creation of property and group
  const property = await prisma.$transaction(async (tx) => {
    const createdProperty = await tx.property.create({
      data: removeUndefined({
        ...basePropertyData,
        slug,
        createdById: req.user!.id,
        highlights: highlights ? JSON.stringify(highlights) : null,
        amenities: amenities ? JSON.stringify(amenities) : null,
        specifications: specifications ? JSON.stringify(specifications) : null,
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
    });

    await tx.propertyGroup.create({
      data: {
        propertyId: createdProperty.id,
        rm_id: rmId,
        name: groupName,
        status: "GROUP_FORMING",
        min_group_size: minGroupSize,
        target_group_size: targetGroupSize,
        target_discount: targetDiscount,
      },
    });

    return await tx.property.findUnique({
      where: { id: createdProperty.id },
      include: {
        images: true,
        units: {
          include: {
            images: true,
          },
        },
        groups: {
          include: {
            rmUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  });

  return res.status(201).json({
    success: true,
    message: "Property listing created successfully",
    data: serializeBigInt(formatProperty(property)),
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
      groups: {
        include: {
          rmUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
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
    data: serializeBigInt(formatProperty(property)),
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
  const { images, units, highlights, amenities, specifications, groupName, rmId, minGroupSize, targetGroupSize, targetDiscount, ...updateData } = parsedData;

  const updateFields: any = {
    ...updateData,
    slug,
  };

  if (highlights !== undefined) {
    updateFields.highlights = highlights ? JSON.stringify(highlights) : null;
  }
  if (amenities !== undefined) {
    updateFields.amenities = amenities ? JSON.stringify(amenities) : null;
  }
  if (specifications !== undefined) {
    updateFields.specifications = specifications ? JSON.stringify(specifications) : null;
  }

  const updatedProperty = await prisma.$transaction(async (tx) => {
    const updated = await tx.property.update({
      where: { id },
      data: removeUndefined(updateFields),
    });

    const groupUpdateFields: any = {};
    if (groupName !== undefined) groupUpdateFields.name = groupName;
    if (rmId !== undefined) groupUpdateFields.rm_id = rmId;
    if (minGroupSize !== undefined) groupUpdateFields.min_group_size = minGroupSize;
    if (targetGroupSize !== undefined) groupUpdateFields.target_group_size = targetGroupSize;
    if (targetDiscount !== undefined) groupUpdateFields.target_discount = targetDiscount;

    if (Object.keys(groupUpdateFields).length > 0) {
      const existingGroup = await tx.propertyGroup.findFirst({
        where: { propertyId: id }
      });
      if (existingGroup) {
        await tx.propertyGroup.update({
          where: { id: existingGroup.id },
          data: groupUpdateFields,
        });
      } else {
        await tx.propertyGroup.create({
          data: {
            propertyId: id,
            rm_id: rmId || req.user!.id,
            name: groupName || `${updated.title} Buying Club`,
            status: "GROUP_FORMING",
            min_group_size: minGroupSize || 5,
            target_group_size: targetGroupSize || 20,
            target_discount: targetDiscount || 10,
          },
        });
      }
    }

    return await tx.property.findUnique({
      where: { id },
      include: {
        images: true,
        units: true,
        groups: {
          include: {
            rmUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  });

  return res.status(200).json({
    success: true,
    message: "Property listing updated successfully",
    data: serializeBigInt(formatProperty(updatedProperty)),
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
            id: true,
            companyName: true,
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
        groups: {
          include: {
            rmUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
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
    data: serializeBigInt(properties.map(formatProperty)),
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

  const result = await prisma.property.update({
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

/**
 * @desc Upload property images for an existing property
 * @route POST /api/properties/:propertyId/images
 * @access Admin/Super Admin
 */
export const uploadPropertyImages = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { propertyId } = req.params as { propertyId: string };

  // Verify property exists
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });
  if (!property) {
    throw new AppError("Property listing not found", 404);
  }

  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    throw new AppError("No files uploaded", 400);
  }

  // Optional metadata from body
  const caption = typeof req.body.caption === "string" ? req.body.caption : null;
  const imageType = typeof req.body.imageType === "string" ? req.body.imageType as any : "EXTERIOR";

  try {
    const createdImages = await prisma.$transaction(
      files.map((file, idx) =>
        prisma.propertyImage.create({
          data: {
            propertyId,
            imageUrl: file.filename,
            caption,
            imageType,
            sortOrder: idx,
          },
        })
      )
    );

    return res.status(201).json({
      success: true,
      message: "Property images uploaded successfully",
      data: serializeBigInt(createdImages),
    });
  } catch (error) {
    // Delete files if database create transaction failed
    files.forEach((file) => deleteFileSafe(file.filename));
    throw error;
  }
});

/**
 * @desc Delete a property image from DB and disk
 * @route DELETE /api/properties/images/:imageId
 * @access Admin/Super Admin
 */
export const deletePropertyImage = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { imageId } = req.params as { imageId: string };

  const image = await prisma.propertyImage.findUnique({
    where: { id: imageId },
  });
  if (!image) {
    throw new AppError("Property image not found", 404);
  }

  // Delete DB record
  await prisma.propertyImage.delete({
    where: { id: imageId },
  });

  // Delete physical file
  deleteFileSafe(image.imageUrl);

  return res.status(200).json({
    success: true,
    message: "Property image deleted successfully",
  });
});

/**
 * @desc Get all active featured properties
 * @route GET /api/properties/featured
 * @access Public
 */
export const getFeaturedProperties = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const properties = await prisma.property.findMany({
    where: {
      status: PropertyStatus.ACTIVE,
      isFeatured: true,
    },
    orderBy: { createdAt: "desc" },
    include: {
      developer: {
        select: { 
          companyName: true,
          logoUrl: true,
        },
      },
      images: {
        take: 1,
        orderBy: { sortOrder: "asc" },
      },
      groups: {
        include: {
          rmUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  return res.status(200).json({
    success: true,
    data: serializeBigInt(properties),
  });
});

/**
 * @desc Toggle featured flag for property
 * @route PATCH /api/properties/:id/featured
 * @access Admin/Super Admin
 */
export const toggleFeatured = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { isFeatured } = toggleFeaturedSchema.parse(req.body);

  const property = await prisma.property.findUnique({
    where: { id },
  });
  if (!property) {
    throw new AppError("Property listing not found", 404);
  }

  const updatedProperty = await prisma.property.update({
    where: { id },
    data: { isFeatured },
  });

  return res.status(200).json({
    success: true,
    message: `Property marked as ${isFeatured ? "featured" : "standard"} successfully`,
    data: serializeBigInt(updatedProperty),
  });
});

/**
 * @desc Update property possession status
 * @route PATCH /api/properties/:id/possession-status
 * @access Admin/Super Admin
 */
export const updatePossessionStatus = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { possessionStatus } = updatePossessionStatusSchema.parse(req.body);

  const property = await prisma.property.findUnique({
    where: { id },
  });
  if (!property) {
    throw new AppError("Property listing not found", 404);
  }

  const updatedProperty = await prisma.property.update({
    where: { id },
    data: { possessionStatus },
  });

  return res.status(200).json({
    success: true,
    message: "Property possession status updated successfully",
    data: serializeBigInt(updatedProperty),
  });
});

/**
 * @desc Create a new unit plan for an existing property
 * @route POST /api/properties/:propertyId/units
 * @access Admin/Super Admin
 */
export const createPropertyUnit = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { propertyId } = req.params as { propertyId: string };
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });
  if (!property) {
    throw new AppError("Property listing not found", 404);
  }

  const parsedData = propertyUnitSchema.parse(req.body);
  const { images, ...unitData } = parsedData;

  const unit = await prisma.propertyUnit.create({
    data: removeUndefined({
      unitType: unitData.unitType,
      carpetAreaSqft: unitData.carpetAreaSqft,
      superAreaSqft: unitData.superAreaSqft ?? null,
      price: unitData.price,
      availableUnits: unitData.availableUnits ?? null,
      propertyId,
      images: images && images.length > 0 ? {
        create: images.map((img) => ({
          imageUrl: img.imageUrl,
          imageType: img.imageType,
          caption: img.caption || null,
          sortOrder: img.sortOrder || 0,
        }))
      } : undefined
    }),
    include: {
      images: true
    }
  });

  return res.status(201).json({
    success: true,
    message: "Property unit created successfully",
    data: serializeBigInt(unit)
  });
});

/**
 * @desc Update a property unit plan
 * @route PATCH /api/properties/units/:unitId
 * @access Admin/Super Admin
 */
export const updatePropertyUnit = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { unitId } = req.params as { unitId: string };
  const existingUnit = await prisma.propertyUnit.findUnique({
    where: { id: unitId },
  });
  if (!existingUnit) {
    throw new AppError("Property unit not found", 404);
  }

  const parsedData = updateUnitSchema.parse(req.body);
  const { images, ...updateData } = parsedData;

  const updatedUnit = await prisma.propertyUnit.update({
    where: { id: unitId },
    data: removeUndefined({
      unitType: updateData.unitType,
      carpetAreaSqft: updateData.carpetAreaSqft,
      superAreaSqft: updateData.superAreaSqft === undefined ? undefined : (updateData.superAreaSqft ?? null),
      price: updateData.price,
      availableUnits: updateData.availableUnits === undefined ? undefined : (updateData.availableUnits ?? null),
    }),
    include: {
      images: true
    }
  });

  return res.status(200).json({
    success: true,
    message: "Property unit updated successfully",
    data: serializeBigInt(updatedUnit)
  });
});

/**
 * @desc Delete a property unit plan
 * @route DELETE /api/properties/units/:unitId
 * @access Admin/Super Admin
 */
export const deletePropertyUnit = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { unitId } = req.params as { unitId: string };
  const existingUnit = await prisma.propertyUnit.findUnique({
    where: { id: unitId },
    include: { images: true }
  });
  if (!existingUnit) {
    throw new AppError("Property unit not found", 404);
  }

  // Delete physical image files from disk
  if (existingUnit.images) {
    existingUnit.images.forEach((img) => {
      deleteFileSafe(img.imageUrl);
    });
  }

  await prisma.propertyUnit.delete({
    where: { id: unitId }
  });

  return res.status(200).json({
    success: true,
    message: "Property unit deleted successfully"
  });
});

/**
 * @desc Upload unit images for an existing unit
 * @route POST /api/properties/units/:unitId/images
 * @access Admin/Super Admin
 */
export const uploadPropertyUnitImage = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { unitId } = req.params as { unitId: string };
  const unit = await prisma.propertyUnit.findUnique({
    where: { id: unitId },
  });
  if (!unit) {
    throw new AppError("Property unit not found", 404);
  }

  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    throw new AppError("No files uploaded", 400);
  }

  const caption = typeof req.body.caption === "string" ? req.body.caption : null;
  const imageType = typeof req.body.imageType === "string" ? req.body.imageType as any : "FLOOR_PLAN";

  try {
    const createdImages = await prisma.$transaction(
      files.map((file, idx) =>
        prisma.unitImage.create({
          data: {
            unitId,
            imageUrl: file.filename,
            caption,
            imageType,
            sortOrder: idx,
          },
        })
      )
    );

    return res.status(201).json({
      success: true,
      message: "Unit images uploaded successfully",
      data: serializeBigInt(createdImages),
    });
  } catch (error) {
    files.forEach((file) => deleteFileSafe(file.filename));
    throw error;
  }
});

/**
 * @desc Delete a unit image
 * @route DELETE /api/properties/units/images/:imageId
 * @access Admin/Super Admin
 */
export const deletePropertyUnitImage = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { imageId } = req.params as { imageId: string };
  const image = await prisma.unitImage.findUnique({
    where: { id: imageId },
  });
  if (!image) {
    throw new AppError("Unit image not found", 404);
  }

  await prisma.unitImage.delete({
    where: { id: imageId },
  });

  deleteFileSafe(image.imageUrl);

  return res.status(200).json({
    success: true,
    message: "Unit image deleted successfully",
  });
});
