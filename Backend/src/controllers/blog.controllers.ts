import type { Response } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../db/db.js";
import AppError from "../utils/error.utils.js";
import { tryCatch } from "../utils/tryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

const deleteFileSafe = (filename: string | null | undefined) => {
  if (!filename) return;
  const filePath = path.join("uploads", filename);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error(`Failed to delete file: ${filePath}`, err);
  }
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const ensureUniqueSlug = async (base: string, excludeId?: string) => {
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.blog.findFirst({
      where: excludeId ? { slug, NOT: { id: excludeId } } : { slug },
    });
    if (!existing) return slug;
    slug = `${base}-${counter++}`;
  }
};

const authorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  role: true,
};

export const listPublishedBlogs = tryCatch(async (_req, res: Response) => {
  const blogs = await prisma.blog.findMany({
    where: { isPublished: true },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImageUrl: true,
      category: true,
      readTimeMin: true,
      createdAt: true,
      updatedAt: true,
      author: { select: authorSelect },
    },
  });

  res.status(200).json({ success: true, data: blogs });
});

export const getBlogBySlug = tryCatch(async (req, res: Response) => {
  const { slug } = req.params;
  const blog = await prisma.blog.findFirst({
    where: { slug, isPublished: true },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImageUrl: true,
      category: true,
      readTimeMin: true,
      createdAt: true,
      updatedAt: true,
      author: { select: authorSelect },
    },
  });

  if (!blog) throw new AppError("Blog not found", 404);
  res.status(200).json({ success: true, data: blog });
});

export const listBlogsAdmin = tryCatch(async (_req, res: Response) => {
  const blogs = await prisma.blog.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { author: { select: authorSelect } },
  });

  res.status(200).json({ success: true, data: blogs });
});

export const createBlog = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { title, excerpt, content, category, readTimeMin, isPublished } = req.body;
  if (!title?.trim()) throw new AppError("Title is required", 400);
  if (!content?.trim()) throw new AppError("Content is required", 400);
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const file = req.file as Express.Multer.File | undefined;
  const baseSlug = slugify(title);
  const slug = await ensureUniqueSlug(baseSlug);

  const blog = await prisma.blog.create({
    data: {
      title: title.trim(),
      slug,
      excerpt: excerpt?.trim() || null,
      content: content.trim(),
      coverImageUrl: file?.filename || null,
      category: category?.trim() || "General",
      readTimeMin: Number(readTimeMin) || 5,
      isPublished: isPublished === "true" || isPublished === true,
      authorId: req.user.id,
    },
    include: { author: { select: authorSelect } },
  });

  res.status(201).json({ success: true, data: blog });
});

export const updateBlog = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.blog.findUnique({ where: { id } });
  if (!existing) throw new AppError("Blog not found", 404);

  const file = req.file as Express.Multer.File | undefined;
  const data: {
    title?: string;
    slug?: string;
    excerpt?: string | null;
    content?: string;
    coverImageUrl?: string | null;
    category?: string;
    readTimeMin?: number;
    isPublished?: boolean;
  } = {};

  if (req.body.title !== undefined) {
    data.title = String(req.body.title).trim();
    if (data.title) {
      const baseSlug = slugify(data.title);
      data.slug = await ensureUniqueSlug(baseSlug, id);
    }
  }
  if (req.body.excerpt !== undefined) data.excerpt = req.body.excerpt?.trim() || null;
  if (req.body.content !== undefined) data.content = String(req.body.content).trim();
  if (req.body.category !== undefined) data.category = String(req.body.category).trim() || "General";
  if (req.body.readTimeMin !== undefined) data.readTimeMin = Number(req.body.readTimeMin) || 5;
  if (req.body.isPublished !== undefined) {
    data.isPublished = req.body.isPublished === "true" || req.body.isPublished === true;
  }
  if (file) {
    deleteFileSafe(existing.coverImageUrl);
    data.coverImageUrl = file.filename;
  }

  const blog = await prisma.blog.update({
    where: { id },
    data,
    include: { author: { select: authorSelect } },
  });

  res.status(200).json({ success: true, data: blog });
});

export const deleteBlog = tryCatch(async (req, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.blog.findUnique({ where: { id } });
  if (!existing) throw new AppError("Blog not found", 404);

  deleteFileSafe(existing.coverImageUrl);
  await prisma.blog.delete({ where: { id } });
  res.status(200).json({ success: true, message: "Blog deleted" });
});
