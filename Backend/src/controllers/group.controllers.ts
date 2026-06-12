import type { Response } from "express";
import { prisma } from "../db/db.js";
import AppError from "../utils/error.utils.js";
import { tryCatch } from "../utils/tryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { createGroupSchema, updateGroupSchema } from "../schemas/group.schemas.js";
import { serializeBigInt } from "../utils/serialize.js";

/**
 * @desc Get all property groups
 * @route GET /api/groups
 * @access Admin/Super Admin
 */
export const listGroups = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const groups = await prisma.propertyGroup.findMany({
    include: {
      property: {
        include: {
          developer: {
            select: {
              companyName: true,
              logoUrl: true,
            },
          },
        },
      },
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
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    success: true,
    data: serializeBigInt(groups),
  });
});

/**
 * @desc Get single group details
 * @route GET /api/groups/:id
 * @access Admin/Super Admin
 */
export const getGroup = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };

  const group = await prisma.propertyGroup.findUnique({
    where: { id },
    include: {
      property: true,
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
  });

  if (!group) {
    throw new AppError("Property group not found", 404);
  }

  return res.status(200).json({
    success: true,
    data: serializeBigInt(group),
  });
});

/**
 * @desc Create new property group
 * @route POST /api/groups
 * @access Admin/Super Admin
 */
export const createGroup = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const parsedData = createGroupSchema.parse(req.body);

  // Check if property exists
  const property = await prisma.property.findUnique({
    where: { id: parsedData.propertyId },
  });
  if (!property) {
    throw new AppError("Property listing not found", 404);
  }

  // Check if RM exists
  const rm = await prisma.user.findFirst({
    where: { id: parsedData.rmId, role: "RM" },
  });
  if (!rm) {
    throw new AppError("Relationship Manager (RM) not found", 404);
  }

  const group = await prisma.propertyGroup.create({
    data: {
      propertyId: parsedData.propertyId,
      rm_id: parsedData.rmId,
      name: parsedData.name,
      status: parsedData.status || "GROUP_FORMING",
      min_group_size: parsedData.minGroupSize,
      target_group_size: parsedData.targetGroupSize,
      target_discount: parsedData.targetDiscount,
    },
    include: {
      property: true,
      rmUser: true,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Group created and RM assigned successfully",
    data: serializeBigInt(group),
  });
});

/**
 * @desc Update property group details
 * @route PATCH /api/groups/:id
 * @access Admin/Super Admin
 */
export const updateGroup = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const parsedData = updateGroupSchema.parse(req.body);

  const group = await prisma.propertyGroup.findUnique({
    where: { id },
  });
  if (!group) {
    throw new AppError("Property group not found", 404);
  }

  if (parsedData.rmId) {
    const rm = await prisma.user.findFirst({
      where: { id: parsedData.rmId, role: "RM" },
    });
    if (!rm) {
      throw new AppError("Relationship Manager (RM) not found", 404);
    }
  }

  const updateFields: any = {};
  if (parsedData.name !== undefined) updateFields.name = parsedData.name;
  if (parsedData.rmId !== undefined) updateFields.rm_id = parsedData.rmId;
  if (parsedData.minGroupSize !== undefined) updateFields.min_group_size = parsedData.minGroupSize;
  if (parsedData.targetGroupSize !== undefined) updateFields.target_group_size = parsedData.targetGroupSize;
  if (parsedData.targetDiscount !== undefined) updateFields.target_discount = parsedData.targetDiscount;
  if (parsedData.status !== undefined) updateFields.status = parsedData.status;

  const updatedGroup = await prisma.propertyGroup.update({
    where: { id },
    data: updateFields,
    include: {
      property: true,
      rmUser: true,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Property group updated successfully",
    data: serializeBigInt(updatedGroup),
  });
});

/**
 * @desc Delete property group
 * @route DELETE /api/groups/:id
 * @access Admin/Super Admin
 */
export const deleteGroup = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };

  const group = await prisma.propertyGroup.findUnique({
    where: { id },
  });
  if (!group) {
    throw new AppError("Property group not found", 404);
  }

  await prisma.propertyGroup.delete({
    where: { id },
  });

  return res.status(200).json({
    success: true,
    message: "Property group deleted successfully",
  });
});

/**
 * @desc Get list of all Relationship Managers (RMs)
 * @route GET /api/groups/rms
 * @access Admin/Super Admin
 */
export const listRMs = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const rms = await prisma.user.findMany({
    where: { role: "RM" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
    orderBy: { firstName: "asc" },
  });

  return res.status(200).json({
    success: true,
    data: rms,
  });
});

/**
 * @desc Get list of properties that do not have groups
 * @route GET /api/groups/unassigned-properties
 * @access Admin/Super Admin
 */
export const getUnassignedProperties = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const properties = await prisma.property.findMany({
    where: {
      groups: {
        none: {},
      },
    },
    include: {
      developer: {
        select: {
          companyName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    success: true,
    data: serializeBigInt(properties),
  });
});

/**
 * @desc Get list of properties that have groups
 * @route GET /api/groups/assigned-properties
 * @access Admin/Super Admin
 */
export const getAssignedProperties = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const properties = await prisma.property.findMany({
    where: {
      groups: {
        some: {},
      },
    },
    include: {
      developer: {
        select: {
          companyName: true,
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
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    success: true,
    data: serializeBigInt(properties),
  });
});
