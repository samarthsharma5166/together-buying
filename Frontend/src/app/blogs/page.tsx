import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { BlogCoverImage } from "@/components/blog-cover-image";
import { BlogsSearch } from "@/components/blogs-search";
import { ButtonLink } from "@/components/button";
import { getBlogsListing, type Blog } from "@/lib/api";
import { getListingRange } from "@/lib/blogs-pagination";
import { getDummyBlogsPage } from "@/lib/dummy-blogs";

const CATEGORY_COPY: Record<string, string> = {
  "NRI Corner": "Guides for overseas buyers navigating Indian real estate remotely.",
  "Success Stories": "How families unlocked developer-direct savings in buying groups.",
  "Market Insights": "Corridor trends, launch timing, and pricing signals across NCR.",
  "Buyer's Guide": "Compare inventory, negotiate smarter, and close with clarity.",
  "Tips & Guides": "Short checklists for every stage of your buying journey.",
  General: "Curated reads from the GroupBuying editorial team.",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildBlogsHref(page: number, q?: string, category?: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  const qs = params.toString();
  return qs ? `/blogs?${qs}` : "/blogs";
}

function authorLabel(blog: Blog) {
  if (!blog.author) return "Editorial";
  return `${blog.author.firstName} ${blog.author.lastName}`.trim();
}

/** Magazine lead: large image + story (left column) */
function LeadStory({ blog }: { blog: Blog }) {
  return (
    <Link href={`/blogs/${blog.slug}`} className="group block">
      <BlogCoverImage
        src={blog.coverImageUrl}
        alt={blog.title}
        className="aspect-[16/10] w-full rounded-2xl"
      />
      <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-[#e34b32]">
        {blog.category}
      </p>
      <h2 className="mt-2 font-display text-3xl font-black leading-[1.15] text-[#111111] transition group-hover:text-[#e34b32] md:text-4xl">
        {blog.title}
      </h2>
      {blog.excerpt && (
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 line-clamp-3">
          {blog.excerpt}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
        <span>{authorLabel(blog)}</span>
        <span className="text-slate-300">·</span>
        <span>{formatDate(blog.createdAt)}</span>
        <span className="text-slate-300">·</span>
        <span className="inline-flex items-center gap-1">
          <Clock size={12} /> {blog.readTimeMin} min
        </span>
      </div>
    </Link>
  );
}

/** Compact side-stack rows (right column) */
function SideStory({ blog }: { blog: Blog }) {
  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className="group flex gap-4 border-t border-slate-200 py-4 first:border-t-0 first:pt-0"
    >
      <BlogCoverImage
        src={blog.coverImageUrl}
        alt={blog.title}
        className="h-[72px] w-[96px] shrink-0 rounded-xl"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#e34b32]">
          {blog.category}
        </p>
        <h3 className="mt-1 font-display text-base font-black leading-snug text-[#111111] transition group-hover:text-[#e34b32] line-clamp-2">
          {blog.title}
        </h3>
        <p className="mt-1.5 text-xs font-bold text-slate-400">
          {formatDate(blog.createdAt)} · {blog.readTimeMin} min
        </p>
      </div>
    </Link>
  );
}

function GridCard({ blog }: { blog: Blog }) {
  return (
    <Link href={`/blogs/${blog.slug}`} className="group block">
      <BlogCoverImage
        src={blog.coverImageUrl}
        alt={blog.title}
        className="aspect-[16/10] w-full rounded-2xl"
      />
      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#e34b32]">
        {blog.category}
      </p>
      <h3 className="mt-1.5 font-display text-lg font-black leading-snug text-[#111111] transition group-hover:text-[#e34b32] line-clamp-2">
        {blog.title}
      </h3>
      {blog.excerpt && (
        <p className="mt-2 text-sm leading-6 text-slate-500 line-clamp-2">{blog.excerpt}</p>
      )}
      <p className="mt-3 text-xs font-bold text-slate-400">
        {authorLabel(blog)} · {blog.readTimeMin} min
      </p>
    </Link>
  );
}

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const q = (params.q || "").trim();
  const category = (params.category || "").trim();

  const apiResult = await getBlogsListing({
    page,
    search: q || undefined,
    category: category || undefined,
  });

  const hasFilters = Boolean(q || category);
  const usingApi = apiResult.meta.total > 0 || apiResult.blogs.length > 0 || hasFilters;
  const { blogs, meta } = usingApi
    ? apiResult
    : getDummyBlogsPage(page, { search: q, category });

  const { from, to } = getListingRange(meta);

  const useMagazine = page === 1 && !q && blogs.length >= 2;
  const lead = useMagazine ? blogs[0] : null;
  // Page of 13: 1 lead + 3 side + 9 grid (exact 3×3 “More to read”)
  const sideStack = useMagazine ? blogs.slice(1, 4) : [];
  const gridBlogs = useMagazine ? blogs.slice(4) : blogs;

  const heading = category
    ? category
    : q
      ? `Results for “${q}”`
      : "Insights, guides, and stories from the GroupBuying blog";

  const subcopy = category
    ? CATEGORY_COPY[category] || "Curated GroupBuying editorial."
    : q
      ? `${meta.total} blog${meta.total === 1 ? "" : "s"} found`
      : "Expert guides, buyer stories, and market insights from the GroupBuying team.";

  return (
    <main className="bg-[#fafafa]">
      {/* Compact header — Medium/HubSpot style */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container-shell py-8 md:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e34b32]">
                GroupBuying · Resources
              </p>
              <h1 className="mt-2 font-display text-3xl font-black leading-tight text-[#111111] md:text-4xl lg:text-5xl">
                {heading}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 md:text-base">{subcopy}</p>
            </div>
          </div>

          <div className="mt-6">
            <Suspense fallback={<div className="h-16 animate-pulse rounded-full bg-slate-100" />}>
              <BlogsSearch initialQuery={q} initialCategory={category} />
            </Suspense>
          </div>

          {hasFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-500">
              <span>
                Showing {from}–{to} of {meta.total}
              </span>
              <Link href="/blogs" className="text-[#e34b32] hover:underline">
                Clear filters
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="container-shell py-8 md:py-10">
        {blogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <h2 className="font-display text-2xl font-black text-slate-800">
              {hasFilters ? "No matching blogs" : "No blogs yet"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {hasFilters ? "Try another keyword or category." : "Fresh stories are coming soon."}
            </p>
            {hasFilters && (
              <Link
                href="/blogs"
                className="mt-5 inline-flex rounded-full bg-[#e34b32] px-5 py-2.5 text-sm font-black text-white"
              >
                Browse all
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Magazine split: lead + side stack */}
            {lead && (
              <section className="grid gap-10 lg:grid-cols-[1.35fr_0.9fr] lg:gap-12">
                <LeadStory blog={lead} />
                <aside>
                  <p className="mb-1 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    Also trending
                  </p>
                  <div>
                    {sideStack.map((blog) => (
                      <SideStory key={blog.id} blog={blog} />
                    ))}
                  </div>
                </aside>
              </section>
            )}

            {/* CTA band */}
            <section className="my-10 flex flex-col items-start justify-between gap-4 rounded-2xl bg-[#111111] px-6 py-6 text-white md:flex-row md:items-center md:px-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f3b64a]">
                  Ready to save?
                </p>
                <p className="mt-1 font-display text-xl font-black md:text-2xl">
                  Join a buying group on your shortlisted project.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/properties">Explore properties</ButtonLink>
                <ButtonLink href="/contact" variant="ghost">
                  Talk to expert
                </ButtonLink>
              </div>
            </section>

            {/* Remaining / all grid */}
            {gridBlogs.length > 0 && (
              <section>
                <div className="mb-6 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      {useMagazine ? "More to read" : "Latest"}
                    </p>
                    {!hasFilters && (
                      <p className="mt-1 text-sm font-bold text-slate-600">
                        {from}–{to} of {meta.total}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {gridBlogs.map((blog) => (
                    <GridCard key={blog.id} blog={blog} />
                  ))}
                </div>
              </section>
            )}

            {meta.totalPages > 1 && (
              <nav
                aria-label="Blogs pagination"
                className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6"
              >
                <p className="text-sm font-bold text-slate-500">
                  Page {meta.page} of {meta.totalPages}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {meta.page > 1 && (
                    <Link
                      href={buildBlogsHref(meta.page - 1, q, category)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:border-[#e34b32] hover:text-[#e34b32]"
                    >
                      <ArrowLeft size={15} /> Prev
                    </Link>
                  )}
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Link
                      key={pageNum}
                      href={buildBlogsHref(pageNum, q, category)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                        pageNum === meta.page
                          ? "bg-[#e34b32] text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-[#e34b32] hover:text-[#e34b32]"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  ))}
                  {meta.page < meta.totalPages && (
                    <Link
                      href={buildBlogsHref(meta.page + 1, q, category)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:border-[#e34b32] hover:text-[#e34b32]"
                    >
                      Next <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}
