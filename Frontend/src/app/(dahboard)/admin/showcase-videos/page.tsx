"use client";

import { useEffect, useRef, useState } from "react";
import {
  createShowcaseVideo,
  deleteShowcaseVideo,
  getAssetUrl,
  getShowcaseVideosAdmin,
  getYoutubeChannelAdmin,
  ShowcaseVideo,
  updateShowcaseVideo,
  updateYoutubeChannel,
  YoutubeChannelConfig,
} from "@/lib/api";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Save,
  Trash2,
  Upload,
  Video,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DraftFields = {
  title: string;
  subtitle: string;
};

const EMPTY_DRAFT: DraftFields = {
  title: "",
  subtitle: "",
};

export default function AdminShowcaseVideosPage() {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const [videos, setVideos] = useState<ShowcaseVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newVideo, setNewVideo] = useState<DraftFields>(EMPTY_DRAFT);
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [newPosterFile, setNewPosterFile] = useState<File | null>(null);
  const [drafts, setDrafts] = useState<Record<string, DraftFields>>({});
  const [channel, setChannel] = useState<YoutubeChannelConfig | null>(null);
  const [channelDraft, setChannelDraft] = useState({
    channelName: "",
    channelUrl: "",
    metadataText: "",
  });
  const [newYoutubeUrl, setNewYoutubeUrl] = useState("");
  const [savingChannel, setSavingChannel] = useState(false);

  const loadVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, channelData] = await Promise.all([getShowcaseVideosAdmin(), getYoutubeChannelAdmin()]);
      setVideos(data);
      setChannel(channelData);
      if (channelData) {
        setChannelDraft({
          channelName: channelData.channelName,
          channelUrl: channelData.channelUrl,
          metadataText: channelData.metadataText || "",
        });
      }
      setDrafts(
        Object.fromEntries(
          data.map((video) => [
            video.id,
            { title: video.title, subtitle: video.subtitle },
          ])
        )
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load showcase videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const resetCreateForm = () => {
    setNewVideo(EMPTY_DRAFT);
    setNewVideoFile(null);
    setNewPosterFile(null);
    setNewYoutubeUrl("");
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (posterInputRef.current) posterInputRef.current.value = "";
  };

  const handleSaveChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelDraft.channelName.trim() || !channelDraft.channelUrl.trim()) {
      setError("Channel name and URL are required");
      return;
    }
    setSavingChannel(true);
    setError(null);
    try {
      await updateYoutubeChannel({
        channelName: channelDraft.channelName.trim(),
        channelUrl: channelDraft.channelUrl.trim(),
        metadataText: channelDraft.metadataText.trim() || null,
      });
      await loadVideos();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to save channel");
    } finally {
      setSavingChannel(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.title.trim() || !newVideo.subtitle.trim()) {
      setError("Title and subtitle are required");
      return;
    }
    if (!newVideoFile && !newYoutubeUrl.trim()) {
      setError("Video file or YouTube URL is required");
      return;
    }
    if (newVideoFile && !newPosterFile) {
      setError("Poster image is required when uploading a video file");
      return;
    }

    setCreating(true);
    setError(null);
    try {
      await createShowcaseVideo({
        title: newVideo.title.trim(),
        subtitle: newVideo.subtitle.trim(),
        video: newVideoFile || undefined,
        poster: newPosterFile || undefined,
        videoUrl: newYoutubeUrl.trim() || undefined,
      });
      resetCreateForm();
      await loadVideos();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (video: ShowcaseVideo) => {
    setUpdatingId(video.id);
    try {
      await updateShowcaseVideo(video.id, { isActive: !video.isActive });
      await loadVideos();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSortChange = async (video: ShowcaseVideo, direction: "up" | "down") => {
    const current = video.sortOrder ?? 0;
    const next = direction === "up" ? current - 1 : current + 1;
    setUpdatingId(video.id);
    try {
      await updateShowcaseVideo(video.id, { sortOrder: next });
      await loadVideos();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Reorder failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveDetails = async (videoId: string) => {
    const draft = drafts[videoId];
    if (!draft) return;

    setUpdatingId(videoId);
    setError(null);
    try {
      await updateShowcaseVideo(videoId, {
        title: draft.title.trim(),
        subtitle: draft.subtitle.trim(),
      });
      await loadVideos();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to save details");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReplaceMedia = async (videoId: string, type: "video" | "poster", file: File) => {
    setUpdatingId(videoId);
    setError(null);
    try {
      await updateShowcaseVideo(videoId, type === "video" ? { video: file } : { poster: file });
      await loadVideos();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Upload failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setUpdatingId(id);
    try {
      await deleteShowcaseVideo(id);
      setDeleteConfirmId(null);
      await loadVideos();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Delete failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const updateDraft = (videoId: string, field: keyof DraftFields, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [videoId]: {
        ...(prev[videoId] || EMPTY_DRAFT),
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#e34b32]">Homepage</p>
          <h1 className="font-display text-3xl font-black text-slate-800 mt-1">Video Gallery</h1>
          <p className="text-sm text-slate-500 mt-1">
            Add YouTube URLs or video files for the homepage video gallery with subscribe button.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      <form
        onSubmit={handleSaveChannel}
        className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff3ef] text-[#e34b32]">
            <Youtube size={22} />
          </div>
          <div>
            <h2 className="font-display text-xl font-black text-slate-800">YouTube Channel Settings</h2>
            <p className="text-sm text-slate-500">Subscribe button redirects users to this channel</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <input
            value={channelDraft.channelName}
            onChange={(e) => setChannelDraft((prev) => ({ ...prev, channelName: e.target.value }))}
            placeholder="Channel name e.g. GroupBuying Official"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            required
          />
          <input
            value={channelDraft.channelUrl}
            onChange={(e) => setChannelDraft((prev) => ({ ...prev, channelUrl: e.target.value }))}
            placeholder="Channel URL e.g. https://youtube.com/@channel"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            required
          />
          <input
            value={channelDraft.metadataText}
            onChange={(e) => setChannelDraft((prev) => ({ ...prev, metadataText: e.target.value }))}
            placeholder="Metadata e.g. 823K views · 4 days ago"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={savingChannel}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111111] px-5 py-3 text-sm font-black text-white transition hover:bg-black disabled:opacity-60"
        >
          {savingChannel ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {savingChannel ? "Saving..." : "Save Channel Settings"}
        </button>
        {channel && (
          <p className="text-xs text-slate-500">Current channel: {channel.channelName}</p>
        )}
      </form>

      <form
        onSubmit={handleCreate}
        className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff3ef] text-[#e34b32]">
            <Video size={22} />
          </div>
          <div>
            <h2 className="font-display text-xl font-black text-slate-800">Add New Video</h2>
            <p className="text-sm text-slate-500">Upload video + poster with display text</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={newVideo.title}
            onChange={(e) => setNewVideo((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Title e.g. Luxury project walkthrough"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            required
          />
          <input
            value={newVideo.subtitle}
            onChange={(e) => setNewVideo((prev) => ({ ...prev, subtitle: e.target.value }))}
            placeholder="Subtitle e.g. Premium inventory tour"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
              YouTube URL (recommended)
            </label>
            <input
              value={newYoutubeUrl}
              onChange={(e) => setNewYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
              Or upload video file
            </label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="w-full text-sm"
              onChange={(e) => setNewVideoFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
              Poster image (optional for YouTube — auto thumbnail used)
            </label>
            <input
              ref={posterInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="w-full text-sm"
              onChange={(e) => setNewPosterFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e34b32] px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-[#cf3f2a] disabled:opacity-60"
        >
          {creating ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          {creating ? "Adding..." : "Add Video"}
        </button>
      </form>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff3ef] text-[#e34b32]">
            <Video size={22} />
          </div>
          <div>
            <h2 className="font-display text-xl font-black text-slate-800">Video Carousel</h2>
            <p className="text-sm text-slate-500">
              {videos.length} video{videos.length === 1 ? "" : "s"} on homepage
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-[1.5rem] bg-slate-100" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
            <Video className="mx-auto mb-4 text-slate-300" size={42} />
            <p className="font-display text-lg font-black text-slate-700">No showcase videos yet</p>
            <p className="mt-2 text-sm text-slate-500">Add videos with title and subtitle above.</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {videos.map((video, index) => {
              const posterUrl = getAssetUrl(video.posterUrl) || video.posterUrl;
              const busy = updatingId === video.id;
              const draft = drafts[video.id] || { title: video.title, subtitle: video.subtitle };

              return (
                <div key={video.id} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
                  <div className="relative aspect-video overflow-hidden bg-slate-200">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${posterUrl})` }}
                    />
                    <div
                      className={cn(
                        "absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-black",
                        video.isActive ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                      )}
                    >
                      {video.isActive ? "Active" : "Hidden"}
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Video #{index + 1}
                    </p>
                    <input
                      value={draft.title}
                      onChange={(e) => updateDraft(video.id, "title", e.target.value)}
                      placeholder="Title"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
                    />
                    <input
                      value={draft.subtitle}
                      onChange={(e) => updateDraft(video.id, "subtitle", e.target.value)}
                      placeholder="Subtitle"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    />

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleSaveDetails(video.id)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#111111] px-3 py-2 text-xs font-black text-white hover:bg-black disabled:opacity-50"
                    >
                      <Save size={14} />
                      Save Details
                    </button>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-black text-slate-700 hover:bg-slate-100">
                        Replace Video
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          className="hidden"
                          disabled={busy}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleReplaceMedia(video.id, "video", file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-black text-slate-700 hover:bg-slate-100">
                        Replace Poster
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          disabled={busy}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleReplaceMedia(video.id, "poster", file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-3">
                      <p className="text-xs font-bold text-slate-500">Order: {video.sortOrder ?? 0}</p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleSortChange(video, "up")}
                          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                          aria-label="Move up"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleSortChange(video, "down")}
                          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                          aria-label="Move down"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleToggleActive(video)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                      >
                        {video.isActive ? "Hide" : "Show"}
                      </button>

                      {deleteConfirmId === video.id ? (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDelete(video.id)}
                            className="rounded-xl bg-red-500 px-3 py-2 text-xs font-black text-white hover:bg-red-600 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setDeleteConfirmId(video.id)}
                          className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
