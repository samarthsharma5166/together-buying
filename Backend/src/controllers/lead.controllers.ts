import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
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

  // Find the RM with the least number of assigned leads to distribute evenly
  const rms = await prisma.user.findMany({
    where: { role: "RM" },
    include: {
      _count: {
        select: { leads: true },
      },
    },
    orderBy: {
      leads: {
        _count: "asc",
      },
    },
    take: 1,
  });

  const assignedRmId = rms.length > 0 ? rms[0]?.id || null : null;

  const newLead = await prisma.leads.create({
    data: {
      name,
      email,
      phone,
      purpose: purpose || null,
      rmId: assignedRmId,
    },
  });

  res.status(201).json({
    success: true,
    message: "Lead created successfully",
    data: newLead,
  });
});

/**
 * @desc Get all leads assigned to RM
 * @route GET /api/leads
 * @access RM
 */
export const getMyLeads = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const rmId = req.user?.id as string;
  if (!rmId) throw new AppError("Unauthorized", 401);

  const { page = "1", limit = "10", search, status, priority, city, project, sortBy = "createdAt", order = "desc" } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const statusStr = status as string | undefined;
  const priorityStr = priority as string | undefined;
  const cityStr = city as string | undefined;
  const projectStr = project as string | undefined;
  const searchStr = search as string | undefined;

  const whereClause: any = { rmId };

  if (statusStr && statusStr !== "ALL") whereClause.status = statusStr;
  if (priorityStr && priorityStr !== "ALL") whereClause.priority = priorityStr;
  if (cityStr) whereClause.city = { contains: cityStr };
  if (projectStr) whereClause.project = { contains: projectStr };

  if (searchStr) {
    whereClause.OR = [
      { name: { contains: searchStr } },
      { email: { contains: searchStr } },
      { phone: { contains: searchStr } },
      { project: { contains: searchStr } },
      { city: { contains: searchStr } },
    ];
  }

  const orderByClause: any = {};
  if (["createdAt", "followUpDate", "name", "status"].includes(sortBy as string)) {
    orderByClause[sortBy as string] = order === "asc" ? "asc" : "desc";
  } else {
    orderByClause.createdAt = "desc";
  }

  const [leads, total] = await Promise.all([
    prisma.leads.findMany({
      where: whereClause,
      skip,
      take: limitNum,
      orderBy: orderByClause,
      include: {
        _count: { select: { notes: true } }
      }
    }),
    prisma.leads.count({ where: whereClause }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
});

/**
 * @desc Get single lead details
 * @route GET /api/leads/:id
 * @access RM
 */
export const getLeadDetails = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const rmId = req.user?.id as string;
  const leadId = req.params.id as string;

  const lead = await prisma.leads.findFirst({
    where: { id: leadId, rmId },
    include: {
      notes: {
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { firstName: true, lastName: true } } }
      }
    }
  });

  if (!lead) throw new AppError("Lead not found or unauthorized", 404);

  res.status(200).json({ success: true, data: lead });
});

/**
 * @desc Update lead status/details
 * @route PATCH /api/leads/:id
 * @access RM
 */
export const updateLead = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const rmId = req.user?.id as string;
  const leadId = req.params.id as string;
  const { status, priority, followUpDate, project, city } = req.body;

  // Verify ownership
  const existing = await prisma.leads.findFirst({ where: { id: leadId, rmId } });
  if (!existing) throw new AppError("Lead not found or unauthorized", 404);

  const updatedLead = await prisma.leads.update({
    where: { id: leadId },
    data: {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(followUpDate !== undefined && { followUpDate: followUpDate ? new Date(followUpDate) : null }),
      ...(project && { project }),
      ...(city && { city }),
    },
  });

  res.status(200).json({ success: true, message: "Lead updated", data: updatedLead });
});

/**
 * @desc Add a note to a lead
 * @route POST /api/leads/:id/notes
 * @access RM
 */
export const addLeadNote = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const rmId = req.user?.id as string;
  const leadId = req.params.id as string;
  const { text } = req.body;

  if (!text) throw new AppError("Note text is required", 400);

  // Verify ownership
  const existing = await prisma.leads.findFirst({ where: { id: leadId, rmId } });
  if (!existing) throw new AppError("Lead not found or unauthorized", 404);

  const newNote = await prisma.leadNote.create({
    data: {
      text,
      leadId,
      authorId: rmId!,
    },
    include: {
      author: { select: { firstName: true, lastName: true } }
    }
  });

  res.status(201).json({ success: true, message: "Note added", data: newNote });
});
