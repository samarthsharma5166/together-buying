import type { Request, Response } from "express";
import { prisma } from "../db/db.js";
import AppError from "../utils/error.utils.js";
import { tryCatch } from "../utils/tryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import Razorpay from "razorpay";
import crypto from "crypto";

function calculateExpiryDate(type: "MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFE_TIME"): Date {
  const now = new Date();
  switch (type) {
    case "MONTHLY":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case "QUARTERLY":
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    case "YEARLY":
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    case "LIFE_TIME":
      return new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mockkeyid1234",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_test_mocksecret1234",
});

/**
 * @desc Initiate checkout for subscription plan (creates Razorpay order)
 * @route POST /api/subscriptions/checkout
 * @access Authenticated
 */
export const checkoutSubscription = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { planId } = req.body as { planId: string };
  if (!planId) {
    throw new AppError("Plan ID is required", 400);
  }

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new AppError("Subscription plan not found", 404);
  }

  // Create Razorpay Order
  const amountInPaisa = Math.round(plan.price * 100);
  const options = {
    amount: amountInPaisa,
    currency: "INR",
    receipt: `receipt_plan_${planId.substring(0, 8)}_${Date.now()}`,
    notes: {
      planId,
      userId: req.user!.id,
    },
  };

  try {
    let orderId: string;
    let amount: number;
    let currency: string;

    const isMock = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith("rzp_test_mock");

    if (isMock) {
      orderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
      amount = amountInPaisa;
      currency = "INR";
      console.log(`[Subscription Checkout] Generated mock Razorpay order: ${orderId}`);
    } else {
      const order = await razorpay.orders.create(options);
      orderId = order.id;
      amount = Number(order.amount);
      currency = order.currency as string;
    }
    
    // Log initial transaction as pending
    await prisma.transections.create({
      data: {
        id: orderId, // Use order ID as transaction ID
        userId: req.user!.id,
        amount: plan.price,
        status: "PENDING",
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        orderId,
        amount,
        currency,
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_mockkeyid1234",
        plan: {
          type: plan.type,
          price: plan.price,
        }
      },
    });
  } catch (error: any) {
    console.error("Razorpay order creation failed:", error);
    throw new AppError(error.message || "Failed to create payment order", 500);
  }
});

/**
 * @desc Handle Razorpay Webhook notifications
 * @route POST /api/subscriptions/webhook
 * @access Public / Webhook verified
 */
export const handleWebhook = tryCatch(async (req: Request, res: Response) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "web_secret";
  const signature = req.headers["x-razorpay-signature"] as string;

  if (!signature) {
    throw new AppError("Signature missing", 400);
  }

  // Verify webhook signature
  const shasum = crypto.createHmac("sha256", webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest !== signature) {
    throw new AppError("Invalid webhook signature", 400);
  }

  const event = req.body.event;
  console.log(`Razorpay webhook received event: ${event}`);

  if (event === "order.paid" || event === "payment.captured") {
    // Extract notes
    const paymentEntity = req.body.payload.payment?.entity || req.body.payload.order?.entity;
    const orderId = paymentEntity?.order_id;
    const notes = paymentEntity?.notes || {};
    const { planId, userId } = notes as { planId?: string; userId?: string };

    if (!planId || !userId) {
      console.warn("Webhook notes missing planId or userId:", notes);
      return res.status(200).json({ success: true, message: "Ignored (missing metadata)" });
    }

    // Process payment success inside a transaction
    await prisma.$transaction(async (tx) => {
      // Find the plan to confirm pricing/type
      const plan = await tx.subscriptionPlan.findUnique({
        where: { id: planId },
      });
      if (!plan) throw new Error("Plan not found");

      // Check if user already has an active subscription
      const existingSubscription = await tx.subscription.findFirst({
        where: { userId, status: "ACTIVE" },
      });

      if (existingSubscription) {
        // Deactivate old subscription
        await tx.subscription.update({
          where: { id: existingSubscription.id },
          data: { status: "INACTIVE" },
        });
      }

      // Create new active subscription
      await tx.subscription.create({
        data: {
          userId,
          amount: plan.price,
          status: "ACTIVE",
          planId: plan.id,
          expiresAt: calculateExpiryDate(plan.type),
        },
      });

      // Update user's role to BUYER_PREMIUM
      await tx.user.update({
        where: { id: userId },
        data: { role: "BUYER_PREMIUM" },
      });

      // Upsert transaction log as SUCCESS
      await tx.transections.upsert({
        where: { id: orderId || `tx_${Date.now()}` },
        update: { status: "SUCCESS" },
        create: {
          id: orderId || `tx_${Date.now()}`,
          userId,
          amount: plan.price,
          status: "SUCCESS",
        },
      });
    });

    console.log(`Successfully upgraded user ${userId} to BUYER_PREMIUM for plan ${planId}`);
  }

  return res.status(200).json({
    success: true,
    message: "Webhook processed successfully",
  });
});

