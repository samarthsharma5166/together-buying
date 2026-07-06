import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../db/db.js";
import AppError from "../utils/error.utils.js";
import { tryCatch } from "../utils/tryCatch.js";

const DEFAULT_TAG = {
  tagLabel: "We've saved",
  tagAmount: "₹25Cr+",
  tagSubtext: "for 150+ families",
};

const deleteFileSafe = (filename: string | null | undefined) => {
  if (!filename) return;
  const filePath = path.join("uploads", filename);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error(`Failed to delete file: ${filePath}`, err);
  }
};

const pickTagFields = (body: Record<string, unknown>, index = 0) => {
  let parsedTags: Array<Record<string, string>> = [];
  if (typeof body.slideTags === "string" && body.slideTags.trim()) {
    try {
      parsedTags = JSON.parse(body.slideTags);
    } catch {
      throw new AppError("Invalid slideTags JSON", 400);
    }
  }

  const fromArray = parsedTags[index];
  return {
    tagLabel: String(fromArray?.tagLabel || body.tagLabel || DEFAULT_TAG.tagLabel),
    tagAmount: String(fromArray?.tagAmount || body.tagAmount || DEFAULT_TAG.tagAmount),
    tagSubtext: String(fromArray?.tagSubtext || body.tagSubtext || DEFAULT_TAG.tagSubtext),
  };
};

export const listHeroSlides = tryCatch(async (_req: Request, res: Response) => {
  const slides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      imageUrl: true,
      caption: true,
      tagLabel: true,
      tagAmount: true,
      tagSubtext: true,
      sortOrder: true,
    },
  });

  res.status(200).json({ success: true, data: slides });
});

export const listHeroSlidesAdmin = tryCatch(async (_req: Request, res: Response) => {
  const slides = await prisma.heroSlide.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  res.status(200).json({ success: true, data: slides });
});

export const createHeroSlides = tryCatch(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files?.length) throw new AppError("At least one image is required", 400);

  const caption = typeof req.body.caption === "string" ? req.body.caption : undefined;
  const startOrder = Number(req.body.sortOrder) || 0;

  const slides = await prisma.$transaction(
    files.map((file, index) => {
      const tags = pickTagFields(req.body, index);
      return prisma.heroSlide.create({
        data: {
          imageUrl: file.filename,
          caption,
          ...tags,
          sortOrder: startOrder + index,
        },
      });
    })
  );

  res.status(201).json({ success: true, data: slides });
});

export const updateHeroSlide = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) throw new AppError("Hero slide not found", 404);

  const file = req.file as Express.Multer.File | undefined;
  const data: {
    imageUrl?: string;
    caption?: string | null;
    tagLabel?: string;
    tagAmount?: string;
    tagSubtext?: string;
    sortOrder?: number;
    isActive?: boolean;
  } = {};

  if (file) {
    deleteFileSafe(existing.imageUrl);
    data.imageUrl = file.filename;
  }
  if (req.body.caption !== undefined) data.caption = req.body.caption || null;
  if (req.body.tagLabel !== undefined) data.tagLabel = String(req.body.tagLabel);
  if (req.body.tagAmount !== undefined) data.tagAmount = String(req.body.tagAmount);
  if (req.body.tagSubtext !== undefined) data.tagSubtext = String(req.body.tagSubtext);
  if (req.body.sortOrder !== undefined) data.sortOrder = Number(req.body.sortOrder);
  if (req.body.isActive !== undefined) data.isActive = req.body.isActive === "true" || req.body.isActive === true;

  const slide = await prisma.heroSlide.update({ where: { id }, data });
  res.status(200).json({ success: true, data: slide });
});

export const deleteHeroSlide = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) throw new AppError("Hero slide not found", 404);

  deleteFileSafe(existing.imageUrl);
  await prisma.heroSlide.delete({ where: { id } });
  res.status(200).json({ success: true, message: "Hero slide deleted" });
});
