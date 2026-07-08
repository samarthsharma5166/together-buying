import type { Request, Response } from "express";
import { prisma } from "../db/db.js";
import AppError from "../utils/error.utils.js";
import { tryCatch } from "../utils/tryCatch.js";

/**
 * @desc Create a new lead
 * @route POST /api/leads
 * @access Public
 */
export const createLead = tryCatch(async (req: Request, res: Response) => {
  const { name, email, phone, purpose } = req.body;

  if (!name || (!email && !phone)) {
    throw new AppError("Please provide a name and at least one contact method (email or phone).", 400);
  }

  const newLead = await prisma.leads.create({
    data: {
      name,
      email,
      phone,
      purpose: purpose || null,
    },
  });

  res.status(201).json({
    success: true,
    message: "Lead created successfully",
    data: newLead,
  });
});
