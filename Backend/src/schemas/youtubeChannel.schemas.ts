import z from "zod";

export const updateYoutubeChannelSchema = z.object({
  channelName: z.string().min(2, "Channel name is required"),
  channelUrl: z.string().url("Channel URL must be valid"),
  metadataText: z.string().optional().nullable(),
});
