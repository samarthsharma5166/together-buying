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

  const groups = await prisma.propertyGroup.findMany({
    where: { rm_id: rmId },
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
  });

  return res.status(200).json({
    success: true,
    data: serializeBigInt(groups),
  });
});
