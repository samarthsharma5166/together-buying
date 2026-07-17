import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../db/db.js";
import AppError from "../utils/error.utils.js";
import { tryCatch } from "../utils/tryCatch.js";
import { createShowcaseVideoSchema, updateShowcaseVideoSchema } from "../schemas/showcaseVideo.schemas.js";
import { extractYoutubeId, isYoutubeUrl, youtubeThumbnail } from "../utils/youtube.utils.js";

const deleteFileSafe = (filename: string | null | undefined) => {
  if (!filename || /^https?:\/\//i.test(filename)) return;
  const filePath = path.join("uploads", filename);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error(`Failed to delete file: ${filePath}`, err);
  }
};

const resolveMediaValue = (uploaded?: string, provided?: string | null) => {
  if (uploaded) return uploaded;
  if (provided && provided.trim()) return provided.trim();
  return null;
};

export const listShowcaseVideos = tryCatch(async (_req: Request, res: Response) => {
  const videos = await prisma.showcaseVideo.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      subtitle: true,
      videoUrl: true,
      posterUrl: true,
      sortOrder: true,
    },
  });

  res.status(200).json({ success: true, data: videos });
});

export const listShowcaseVideosAdmin = tryCatch(async (_req: Request, res: Response) => {
  const videos = await prisma.showcaseVideo.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  res.status(200).json({ success: true, data: videos });
});

export const createShowcaseVideo = tryCatch(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const videoFile = files?.video?.[0];
  const posterFile = files?.poster?.[0];

  const parsed = createShowcaseVideoSchema.parse(req.body);
  const videoUrl = resolveMediaValue(videoFile?.filename, parsed.videoUrl);
  let posterUrl = resolveMediaValue(posterFile?.filename, parsed.posterUrl);

  if (!videoUrl) throw new AppError("Video file or video URL is required", 400);

  if (!posterUrl && videoUrl && isYoutubeUrl(videoUrl)) {
    const videoId = extractYoutubeId(videoUrl);
    if (videoId) posterUrl = youtubeThumbnail(videoId);
  }

  if (!posterUrl) throw new AppError("Poster image or poster URL is required", 400);

  try {
    const video = await prisma.showcaseVideo.create({
      data: {
        title: parsed.title,
        subtitle: parsed.subtitle,
        videoUrl,
        posterUrl,
        sortOrder: parsed.sortOrder ?? 0,
      },
    });

    res.status(201).json({ success: true, data: video });
  } catch (error) {
    if (videoFile) deleteFileSafe(videoFile.filename);
    if (posterFile) deleteFileSafe(posterFile.filename);
    throw error;
  }
});

export const updateShowcaseVideo = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.showcaseVideo.findUnique({ where: { id } });
  if (!existing) throw new AppError("Showcase video not found", 404);

  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const videoFile = files?.video?.[0];
  const posterFile = files?.poster?.[0];
  const parsed = updateShowcaseVideoSchema.parse(req.body);

  const data: {
    title?: string;
    subtitle?: string;
    videoUrl?: string;
    posterUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
  } = {};

  if (parsed.title !== undefined) data.title = parsed.title;
  if (parsed.subtitle !== undefined) data.subtitle = parsed.subtitle;
  if (parsed.sortOrder !== undefined) data.sortOrder = parsed.sortOrder;
  if (parsed.isActive !== undefined) data.isActive = parsed.isActive;

  const nextVideoUrl = resolveMediaValue(videoFile?.filename, parsed.videoUrl);
  let nextPosterUrl = resolveMediaValue(posterFile?.filename, parsed.posterUrl);

  if (nextVideoUrl) data.videoUrl = nextVideoUrl;
  if (nextPosterUrl) data.posterUrl = nextPosterUrl;

  const resolvedVideoUrl = data.videoUrl || existing.videoUrl;
  if (!data.posterUrl && resolvedVideoUrl && isYoutubeUrl(resolvedVideoUrl)) {
    const videoId = extractYoutubeId(resolvedVideoUrl);
    if (videoId) data.posterUrl = youtubeThumbnail(videoId);
  }

  try {
    const video = await prisma.showcaseVideo.update({ where: { id }, data });

    if (videoFile && existing.videoUrl !== video.videoUrl) deleteFileSafe(existing.videoUrl);
    if (posterFile && existing.posterUrl !== video.posterUrl) deleteFileSafe(existing.posterUrl);

    res.status(200).json({ success: true, data: video });
  } catch (error) {
    if (videoFile) deleteFileSafe(videoFile.filename);
    if (posterFile) deleteFileSafe(posterFile.filename);
    throw error;
  }
});

export const deleteShowcaseVideo = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.showcaseVideo.findUnique({ where: { id } });
  if (!existing) throw new AppError("Showcase video not found", 404);

  deleteFileSafe(existing.videoUrl);
  deleteFileSafe(existing.posterUrl);
  await prisma.showcaseVideo.delete({ where: { id } });

  res.status(200).json({ success: true, message: "Showcase video deleted" });
});
