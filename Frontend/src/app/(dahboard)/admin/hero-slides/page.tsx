"use client";

import { useEffect, useRef, useState } from "react";
import {
  deleteHeroSlide,
  getAssetUrl,
  getHeroSlidesAdmin,
  HeroSlide,
  updateHeroSlide,
  uploadHeroSlides,
} from "@/lib/api";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Loader2,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_TAG = {
  tagLabel: "We've saved",
  tagAmount: "₹25Cr+",
  tagSubtext: "for 150+ families",
};

export default function AdminHeroSlidesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [uploadTags, setUploadTags] = useState(DEFAULT_TAG);
  const [draftTags, setDraftTags] = useState<Record<string, typeof DEFAULT_TAG>>({});

  const loadSlides = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHeroSlidesAdmin();
      setSlides(data);
      setDraftTags(
        Object.fromEntries(
          data.map((slide) => [
            slide.id,
            {
              tagLabel: slide.tagLabel || DEFAULT_TAG.tagLabel,
              tagAmount: slide.tagAmount || DEFAULT_TAG.tagAmount,
              tagSubtext: slide.tagSubtext || DEFAULT_TAG.tagSubtext,
            },
          ])
        )
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load hero slides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError(null);
    try {
      await uploadHeroSlides(files, uploadTags);
      await loadSlides();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    setUpdatingId(slide.id);
    try {
      await updateHeroSlide(slide.id, { isActive: !slide.isActive });
      await loadSlides();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSortChange = async (slide: HeroSlide, direction: "up" | "down") => {
    const current = slide.sortOrder ?? 0;
    const next = direction === "up" ? current - 1 : current + 1;
    setUpdatingId(slide.id);
    try {
      await updateHeroSlide(slide.id, { sortOrder: next });
      await loadSlides();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Reorder failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveTags = async (slideId: string) => {
    const tags = draftTags[slideId];
    if (!tags) return;

    setUpdatingId(slideId);
    setError(null);
    try {
      await updateHeroSlide(slideId, tags);
      await loadSlides();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to save tags");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setUpdatingId(id);
    try {
      await deleteHeroSlide(id);
      setDeleteConfirmId(null);
      await loadSlides();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Delete failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const updateDraft = (slideId: string, field: keyof typeof DEFAULT_TAG, value: string) => {
    setDraftTags((prev) => ({
      ...prev,
      [slideId]: {
        ...(prev[slideId] || DEFAULT_TAG),
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#e34b32]">Homepage</p>
          <h1 className="font-display text-3xl font-black text-slate-800 mt-1">Hero Section Images</h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload images with tag text. Each slide can have its own &quot;We&apos;ve saved&quot; badge on the homepage.
          </p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">Default tag for new uploads</p>
            <div className="space-y-2">
              <input
                value={uploadTags.tagLabel}
                onChange={(e) => setUploadTags((prev) => ({ ...prev, tagLabel: e.target.value }))}
                placeholder="We've saved"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                value={uploadTags.tagAmount}
                onChange={(e) => setUploadTags((prev) => ({ ...prev, tagAmount: e.target.value }))}
                placeholder="₹25Cr+"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"
              />
              <input
                value={uploadTags.tagSubtext}
                onChange={(e) => setUploadTags((prev) => ({ ...prev, tagSubtext: e.target.value }))}
                placeholder="for 150+ families"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/avif"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e34b32] px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-[#cf3f2a] disabled:opacity-60"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {uploading ? "Uploading..." : "Add Images"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff3ef] text-[#e34b32]">
            <ImageIcon size={22} />
          </div>
          <div>
            <h2 className="font-display text-xl font-black text-slate-800">Carousel Slides</h2>
            <p className="text-sm text-slate-500">{slides.length} image{slides.length === 1 ? "" : "s"} uploaded</p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-[1.5rem] bg-slate-100" />
            ))}
          </div>
        ) : slides.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
            <ImageIcon className="mx-auto mb-4 text-slate-300" size={42} />
            <p className="font-display text-lg font-black text-slate-700">No hero images yet</p>
            <p className="mt-2 text-sm text-slate-500">Upload images and set tag text for each slide.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {slides.map((slide, index) => {
              const imageUrl = getAssetUrl(slide.imageUrl) || slide.imageUrl;
              const busy = updatingId === slide.id;
              const tags = draftTags[slide.id] || DEFAULT_TAG;

              return (
                <div key={slide.id} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
                    <div className="absolute left-3 top-3 max-w-[70%] rounded-2xl bg-white/95 px-3 py-2 shadow-md">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{tags.tagLabel}</p>
                      <p className="font-display text-lg font-black text-[#df432c]">{tags.tagAmount}</p>
                      <p className="text-[10px] font-bold text-slate-500">{tags.tagSubtext}</p>
                    </div>
                    <div
                      className={cn(
                        "absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-black",
                        slide.isActive ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                      )}
                    >
                      {slide.isActive ? "Active" : "Hidden"}
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">Slide #{index + 1} tag</p>
                    <input
                      value={tags.tagLabel}
                      onChange={(e) => updateDraft(slide.id, "tagLabel", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                    <input
                      value={tags.tagAmount}
                      onChange={(e) => updateDraft(slide.id, "tagAmount", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold"
                    />
                    <input
                      value={tags.tagSubtext}
                      onChange={(e) => updateDraft(slide.id, "tagSubtext", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    />

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleSaveTags(slide.id)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#111111] px-3 py-2 text-xs font-black text-white hover:bg-black disabled:opacity-50"
                    >
                      <Save size={14} />
                      Save Tag
                    </button>

                    <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-3">
                      <p className="text-xs font-bold text-slate-500">Order: {slide.sortOrder ?? 0}</p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleSortChange(slide, "up")}
                          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                          aria-label="Move up"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleSortChange(slide, "down")}
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
                        onClick={() => handleToggleActive(slide)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                      >
                        {slide.isActive ? "Hide" : "Show"}
                      </button>

                      {deleteConfirmId === slide.id ? (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDelete(slide.id)}
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
                          onClick={() => setDeleteConfirmId(slide.id)}
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
