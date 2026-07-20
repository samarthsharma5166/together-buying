"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Article,
  PaginationMeta,
  createArticle,
  deleteArticle,
  getAssetUrl,
  getArticlesAdmin,
  updateArticle,
} from "@/lib/api";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  MessageCircle,
  PenLine,
  Plus,
  Save,
  Search,
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

const CATEGORIES = [
  "General",
  "Case Study",
  "Tips & Guides",
  "Market Insights",
  "Success Stories",
  "Buyer's Guide",
  "NRI Corner",
];

const PAGE_SIZE = 10;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#e34b32] focus:ring-2 focus:ring-[#e34b32]/15";

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminArticlesPage() {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
    publishedCount: 0,
    draftCount: 0,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const loadArticles = async (pageNum = page) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getArticlesAdmin({
        page: pageNum,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });
      setArticles(result.articles);
      setMeta(result.meta);
      setPage(result.meta.page);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 2800);
    return () => clearTimeout(timer);
  }, [success]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setCoverFile(null);
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setCoverFile(null);
    setCoverPreview(null);
    setDrawerOpen(true);
    setError(null);
  };

  const openEdit = (article: Article) => {
    setForm({
      title: article.title,
      excerpt: article.excerpt || "",
      content: article.content || "",
      category: article.category,
      readTimeMin: article.readTimeMin,
      isPublished: article.isPublished ?? false,
    });
    setCoverPreview(article.coverImageUrl ? getAssetUrl(article.coverImageUrl) || article.coverImageUrl : null);
    setCoverFile(null);
    setEditingId(article.id);
    setDrawerOpen(true);
    setError(null);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
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
      const payload = { ...form, coverImage: coverFile || undefined };
      if (editingId) {
        await updateArticle(editingId, payload);
        setSuccess("Article updated");
      } else {
        await createArticle(payload);
        setSuccess(form.isPublished ? "Article published" : "Draft saved");
        setPage(1);
      }
      closeDrawer();
      await loadArticles(editingId ? page : 1);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (article: Article) => {
    setSaving(true);
    setError(null);
    try {
      await updateArticle(article.id, { isPublished: !article.isPublished });
      setSuccess(article.isPublished ? "Moved to drafts" : "Article published");
      await loadArticles(page);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await deleteArticle(id);
      setDeleteConfirmId(null);
      if (editingId === id) closeDrawer();
      setSuccess("Article deleted");
      const nextPage = articles.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) setPage(nextPage);
      else await loadArticles(nextPage);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const publishedCount = meta.publishedCount ?? 0;
  const draftCount = meta.draftCount ?? 0;
  const allCount = publishedCount + draftCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#e34b32]">Content</p>
          <h1 className="mt-1 font-display text-3xl font-black text-slate-800">Articles</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, edit, publish and manage content shown on{" "}
            <Link href="/articles" target="_blank" className="font-bold text-[#e34b32] hover:underline">
              /articles
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e34b32] px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-[#cf3f2a]"
        >
          <Plus size={18} />
          New Article
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => {
            setStatusFilter("");
            setPage(1);
          }}
          className={cn(
            "rounded-2xl border bg-white p-4 text-left shadow-sm transition",
            !statusFilter ? "border-[#e34b32]/40 ring-2 ring-[#e34b32]/10" : "border-slate-200 hover:border-slate-300"
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">All</p>
            <BookOpen size={16} className="text-slate-400" />
          </div>
          <p className="mt-2 font-display text-3xl font-black text-slate-800">{allCount}</p>
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("published");
            setPage(1);
          }}
          className={cn(
            "rounded-2xl border bg-white p-4 text-left shadow-sm transition",
            statusFilter === "published"
              ? "border-emerald-400/50 ring-2 ring-emerald-100"
              : "border-slate-200 hover:border-slate-300"
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-wider text-emerald-600">Published</p>
            <Eye size={16} className="text-emerald-500" />
          </div>
          <p className="mt-2 font-display text-3xl font-black text-slate-800">{publishedCount}</p>
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("draft");
            setPage(1);
          }}
          className={cn(
            "rounded-2xl border bg-white p-4 text-left shadow-sm transition",
            statusFilter === "draft"
              ? "border-amber-400/50 ring-2 ring-amber-100"
              : "border-slate-200 hover:border-slate-300"
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-wider text-amber-600">Drafts</p>
            <FileText size={16} className="text-amber-500" />
          </div>
          <p className="mt-2 font-display text-3xl font-black text-slate-800">{draftCount}</p>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertTriangle size={18} />
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-auto rounded-lg p-1 hover:bg-red-100">
            <X size={16} />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {/* Filters + table */}
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search title, slug, content..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-semibold outline-none focus:border-[#e34b32] focus:bg-white focus:ring-2 focus:ring-[#e34b32]/15"
            />
          </form>
          <div className="flex flex-wrap gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#e34b32]"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {(search || statusFilter || categoryFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setStatusFilter("");
                  setCategoryFilter("");
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <BookOpen className="mx-auto mb-4 text-slate-300" size={42} />
            <p className="font-display text-lg font-black text-slate-700">No articles found</p>
            <p className="mt-2 text-sm text-slate-500">
              {search || statusFilter || categoryFilter
                ? "Try adjusting your filters."
                : "Create your first article to get started."}
            </p>
            {!search && !statusFilter && !categoryFilter && (
              <button
                type="button"
                onClick={openCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#e34b32] px-4 py-2.5 text-sm font-black text-white"
              >
                <Plus size={16} /> New Article
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3">Article</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Category</th>
                  <th className="hidden px-4 py-3 md:table-cell">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map((article) => {
                  const imageUrl = article.coverImageUrl
                    ? getAssetUrl(article.coverImageUrl) || article.coverImageUrl
                    : null;

                  return (
                    <tr key={article.id} className="group transition hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            {imageUrl ? (
                              <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${imageUrl})` }}
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <BookOpen size={16} className="text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-display text-sm font-black text-slate-800">{article.title}</p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock size={11} /> {article.readTimeMin} min
                              </span>
                              {typeof article._count?.comments === "number" && (
                                <span className="flex items-center gap-1">
                                  <MessageCircle size={11} /> {article._count.comments}
                                </span>
                              )}
                              <span className="truncate text-slate-300">/{article.slug}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-black",
                            article.isPublished
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          )}
                        >
                          {article.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3.5 lg:table-cell">
                        <span className="rounded-full bg-[#fff3ef] px-2.5 py-1 text-[11px] font-black text-[#e34b32]">
                          {article.category}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3.5 text-xs font-bold text-slate-500 md:table-cell">
                        {formatDate(article.updatedAt || article.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {article.isPublished && (
                            <Link
                              href={`/articles/${article.slug}`}
                              target="_blank"
                              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
                              title="View live"
                            >
                              <ExternalLink size={14} />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => openEdit(article)}
                            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                            title="Edit"
                          >
                            <PenLine size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => handleTogglePublish(article)}
                            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                            title={article.isPublished ? "Unpublish" : "Publish"}
                          >
                            {article.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          {deleteConfirmId === article.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => handleDelete(article.id)}
                                className="rounded-lg bg-red-500 px-2.5 py-1.5 text-[11px] font-black text-white hover:bg-red-600 disabled:opacity-50"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-black text-slate-600"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(article.id)}
                              className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && meta.total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
            <p className="text-xs font-semibold text-slate-400">
              Showing{" "}
              <span className="font-bold text-slate-700">
                {(meta.page - 1) * meta.limit + 1}
              </span>{" "}
              –{" "}
              <span className="font-bold text-slate-700">
                {Math.min(meta.page * meta.limit, meta.total)}
              </span>{" "}
              of <span className="font-bold text-slate-700">{meta.total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.page <= 1 || loading}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 text-xs font-black text-slate-600">
                {meta.page} / {meta.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={meta.page >= meta.totalPages || loading}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over editor */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close drawer"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeDrawer}
          />
          <div className="relative z-10 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
              <div>
                <h2 className="font-display text-lg font-black text-slate-800">
                  {editingId ? "Edit Article" : "New Article"}
                </h2>
                <p className="text-xs font-bold text-slate-400">
                  {editingId ? "Update content and publishing status" : "Fill details and save as draft or publish"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 md:px-6">
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">
                    Title *
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Article headline"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">
                    Excerpt
                  </label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Short summary for cards and SEO"
                    rows={2}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">
                    Content *
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Write the full article. Separate paragraphs with a blank line."
                    rows={12}
                    className={cn(inputClass, "leading-7")}
                    required
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      className={inputClass}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">
                      Read time (min)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={form.readTimeMin}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, readTimeMin: Number(e.target.value) || 5 }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                    className="h-4 w-4 rounded accent-[#e34b32]"
                  />
                  <div>
                    <p className="text-sm font-black text-slate-700">Publish live</p>
                    <p className="text-xs font-semibold text-slate-400">Visible on the public articles page</p>
                  </div>
                </label>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">Cover image</p>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/avif"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                  {coverPreview ? (
                    <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-xl">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${coverPreview})` }}
                      />
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
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="mb-3 flex aspect-[16/9] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-400 transition hover:border-[#e34b32] hover:text-[#e34b32]"
                    >
                      <Upload size={26} />
                      <p className="mt-2 text-xs font-bold">Upload cover image</p>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-100"
                  >
                    {coverPreview ? "Change image" : "Select image"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-4 md:px-6">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-black text-white transition hover:bg-black disabled:opacity-60"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : form.isPublished
                        ? "Publish article"
                        : "Save draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
