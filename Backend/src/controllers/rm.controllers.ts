import type { Response } from "express";
import { prisma } from "../db/db.js";
import AppError from "../utils/error.utils.js";
import { tryCatch } from "../utils/tryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { serializeBigInt } from "../utils/serialize.js";

/**
 * @desc Get all property groups assigned to the authenticated Relationship Manager (RM)
 * @route GET /api/rm/groups
 * @access Authenticated (RM, ADMIN, SUPER_ADMIN)
 */
export const getMyGroups = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const rmId = req.user?.id as string;

  if (!rmId) {
    throw new AppError("User information missing from request context", 401);
  }

  const { search, status, page = "1", limit = "10", sortBy = "createdAt", order = "desc" } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const whereClause: any = {
    rm_id: rmId,
  };

  if (status && status !== "ALL") {
    whereClause.status = status as string;
  }

  if (search) {
    const searchStr = String(search).trim();
    whereClause.OR = [
      { name: { contains: searchStr } },
      { property: { title: { contains: searchStr } } },
      { property: { city: { contains: searchStr } } },
      { property: { locality: { contains: searchStr } } },
    ];
  }

  // Handle sorting
  let orderByClause: any = { createdAt: "desc" };
  const sortDirection = String(order).toLowerCase() === "asc" ? "asc" : "desc";

  switch (sortBy) {
    case "name":
      orderByClause = { name: sortDirection };
      break;
    case "current_members":
      orderByClause = { current_members: sortDirection };
      break;
    case "updatedAt":
      orderByClause = { updatedAt: sortDirection };
      break;
    case "createdAt":
    default:
      orderByClause = { createdAt: sortDirection };
      break;
  }

  // Get total count for pagination metadata
  const total = await prisma.propertyGroup.count({
    where: whereClause,
  });

  const groups = await prisma.propertyGroup.findMany({
    where: whereClause,
    include: {
      property: {
        select: {
          id: true,
          title: true,
          slug: true,
          city: true,
          locality: true,
          minPrice: true,
          maxPrice: true,
          images: {
            take: 1,
            select: {
              imageUrl: true,
            },
          },
        },
      },
      members: {
        select: {
          id: true,
          createdAt: true,
          user: {
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
    orderBy: orderByClause,
    skip,
    take: limitNum,
  });

  return res.status(200).json({
    success: true,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
    data: serializeBigInt(groups),
  });
});

/**
 * @desc Get summary statistics for the RM Dashboard
 * @route GET /api/rm/groups/summary
 * @access Authenticated (RM, ADMIN, SUPER_ADMIN)
 */
export const getGroupsSummary = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const rmId = req.user?.id as string;

  if (!rmId) {
    throw new AppError("User information missing from request context", 401);
  }

  // All queries MUST filter by rm_id
  const [totalGroups, activeGroups, formingGroups, developerAgreedGroups] = await Promise.all([
    prisma.propertyGroup.count({ where: { rm_id: rmId } }),
    prisma.propertyGroup.count({ where: { rm_id: rmId, status: "GROUP_ACTIVE" } }),
    prisma.propertyGroup.count({ where: { rm_id: rmId, status: "GROUP_FORMING" } }),
    prisma.propertyGroup.count({ where: { rm_id: rmId, status: "DEVELOPER_AGREED" } }),
  ]);

  // Aggregate sum of current_members for total customers
  const totalCustomersAgg = await prisma.propertyGroup.aggregate({
    where: { rm_id: rmId },
    _sum: {
      current_members: true,
    },
  });

  const totalCustomers = totalCustomersAgg._sum.current_members || 0;

  return res.status(200).json({
    success: true,
    data: {
      totalGroups,
      activeGroups,
      formingGroups,
      developerAgreedGroups,
      totalCustomers,
    },
  });
});

/**
 * @desc Update the status of a specific group
 * @route PATCH /api/rm/groups/:id/status
 * @access Authenticated (RM, ADMIN, SUPER_ADMIN)
 */
export const updateGroupStatus = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const rmId = req.user?.id as string;
  const groupId = req.params.id as string;
  const { status } = req.body;

  if (!rmId) {
    throw new AppError("User information missing from request context", 401);
  }

  if (!status) {
    throw new AppError("Status is required", 400);
  }

  // Verify group belongs to RM before updating
  const existingGroup = await prisma.propertyGroup.findFirst({
    where: {
      id: groupId,
      rm_id: rmId, // STRICT AUTH: Ensure RM owns this group
    },
  });

  if (!existingGroup) {
    throw new AppError("Group not found or you are not authorized to update it", 404);
  }

  const updatedGroup = await prisma.propertyGroup.update({
    where: { id: groupId },
    data: { status },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          slug: true,
          city: true,
          locality: true,
          minPrice: true,
          maxPrice: true,
          images: { take: 1, select: { imageUrl: true } },
        },
      },
      members: {
        select: {
          id: true,
          createdAt: true,
          user: {
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
    data: serializeBigInt(updatedGroup),
  });
});
