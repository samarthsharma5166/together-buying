"use client";

import { useEffect, useRef, useState } from "react";
import {
  Blog,
  createBlog,
  deleteBlog,
  getAssetUrl,
  getBlogsAdmin,
  updateBlog,
} from "@/lib/api";
import {
  AlertTriangle,
  BookOpen,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  PenLine,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EMPTY_FORM = {
  title: "",
  excerpt: "",
  content: "",
  category: "General",
  readTimeMin: 5,
  isPublished: false,
};

const CATEGORIES = ["General", "Case Study", "Tips & Guides", "Market Insights", "Success Stories"];

export default function AdminBlogsPage() {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const loadBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBlogsAdmin();
      setBlogs(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setCoverFile(null);
    setCoverPreview(null);
    setEditingId(null);
    setShowForm(false);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const startEdit = (blog: Blog) => {
    setForm({
      title: blog.title,
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      category: blog.category,
      readTimeMin: blog.readTimeMin,
      isPublished: blog.isPublished ?? false,
    });
    setCoverPreview(blog.coverImageUrl ? getAssetUrl(blog.coverImageUrl) || blog.coverImageUrl : null);
    setCoverFile(null);
    setEditingId(blog.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        coverImage: coverFile || undefined,
      };

      if (editingId) {
        await updateBlog(editingId, payload);
      } else {
        await createBlog(payload);
      }

      resetForm();
      await loadBlogs();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (blog: Blog) => {
    setSaving(true);
    try {
      await updateBlog(blog.id, { isPublished: !blog.isPublished });
      await loadBlogs();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await deleteBlog(id);
      setDeleteConfirmId(null);
      if (editingId === id) resetForm();
      await loadBlogs();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#e34b32]">Content</p>
          <h1 className="font-display text-3xl font-black text-slate-800 mt-1">Blog Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create and publish blogs visible on the homepage and /blogs page. Admin & Super Admin can both upload.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e34b32] px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-[#cf3f2a]"
          >
            <Plus size={18} />
            New Blog Post
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff3ef] text-[#e34b32]">
                <PenLine size={22} />
              </div>
              <div>
                <h2 className="font-display text-xl font-black text-slate-800">
                  {editingId ? "Edit Blog Post" : "Create New Blog Post"}
                </h2>
                <p className="text-sm text-slate-500">Fill in details and publish when ready</p>
              </div>
            </div>
            <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="How Group Buying Saved a Family Over ₹1 Crore"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold focus:border-[#e34b32] focus:outline-none focus:ring-2 focus:ring-[#e34b32]/20"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Short summary shown on blog cards..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[#e34b32] focus:outline-none focus:ring-2 focus:ring-[#e34b32]/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Content *</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your full blog content here..."
                  rows={12}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 focus:border-[#e34b32] focus:outline-none focus:ring-2 focus:ring-[#e34b32]/20"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold focus:border-[#e34b32] focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Read Time (min)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={form.readTimeMin}
                    onChange={(e) => setForm((prev) => ({ ...prev, readTimeMin: Number(e.target.value) || 5 }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold focus:border-[#e34b32] focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                      className="h-4 w-4 rounded accent-[#e34b32]"
                    />
                    <span className="text-sm font-bold text-slate-700">Publish now</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">Cover Image</p>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/avif"
                  className="hidden"
                  onChange={handleCoverChange}
                />
                {coverPreview ? (
                  <div className="relative mb-3 overflow-hidden rounded-xl aspect-[4/3]">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${coverPreview})` }} />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview(null);
                        if (coverInputRef.current) coverInputRef.current.value = "";
                      }}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    className="mb-3 flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-400 transition hover:border-[#e34b32] hover:text-[#e34b32]"
                  >
                    <Upload size={28} />
                    <p className="mt-2 text-xs font-bold">Upload cover</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-100"
                >
                  {coverPreview ? "Change Image" : "Select Image"}
                </button>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111111] px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:bg-black disabled:opacity-60"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? "Saving..." : editingId ? "Update Blog" : "Publish Blog"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff3ef] text-[#e34b32]">
            <BookOpen size={22} />
          </div>
          <div>
            <h2 className="font-display text-xl font-black text-slate-800">All Blog Posts</h2>
            <p className="text-sm text-slate-500">{blogs.length} post{blogs.length === 1 ? "" : "s"} total</p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-[1.5rem] bg-slate-100" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
            <BookOpen className="mx-auto mb-4 text-slate-300" size={42} />
            <p className="font-display text-lg font-black text-slate-700">No blogs yet</p>
            <p className="mt-2 text-sm text-slate-500">Create your first blog post to get started.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {blogs.map((blog) => {
              const imageUrl = blog.coverImageUrl ? getAssetUrl(blog.coverImageUrl) || blog.coverImageUrl : null;

              return (
                <div key={blog.id} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
                  <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#fff3ef] to-slate-200">
                    {imageUrl ? (
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="text-slate-300" size={40} />
                      </div>
                    )}
                    <div className={cn(
                      "absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-black",
                      blog.isPublished ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                    )}>
                      {blog.isPublished ? "Published" : "Draft"}
                    </div>
                    <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-[#e34b32]">
                      {blog.category}
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <h3 className="font-display text-lg font-black text-slate-800 line-clamp-2">{blog.title}</h3>
                    {blog.excerpt && <p className="text-sm text-slate-500 line-clamp-2">{blog.excerpt}</p>}
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={13} /> {blog.readTimeMin} min read</span>
                      {blog.author && (
                        <span>By {blog.author.firstName} {blog.author.lastName}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-3">
                      <button
                        type="button"
                        onClick={() => startEdit(blog)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-100"
                      >
                        <PenLine size={14} /> Edit
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleTogglePublish(blog)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                      >
                        {blog.isPublished ? <><EyeOff size={14} /> Unpublish</> : <><Eye size={14} /> Publish</>}
                      </button>

                      {deleteConfirmId === blog.id ? (
                        <>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => handleDelete(blog.id)}
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
                          onClick={() => setDeleteConfirmId(blog.id)}
                          className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={14} /> Delete
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
