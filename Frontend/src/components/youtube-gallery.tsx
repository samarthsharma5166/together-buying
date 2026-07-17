"use client";

import { Link2, Play, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import type { ShowcaseVideo, YoutubeChannelConfig } from "@/lib/api";
import { extractYoutubeId, isYoutubeUrl, youtubeEmbedUrl, youtubeThumbnail } from "@/lib/youtube";
import { cn } from "@/lib/utils";

type GalleryItem = {
  id: string;
  title: string;
  subtitle: string;
  videoId: string | null;
  poster: string;
  embedUrl: string | null;
  rawUrl: string;
};

const THUMB_COLORS = ["#fde8e4", "#e8f0fd", "#fdf6e3", "#e8f8ef", "#f3e8fd", "#fde8f0"];

function toGalleryItem(video: ShowcaseVideo, index: number): GalleryItem | null {
  const rawUrl = video.videoUrl;
  const videoId = isYoutubeUrl(rawUrl) ? extractYoutubeId(rawUrl) : null;
  const poster = video.posterUrl || (videoId ? youtubeThumbnail(videoId) : THUMB_COLORS[index % THUMB_COLORS.length]);

  if (!videoId && !rawUrl) return null;

  return {
    id: video.id,
    title: video.title,
    subtitle: video.subtitle,
    videoId,
    poster,
    embedUrl: videoId ? youtubeEmbedUrl(videoId) : null,
    rawUrl,
  };
}

export function YoutubeGallery({
  videos,
  channel,
}: {
  videos: ShowcaseVideo[];
  channel: YoutubeChannelConfig | null;
}) {
  const items = useMemo(
    () => videos.map((video, index) => toGalleryItem(video, index)).filter((item): item is GalleryItem => Boolean(item)),
    [videos]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex] || items[0];

  if (!items.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center">
        <Play className="mx-auto mb-3 text-[#e34b32]" size={36} />
        <p className="font-display text-lg font-black text-slate-700">Video gallery coming soon</p>
        <p className="mt-2 text-sm text-slate-500">Add YouTube video URLs from the admin panel</p>
      </div>
    );
  }

  const channelName = channel?.channelName || "GroupBuying Channel";
  const channelUrl = channel?.channelUrl || "https://www.youtube.com";
  const metadataText = channel?.metadataText || "Project walkthroughs & buyer success stories";

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_20px_60px_rgba(17,17,17,.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e34b32] text-xs font-black text-white">
            GB
          </span>
          <div>
            <p className="text-sm font-black text-slate-800">{channelName}</p>
            <p className="text-xs text-slate-500">Official GroupBuying channel</p>
          </div>
        </div>
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full bg-[#e34b32] px-5 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#cf3f2a]"
        >
          Subscribe
        </a>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
        <div className="border-b border-slate-100 p-4 sm:p-5 lg:border-b-0 lg:border-r">
          <div className="overflow-hidden rounded-2xl bg-slate-100">
            {active?.embedUrl ? (
              <div className="relative aspect-video w-full">
                <iframe
                  key={active.id}
                  src={active.embedUrl}
                  title={active.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#fff3ef] to-[#fde8e4]">
                <Play className="text-[#e34b32]" size={48} />
              </div>
            )}
          </div>

          <h3 className="mt-4 font-display text-xl font-black text-slate-900 sm:text-2xl">{active?.title}</h3>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-black text-slate-800 transition hover:text-[#e34b32]"
              >
                {channelName}
              </a>
              <p className="text-xs text-slate-500">{active?.subtitle || metadataText}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600"
              >
                <ThumbsUp size={14} /> Like
              </button>
              <button
                type="button"
                onClick={() => {
                  if (active?.rawUrl) navigator.clipboard?.writeText(active.rawUrl);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600"
              >
                <Link2 size={14} /> Share
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">Up Next</p>
          <div className="grid max-h-[420px] gap-3 overflow-y-auto pr-1">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "flex gap-3 rounded-xl border p-2 text-left transition",
                  index === activeIndex
                    ? "border-[#e34b32] bg-[#fff6f2]"
                    : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                )}
              >
                <div
                  className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.poster})` }}
                >
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play size={16} className="text-white" fill="white" />
                  </span>
                </div>
                <div className="min-w-0 py-1">
                  <p className="line-clamp-2 text-sm font-bold text-slate-800">{item.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{item.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
