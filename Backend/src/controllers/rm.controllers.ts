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
  const rmId = req.user?.id;

  if (!rmId) {
    throw new AppError("User information missing from request context", 401);
  }

  const { search, status, page = "1", limit = "10" } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const whereClause: any = {
    rm_id: rmId,
  };

  if (status && status !== "ALL") {
    whereClause.status = status;
  }

  if (search) {
    const searchStr = String(search).trim();
    whereClause.OR = [
      {
        name: {
          contains: searchStr,
        },
      },
      {
        property: {
          title: {
            contains: searchStr,
          },
        },
      },
      {
        property: {
          city: {
            contains: searchStr,
          },
        },
      },
      {
        property: {
          locality: {
            contains: searchStr,
          },
        },
      },
    ];
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
    orderBy: { createdAt: "desc" },
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
