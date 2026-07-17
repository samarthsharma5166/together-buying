import type { Request, Response } from "express";
import { prisma } from "../db/db.js";
import { tryCatch } from "../utils/tryCatch.js";
import { updateYoutubeChannelSchema } from "../schemas/youtubeChannel.schemas.js";

const DEFAULT_CHANNEL = {
  id: "default",
  channelName: "GroupBuying Channel",
  channelUrl: "https://www.youtube.com",
  metadataText: "Subscribe for project walkthroughs & buyer tips",
};

export const getYoutubeChannel = tryCatch(async (_req: Request, res: Response) => {
  const config = await prisma.youtubeChannelConfig.findUnique({ where: { id: "default" } });
  res.status(200).json({ success: true, data: config || DEFAULT_CHANNEL });
});

export const getYoutubeChannelAdmin = tryCatch(async (_req: Request, res: Response) => {
  const config = await prisma.youtubeChannelConfig.findUnique({ where: { id: "default" } });
  res.status(200).json({ success: true, data: config || DEFAULT_CHANNEL });
});

export const updateYoutubeChannel = tryCatch(async (req: Request, res: Response) => {
  const parsed = updateYoutubeChannelSchema.parse(req.body);
  const config = await prisma.youtubeChannelConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      channelName: parsed.channelName,
      channelUrl: parsed.channelUrl,
      metadataText: parsed.metadataText ?? null,
    },
    update: {
      channelName: parsed.channelName,
      channelUrl: parsed.channelUrl,
      metadataText: parsed.metadataText ?? null,
    },
  });
  res.status(200).json({ success: true, data: config });
});
