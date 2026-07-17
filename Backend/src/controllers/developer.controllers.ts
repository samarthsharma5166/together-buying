import type { Request, Response } from "express";
import { prisma } from "../db/db.js";
import AppError from "../utils/error.utils.js";
import { tryCatch } from "../utils/tryCatch.js";
import { createDeveloperSchema, updateDeveloperSchema } from "../schemas/developer.schemas.js";
import { PartnershipStatus } from "@prisma/client";
import { serializeBigInt, removeUndefined } from "../utils/serialize.js";
import fs from "fs";
import path from "path";

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
const getUniqueDeveloperSlug = async (companyName: string): Promise<string> => {
  const baseSlug = generateSlug(companyName);
  let slug = baseSlug;
  let count = 1;
  while (true) {
    const existing = await prisma.developer.findUnique({
      where: { slug },
    });
    if (!existing) break;
    slug = `${baseSlug}-${count}`;
    count++;
  }
  return slug;
};

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

/**
 * @desc Create a new developer profile
 * @route POST /api/developers
 * @access Admin/Super Admin
 */
export const createDeveloper = tryCatch(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const logoFile = files?.["logo"]?.[0];
  const bannerFile = files?.["bannerImage"]?.[0];

  if (logoFile) {
    req.body.logoUrl = logoFile.filename;
  }
  if (bannerFile) {
    req.body.bannerImageUrl = bannerFile.filename;
  }

  try {
    const parsedData = createDeveloperSchema.parse(req.body);

    // Check for email/phone duplicate conflicts
    const existingEmail = await prisma.developer.findUnique({
      where: { contactEmail: parsedData.contactEmail },
    });
    if (existingEmail) {
      throw new AppError("Developer with this contact email already exists", 400);
    }

    const existingPhone = await prisma.developer.findUnique({
      where: { contactPhone: parsedData.contactPhone },
    });
    if (existingPhone) {
      throw new AppError("Developer with this contact phone already exists", 400);
    }

    // Generate unique slug
    const slug = await getUniqueDeveloperSlug(parsedData.companyName);

    const developer = await prisma.developer.create({
      data: removeUndefined({
        ...parsedData,
        slug,
        partnershipStart: parsedData.partnershipStart || new Date(),
      }),
    });

    return res.status(201).json({
      success: true,
      message: "Developer profile created successfully",
      data: serializeBigInt(developer),
    });
  } catch (error) {
    // Reclaim disk space if validation or DB creation failed
    if (logoFile) deleteFileSafe(logoFile.filename);
    if (bannerFile) deleteFileSafe(bannerFile.filename);
    throw error;
  }
});

/**
 * @desc Get developer by ID or Slug
 * @route GET /api/developers/:idOrSlug
 * @access Public
 */
export const getDeveloper = tryCatch(async (req: Request, res: Response) => {
  const { idOrSlug } = req.params as { idOrSlug: string };

  // Determine if searching by UUID or slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  const developer = await prisma.developer.findFirst({
    where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
    include: {
      properties: {
        where: {
          status: "ACTIVE", // Only show active projects in public view
        },
        select: {
          id: true,
          title: true,
          slug: true,
          propertyType: true,
          locality: true,
          city: true,
          minPrice: true,
          maxPrice: true,
          possessionStatus: true,
        },
      },
    },
  });

  if (!developer) {
    throw new AppError("Developer profile not found", 404);
  }

  return res.status(200).json({
    success: true,
    data: serializeBigInt(developer),
  });
});

/**
 * @desc Update developer profile
 * @route PATCH /api/developers/:id
 * @access Admin/Super Admin
 */
export const updateDeveloper = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const developer = await prisma.developer.findUnique({
    where: { id },
  });
  
  if (!developer) {
    throw new AppError("Developer not found", 404);
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const logoFile = files?.["logo"]?.[0];
  const bannerFile = files?.["bannerImage"]?.[0];

  if (logoFile) {
    req.body.logoUrl = logoFile.filename;
  }
  if (bannerFile) {
    req.body.bannerImageUrl = bannerFile.filename;
  }

  try {
    const parsedData = updateDeveloperSchema.parse(req.body);

    // Conflict checking if updating email
    if (parsedData.contactEmail && parsedData.contactEmail !== developer.contactEmail) {
      const emailConflict = await prisma.developer.findUnique({
        where: { contactEmail: parsedData.contactEmail },
      });
      if (emailConflict) {
        throw new AppError("Email is already assigned to another developer", 400);
      }
    }

    // Conflict checking if updating phone
    if (parsedData.contactPhone && parsedData.contactPhone !== developer.contactPhone) {
      const phoneConflict = await prisma.developer.findUnique({
        where: { contactPhone: parsedData.contactPhone },
      });
      if (phoneConflict) {
        throw new AppError("Phone number is already assigned to another developer", 400);
      }
    }

    // Regenerate slug if company name is updated
    let slug = developer.slug;
    if (parsedData.companyName && parsedData.companyName !== developer.companyName) {
      slug = await getUniqueDeveloperSlug(parsedData.companyName);
    }

    const updatedDeveloper = await prisma.developer.update({
      where: { id },
      data: removeUndefined({
        ...parsedData,
        slug,
      }),
    });

    // Clean up old replacement files upon successful update
    if (logoFile) {
      deleteFileSafe(developer.logoUrl);
    }
    if (bannerFile) {
      deleteFileSafe(developer.bannerImageUrl);
    }

    return res.status(200).json({
      success: true,
      message: "Developer profile updated successfully",
      data: serializeBigInt(updatedDeveloper),
    });
  } catch (error) {
    // Delete newly uploaded files on error to prevent orphan build-ups
    if (logoFile) deleteFileSafe(logoFile.filename);
    if (bannerFile) deleteFileSafe(bannerFile.filename);
    throw error;
  }
});

/**
 * @desc List developers with filtering & pagination
 * @route GET /api/developers
 * @access Public
 */
export const listDevelopers = tryCatch(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const status = (req.query.status as PartnershipStatus) || undefined;

  const skip = (page - 1) * limit;

  // Construct filtering conditions
  const where: any = {};
  
  if (status) {
    where.partnershipStatus = status;
  }

  if (search) {
    where.OR = [
      { companyName: { contains: search } },
      { headquartersCity: { contains: search } },
      { contactName: { contains: search } },
    ];
  }

  const [developers, total] = await prisma.$transaction([
    prisma.developer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { companyName: "asc" },
      include: {
        _count: {
          select: { properties: true },
        },
      },
    }),
    prisma.developer.count({ where }),
  ]);

  return res.status(200).json({
    success: true,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: serializeBigInt(developers),
  });
});

/**
 * @desc Soft-delete a developer (Set status to TERMINATED)
 * @route DELETE /api/developers/terminate/:id
 * @access Admin/Super Admin
 */
export const deleteDeveloper = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const developer = await prisma.developer.findUnique({
    where: { id },
  });
  if (!developer) {
    throw new AppError("Developer profile not found", 404);
  }

  await prisma.developer.update({
    where: { id },
    data: {
      partnershipStatus: PartnershipStatus.TERMINATED,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Developer partnership marked as terminated successfully",
  });
});
