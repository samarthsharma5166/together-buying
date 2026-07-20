"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import {
  ArticleComment,
  createArticleComment,
  deleteArticleComment,
  getArticleComments,
} from "@/lib/api";
import { dummyCommentsBySlug } from "@/lib/dummy-articles";
import { useAppSelector } from "@/store/hooks";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function displayName(comment: ArticleComment) {
  if (comment.author) return `${comment.author.firstName} ${comment.author.lastName}`.trim();
  return comment.guestName || "Guest";
}

export function ArticleComments({ slug, isDummy = false }: { slug: string; isDummy?: boolean }) {
  const user = useAppSelector((state) => state.auth.user);
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [guestName, setGuestName] = useState("");

  const loadComments = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isDummy) {
        const dummy = (dummyCommentsBySlug[slug] || []) as ArticleComment[];
        setComments(dummy);
        setTotal(dummy.length);
        return;
      }
      const result = await getArticleComments(slug, { page: 1, limit: 50 });
      if (result.comments.length === 0 && (dummyCommentsBySlug[slug]?.length || 0) > 0) {
        const dummy = (dummyCommentsBySlug[slug] || []) as ArticleComment[];
        setComments(dummy);
        setTotal(dummy.length);
      } else {
        setComments(result.comments);
        setTotal(result.meta.total);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [slug, isDummy]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please write a comment");
      return;
    }
    if (!user && !guestName.trim()) {
      setError("Please enter your name or log in");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (isDummy) {
        const optimistic: ArticleComment = {
          id: `local-${Date.now()}`,
          content: content.trim(),
          guestName: user ? null : guestName.trim(),
          articleId: slug,
          authorId: user?.id || null,
          createdAt: new Date().toISOString(),
          author: user
            ? { id: user.id, firstName: user.firstName, lastName: user.lastName }
            : null,
        };
        setComments((prev) => [optimistic, ...prev]);
        setTotal((prev) => prev + 1);
        setContent("");
        return;
      }

      const created = await createArticleComment(slug, {
        content: content.trim(),
        guestName: user ? undefined : guestName.trim(),
      });
      setComments((prev) => [created, ...prev]);
      setTotal((prev) => prev + 1);
      setContent("");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isDummy || id.startsWith("local-")) {
      setComments((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      return;
    }
    try {
      await deleteArticleComment(id);
      setComments((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to delete comment");
    }
  };

  const canDelete = (comment: ArticleComment) => {
    if (!user) return false;
    if (comment.authorId && comment.authorId === user.id) return true;
    return user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  };

  return (
    <section className="mt-14 border-t border-slate-200 pt-12">
      <div className="mb-7 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e34b32]">Discussion</p>
          <h2 className="mt-1 font-display text-2xl font-black text-[#111111]">Join the conversation</h2>
          <p className="mt-1 text-sm text-slate-500">
            {total} comment{total === 1 ? "" : "s"} on this article
          </p>
        </div>
        <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-[#fff3ef] text-[#e34b32] sm:flex">
          <MessageCircle size={22} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 space-y-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6"
      >
        {!user && (
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-slate-200 bg-[#faf8f6] px-4 py-3 text-sm font-semibold focus:border-[#e34b32] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e34b32]/15"
          />
        )}
        {user && (
          <p className="text-xs font-bold text-slate-400">
            Commenting as {user.firstName} {user.lastName}
          </p>
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Share your thoughts on this article..."
          className="w-full rounded-xl border border-slate-200 bg-[#faf8f6] px-4 py-3 text-sm leading-7 focus:border-[#e34b32] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e34b32]/15"
        />
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting ? "Posting..." : "Post Comment"}
          </Button>
          {!user && (
            <Link href="/login" className="text-sm font-bold text-[#e34b32] hover:underline">
              Or log in to comment
            </Link>
          )}
        </div>
      </form>

      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
          <MessageCircle className="mx-auto mb-3 text-slate-300" size={32} />
          <p className="font-display text-lg font-black text-slate-700">No comments yet</p>
          <p className="mt-1 text-sm text-slate-500">Be the first to share your thoughts.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#fff3ef] to-[#ffe8df] text-xs font-black text-[#e34b32]">
                    {displayName(comment)
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{displayName(comment)}</p>
                    <p className="text-xs font-bold text-slate-400">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
                {canDelete(comment) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                    aria-label="Delete comment"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-[0.95rem] leading-7 text-slate-600">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
