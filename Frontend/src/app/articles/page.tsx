import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { ArticleCoverImage } from "@/components/article-cover-image";
import { ArticlesSearch } from "@/components/articles-search";
import { ButtonLink } from "@/components/button";
import { getArticlesListing, type Article } from "@/lib/api";
import { getListingRange } from "@/lib/articles-pagination";
import { getDummyArticlesPage } from "@/lib/dummy-articles";

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

function buildArticlesHref(page: number, q?: string, category?: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  const qs = params.toString();
  return qs ? `/articles?${qs}` : "/articles";
}

function authorLabel(article: Article) {
  if (!article.author) return "Editorial";
  return `${article.author.firstName} ${article.author.lastName}`.trim();
}

/** Magazine lead: large image + story (left column) */
function LeadStory({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <ArticleCoverImage
        src={article.coverImageUrl}
        alt={article.title}
        className="aspect-[16/10] w-full rounded-2xl"
      />
      <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-[#e34b32]">
        {article.category}
      </p>
      <h2 className="mt-2 font-display text-3xl font-black leading-[1.15] text-[#111111] transition group-hover:text-[#e34b32] md:text-4xl">
        {article.title}
      </h2>
      {article.excerpt && (
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 line-clamp-3">
          {article.excerpt}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
        <span>{authorLabel(article)}</span>
        <span className="text-slate-300">·</span>
        <span>{formatDate(article.createdAt)}</span>
        <span className="text-slate-300">·</span>
        <span className="inline-flex items-center gap-1">
          <Clock size={12} /> {article.readTimeMin} min
        </span>
      </div>
    </Link>
  );
}

/** Compact side-stack rows (right column) */
function SideStory({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex gap-4 border-t border-slate-200 py-4 first:border-t-0 first:pt-0"
    >
      <ArticleCoverImage
        src={article.coverImageUrl}
        alt={article.title}
        className="h-[72px] w-[96px] shrink-0 rounded-xl"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#e34b32]">
          {article.category}
        </p>
        <h3 className="mt-1 font-display text-base font-black leading-snug text-[#111111] transition group-hover:text-[#e34b32] line-clamp-2">
          {article.title}
        </h3>
        <p className="mt-1.5 text-xs font-bold text-slate-400">
          {formatDate(article.createdAt)} · {article.readTimeMin} min
        </p>
      </div>
    </Link>
  );
}

function GridCard({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <ArticleCoverImage
        src={article.coverImageUrl}
        alt={article.title}
        className="aspect-[16/10] w-full rounded-2xl"
      />
      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#e34b32]">
        {article.category}
      </p>
      <h3 className="mt-1.5 font-display text-lg font-black leading-snug text-[#111111] transition group-hover:text-[#e34b32] line-clamp-2">
        {article.title}
      </h3>
      {article.excerpt && (
        <p className="mt-2 text-sm leading-6 text-slate-500 line-clamp-2">{article.excerpt}</p>
      )}
      <p className="mt-3 text-xs font-bold text-slate-400">
        {authorLabel(article)} · {article.readTimeMin} min
      </p>
    </Link>
  );
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const q = (params.q || "").trim();
  const category = (params.category || "").trim();

  const apiResult = await getArticlesListing({
    page,
    search: q || undefined,
    category: category || undefined,
  });

  const hasFilters = Boolean(q || category);
  const usingApi = apiResult.meta.total > 0 || apiResult.articles.length > 0 || hasFilters;
  const { articles, meta } = usingApi
    ? apiResult
    : getDummyArticlesPage(page, { search: q, category });

  const { from, to } = getListingRange(meta);

  const useMagazine = page === 1 && !q && articles.length >= 2;
  const lead = useMagazine ? articles[0] : null;
  // Page of 13: 1 lead + 3 side + 9 grid (exact 3×3 “More to read”)
  const sideStack = useMagazine ? articles.slice(1, 4) : [];
  const gridArticles = useMagazine ? articles.slice(4) : articles;

  const heading = category
    ? category
    : q
      ? `Results for “${q}”`
      : "Stories that help you buy smarter";

  const subcopy = category
    ? CATEGORY_COPY[category] || "Curated GroupBuying editorial."
    : q
      ? `${meta.total} article${meta.total === 1 ? "" : "s"} found`
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
              <ArticlesSearch initialQuery={q} initialCategory={category} />
            </Suspense>
          </div>

          {hasFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-500">
              <span>
                Showing {from}–{to} of {meta.total}
              </span>
              <Link href="/articles" className="text-[#e34b32] hover:underline">
                Clear filters
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="container-shell py-8 md:py-10">
        {articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <h2 className="font-display text-2xl font-black text-slate-800">
              {hasFilters ? "No matching articles" : "No articles yet"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {hasFilters ? "Try another keyword or category." : "Fresh stories are coming soon."}
            </p>
            {hasFilters && (
              <Link
                href="/articles"
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
                <LeadStory article={lead} />
                <aside>
                  <p className="mb-1 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    Also trending
                  </p>
                  <div>
                    {sideStack.map((article) => (
                      <SideStory key={article.id} article={article} />
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
            {gridArticles.length > 0 && (
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
                  {gridArticles.map((article) => (
                    <GridCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}

            {meta.totalPages > 1 && (
              <nav
                aria-label="Articles pagination"
                className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6"
              >
                <p className="text-sm font-bold text-slate-500">
                  Page {meta.page} of {meta.totalPages}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {meta.page > 1 && (
                    <Link
                      href={buildArticlesHref(meta.page - 1, q, category)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:border-[#e34b32] hover:text-[#e34b32]"
                    >
                      <ArrowLeft size={15} /> Prev
                    </Link>
                  )}
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Link
                      key={pageNum}
                      href={buildArticlesHref(pageNum, q, category)}
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
                      href={buildArticlesHref(meta.page + 1, q, category)}
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
