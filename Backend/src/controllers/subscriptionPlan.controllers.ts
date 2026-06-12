import type { Response } from "express";
import { prisma } from "../db/db.js";
import AppError from "../utils/error.utils.js";
import { tryCatch } from "../utils/tryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { createSubscriptionPlanSchema, updateSubscriptionPlanSchema } from "../schemas/subscriptionPlan.schemas.js";
import { removeUndefined } from "../utils/serialize.js";

/**
 * @desc Get all subscription plans
 * @route GET /api/subscription-plans
 * @access Public / Authenticated
 */
export const listSubscriptionPlans = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    success: true,
    data: plans,
  });
});

/**
 * @desc Get single subscription plan details
 * @route GET /api/subscription-plans/:id
 * @access Public / Authenticated
 */
export const getSubscriptionPlan = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id },
  });

  if (!plan) {
    throw new AppError("Subscription plan not found", 404);
  }

  return res.status(200).json({
    success: true,
    data: plan,
  });
});

/**
 * @desc Create new subscription plan
 * @route POST /api/subscription-plans
 * @access Admin/Super Admin
 */
export const createSubscriptionPlan = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const parsedData = createSubscriptionPlanSchema.parse(req.body);

  const plan = await prisma.subscriptionPlan.create({
    data: {
      type: parsedData.type,
      price: parsedData.price,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Subscription plan created successfully",
    data: plan,
  });
});

/**
 * @desc Update subscription plan details
 * @route PATCH /api/subscription-plans/:id
 * @access Admin/Super Admin
 */
export const updateSubscriptionPlan = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const parsedData = updateSubscriptionPlanSchema.parse(req.body);

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id },
  });
  if (!plan) {
    throw new AppError("Subscription plan not found", 404);
  }

  const updatedPlan = await prisma.subscriptionPlan.update({
    where: { id },
    data: removeUndefined({
      type: parsedData.type,
      price: parsedData.price,
    }),
  });

  return res.status(200).json({
    success: true,
    message: "Subscription plan updated successfully",
    data: updatedPlan,
  });
});

/**
 * @desc Delete subscription plan
 * @route DELETE /api/subscription-plans/:id
 * @access Admin/Super Admin
 */
export const deleteSubscriptionPlan = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id },
  });
  if (!plan) {
    throw new AppError("Subscription plan not found", 404);
  }

  await prisma.subscriptionPlan.delete({
    where: { id },
  });

  return res.status(200).json({
    success: true,
    message: "Subscription plan deleted successfully",
  });
});
