import type { Response } from "express";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
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
    const existing = await prisma.article.findFirst({
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

const articleCardSelect = {
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
};

const parsePagination = (
  query: { page?: unknown; limit?: unknown; skip?: unknown },
  defaultLimit = 9
) => {
  const page = Math.max(1, parseInt(String(query.page ?? "1"), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit ?? String(defaultLimit)), 10) || defaultLimit));
  const skipRaw = query.skip;
  const skip =
    skipRaw !== undefined && skipRaw !== null && String(skipRaw).trim() !== ""
      ? Math.max(0, parseInt(String(skipRaw), 10) || 0)
      : (page - 1) * limit;
  return { page, limit, skip };
};

const getOptionalUserId = async (req: AuthenticatedRequest): Promise<string | null> => {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    const jwtSecret = process.env.JWT_SECRET || "fallback-secret-key";
    const decoded = jwt.verify(token, jwtSecret) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true } });
    return user?.id || null;
  } catch {
    return null;
  }
};

export const listPublishedArticles = tryCatch(async (req, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query, 6);
  const search = String(req.query.search || req.query.q || "").trim();
  const category = String(req.query.category || "").trim();

  const where: {
    isPublished: true;
    OR?: Array<Record<string, unknown>>;
    category?: string;
  } = { isPublished: true };

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
      { content: { contains: search } },
      { slug: { contains: search } },
      { category: { contains: search } },
    ];
  }
  if (category) where.category = category;

  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: limit,
      select: articleCardSelect,
    }),
    prisma.article.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      search: search || undefined,
      category: category || undefined,
    },
    data: articles,
  });
});

export const getArticleBySlug = tryCatch(async (req, res: Response) => {
  const { slug } = req.params;
  const article = await prisma.article.findFirst({
    where: { slug, isPublished: true },
    select: {
      ...articleCardSelect,
      content: true,
      _count: { select: { comments: true } },
    },
  });

  if (!article) throw new AppError("Article not found", 404);
  res.status(200).json({ success: true, data: article });
});

export const getSimilarArticles = tryCatch(async (req, res: Response) => {
  const { slug } = req.params;
  const limit = Math.min(6, Math.max(1, parseInt(String(req.query.limit ?? "3"), 10) || 3));

  const article = await prisma.article.findFirst({
    where: { slug, isPublished: true },
    select: { id: true, category: true },
  });
  if (!article) throw new AppError("Article not found", 404);

  let similar = await prisma.article.findMany({
    where: {
      isPublished: true,
      category: article.category,
      NOT: { id: article.id },
    },
    orderBy: [{ createdAt: "desc" }],
    take: limit,
    select: articleCardSelect,
  });

  if (similar.length < limit) {
    const extra = await prisma.article.findMany({
      where: {
        isPublished: true,
        NOT: { id: { in: [article.id, ...similar.map((item) => item.id)] } },
      },
      orderBy: [{ createdAt: "desc" }],
      take: limit - similar.length,
      select: articleCardSelect,
    });
    similar = [...similar, ...extra];
  }

  res.status(200).json({ success: true, data: similar });
});

export const listArticlesAdmin = tryCatch(async (req, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query, 10);
  const search = String(req.query.search || "").trim();
  const status = String(req.query.status || "").trim().toLowerCase();
  const category = String(req.query.category || "").trim();

  const where: {
    OR?: Array<Record<string, unknown>>;
    isPublished?: boolean;
    category?: string;
  } = {};

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
      { content: { contains: search } },
      { slug: { contains: search } },
      { category: { contains: search } },
    ];
  }
  if (status === "published") where.isPublished = true;
  if (status === "draft") where.isPublished = false;
  if (category) where.category = category;

  const [articles, total, publishedCount, draftCount] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: limit,
      include: {
        author: { select: authorSelect },
        _count: { select: { comments: true } },
      },
    }),
    prisma.article.count({ where }),
    prisma.article.count({ where: { isPublished: true } }),
    prisma.article.count({ where: { isPublished: false } }),
  ]);

  res.status(200).json({
    success: true,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      publishedCount,
      draftCount,
    },
    data: articles,
  });
});

export const createArticle = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { title, excerpt, content, category, readTimeMin, isPublished } = req.body;
  if (!title?.trim()) throw new AppError("Title is required", 400);
  if (!content?.trim()) throw new AppError("Content is required", 400);
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const file = req.file as Express.Multer.File | undefined;
  const baseSlug = slugify(title);
  const slug = await ensureUniqueSlug(baseSlug);

  const article = await prisma.article.create({
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

  res.status(201).json({ success: true, data: article });
});

export const updateArticle = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) throw new AppError("Article not found", 404);

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

  const article = await prisma.article.update({
    where: { id },
    data,
    include: { author: { select: authorSelect } },
  });

  res.status(200).json({ success: true, data: article });
});

export const deleteArticle = tryCatch(async (req, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) throw new AppError("Article not found", 404);

  deleteFileSafe(existing.coverImageUrl);
  await prisma.article.delete({ where: { id } });
  res.status(200).json({ success: true, message: "Article deleted" });
});

export const listArticleComments = tryCatch(async (req, res: Response) => {
  const { slug } = req.params;
  const { page, limit, skip } = parsePagination(req.query, 20);

  const article = await prisma.article.findFirst({
    where: { slug, isPublished: true },
    select: { id: true },
  });
  if (!article) throw new AppError("Article not found", 404);

  const where = { articleId: article.id };
  const [comments, total] = await prisma.$transaction([
    prisma.articleComment.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: limit,
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    }),
    prisma.articleComment.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    data: comments,
  });
});

export const createArticleComment = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { slug } = req.params;
  const content = String(req.body.content || "").trim();
  const guestName = String(req.body.guestName || "").trim();

  if (!content) throw new AppError("Comment content is required", 400);
  if (content.length > 2000) throw new AppError("Comment is too long (max 2000 characters)", 400);

  const article = await prisma.article.findFirst({
    where: { slug, isPublished: true },
    select: { id: true },
  });
  if (!article) throw new AppError("Article not found", 404);

  const authorId = (await getOptionalUserId(req)) || req.user?.id || null;
  if (!authorId && !guestName) {
    throw new AppError("Please provide your name or log in to comment", 400);
  }

  const comment = await prisma.articleComment.create({
    data: {
      content,
      guestName: authorId ? null : guestName,
      articleId: article.id,
      authorId,
    },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      },
    },
  });

  res.status(201).json({ success: true, data: comment });
});

export const deleteArticleComment = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const comment = await prisma.articleComment.findUnique({ where: { id } });
  if (!comment) throw new AppError("Comment not found", 404);

  const isOwner = comment.authorId === req.user.id;
  const isAdmin = req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN";
  if (!isOwner && !isAdmin) throw new AppError("Not allowed to delete this comment", 403);

  await prisma.articleComment.delete({ where: { id } });
  res.status(200).json({ success: true, message: "Comment deleted" });
});
