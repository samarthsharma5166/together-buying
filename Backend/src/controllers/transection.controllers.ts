import type { Response } from "express";
import { prisma } from "../db/db.js";
import { tryCatch } from "../utils/tryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

/**
 * @desc Get current authenticated user's transaction history
 * @route GET /api/transections
 * @access Authenticated
 */
export const getMyTransections = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const transections = await prisma.transections.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({
    success: true,
    data: transections,
  });
});