/**
 * @desc Manually complete subscription for local mock payments (development only)
 * @route POST /api/subscriptions/mock-complete
 * @access Authenticated
 */
export const mockCompleteSubscription = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const isMock = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith("rzp_test_mock");
  if (!isMock && process.env.NODE_ENV === "production") {
    throw new AppError("Mock payment is disabled in production", 403);
  }

  const { planId } = req.body as { planId: string };
  if (!planId) {
    throw new AppError("Plan ID is required", 400);
  }

  const userId = req.user!.id;

  await prisma.$transaction(async (tx) => {
    const plan = await tx.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) throw new Error("Plan not found");

    const existingSubscription = await tx.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
    });

    if (existingSubscription) {
      await tx.subscription.update({
        where: { id: existingSubscription.id },
        data: { status: "INACTIVE" },
      });
    }

    await tx.subscription.create({
      data: {
        userId,
        amount: plan.price,
        status: "ACTIVE",
        planId: plan.id,
        expiresAt: calculateExpiryDate(plan.type),
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { role: "BUYER_PREMIUM" },
    });

    await tx.transections.create({
      data: {
        id: `tx_mock_${Math.random().toString(36).substring(2, 15)}`,
        userId,
        amount: plan.price,
        status: "SUCCESS",
      },
    });
  });

  return res.status(200).json({
    success: true,
    message: "Mock payment completed successfully, role upgraded",
  });
});

/**
 * @desc Verify Razorpay payment signature and upgrade user (alternative callback flow for local dev)
 * @route POST /api/subscriptions/verify
 * @access Authenticated
 */
export const verifySubscriptionPayment = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, planId } = req.body as {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    planId: string;
  };

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !planId) {
    throw new AppError("All payment verification parameters are required", 400);
  }

  const isMock = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith("rzp_test_mock");
  
  if (!isMock) {
    // Verify signature
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(text)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      throw new AppError("Invalid payment signature verification failed", 400);
    }
  }

  const userId = req.user!.id;

  // Process payment success inside a transaction
  await prisma.$transaction(async (tx) => {
    const plan = await tx.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) throw new Error("Plan not found");

    const existingSubscription = await tx.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
    });

    if (existingSubscription) {
      await tx.subscription.update({
        where: { id: existingSubscription.id },
        data: { status: "INACTIVE" },
      });
    }

    await tx.subscription.create({
      data: {
        userId,
        amount: plan.price,
        status: "ACTIVE",
        planId: plan.id,
        expiresAt: calculateExpiryDate(plan.type),
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { role: "BUYER_PREMIUM" },
    });

    // Log transaction success
    await tx.transections.upsert({
      where: { id: razorpay_order_id },
      update: { status: "SUCCESS" },
      create: {
        id: razorpay_order_id,
        userId,
        amount: plan.price,
        status: "SUCCESS",
      },
    });
  });

  return res.status(200).json({
    success: true,
    message: "Payment verified successfully, membership upgraded",
  });
});

/**
 * @desc Get authenticated user's subscription history
 * @route GET /api/subscriptions/my-subscriptions
 * @access Authenticated
 */
export const getMySubscriptions = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({
    success: true,
    data: subscriptions,
  });
});



