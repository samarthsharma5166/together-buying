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

/**
 * @desc Join a property group
 * @route POST /api/groups/:groupId/join
 * @access Authenticated (BUYER_PREMIUM, RM, ADMIN, SUPER_ADMIN)
 */
export const joinGroup = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { groupId } = req.params as { groupId: string };
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("User information missing from request context", 401);
  }

  // 1. Verify group exists
  const group = await prisma.propertyGroup.findUnique({
    where: { id: groupId },
  });
  if (!group) {
    throw new AppError("Property group not found", 404);
  }

  // 1.5. Validate subscription status and expiry for regular premium buyers
  const isStaffOrAdmin = req.user?.role === "RM" || req.user?.role === "ADMIN" || req.user?.role === "SUPER_ADMIN";
  if (!isStaffOrAdmin) {
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!activeSubscription) {
      throw new AppError("An active premium subscription is required to join a group.", 403);
    }

    if (activeSubscription.expiresAt && new Date(activeSubscription.expiresAt) < new Date()) {
      throw new AppError("Your premium subscription has expired. Please renew your plan.", 403);
    }
  }

  // 2. Check if user is already in any group (due to userId unique constraint)
  const existingMembership = await prisma.groupMembers.findUnique({
    where: { userId },
    include: {
      group: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });

  if (existingMembership) {
    if (existingMembership.groupId === groupId) {
      throw new AppError("You are already a member of this property group", 400);
    }
    throw new AppError(
      `You are already a member of another group: "${existingMembership.group.name}". Please leave that group first before joining a new one.`,
      409
    );
  }

  // 3. Create group membership and increment current_members in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create member record
    const member = await tx.groupMembers.create({
      data: {
        groupId,
        userId,
      },
    });

    // Increment count on group
    const updatedGroup = await tx.propertyGroup.update({
      where: { id: groupId },
      data: {
        current_members: {
          increment: 1,
        },
      },
    });

    return { member, updatedGroup };
  });

  return res.status(200).json({
    success: true,
    message: "Successfully joined the group",
    data: {
      member: result.member,
      currentMembers: result.updatedGroup.current_members,
    },
  });
});

/**
 * @desc Leave a property group
 * @route POST /api/groups/:groupId/leave
 * @access Authenticated (BUYER_PREMIUM, RM, ADMIN, SUPER_ADMIN)
 */
export const leaveGroup = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { groupId } = req.params as { groupId: string };
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("User information missing from request context", 401);
  }

  // 1. Verify group exists
  const group = await prisma.propertyGroup.findUnique({
    where: { id: groupId },
  });
  if (!group) {
    throw new AppError("Property group not found", 404);
  }

  // 2. Verify membership exists
  const membership = await prisma.groupMembers.findUnique({
    where: { userId },
  });

  if (!membership || membership.groupId !== groupId) {
    throw new AppError("You are not a member of this property group", 400);
  }

  // 3. Remove group membership and decrement current_members in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Delete membership
    await tx.groupMembers.delete({
      where: { userId },
    });

    // Decrement count on group
    const updatedGroup = await tx.propertyGroup.update({
      where: { id: groupId },
      data: {
        current_members: {
          decrement: 1,
        },
      },
    });

    return { updatedGroup };
  });

  return res.status(200).json({
    success: true,
    message: "Successfully left the group",
    data: {
      currentMembers: result.updatedGroup.current_members,
    },
  });
});

/**
 * @desc Get group membership status for the current user
 * @route GET /api/groups/:groupId/membership-status
 * @access Authenticated
 */
export const getGroupMembershipStatus = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { groupId } = req.params as { groupId: string };
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("User information missing from request context", 401);
  }

  const membership = await prisma.groupMembers.findUnique({
    where: { userId },
  });

  const isMember = !!(membership && membership.groupId === groupId);

  return res.status(200).json({
    success: true,
    data: {
      joined: isMember,
      currentGroupId: membership?.groupId || null,
    },
  });
});

/**
 * @desc Get all property groups the authenticated user has participated in
 * @route GET /api/groups/user/my-groups
 * @access Authenticated
 */
export const getMyParticipationGroups = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("User information missing from request context", 401);
  }

  const memberships = await prisma.groupMembers.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          property: {
            include: {
              developer: {
                select: {
                  companyName: true,
                  logoUrl: true,
                },
              },
              images: {
                take: 1,
                select: {
                  imageUrl: true,
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
      },
    },
  });

  const groups = memberships.map((m) => m.group);

  return res.status(200).json({
    success: true,
    data: serializeBigInt(groups),
  });
});
