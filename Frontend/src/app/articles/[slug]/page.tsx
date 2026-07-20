import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock,
  UserRound,
} from "lucide-react";
import { ArticleComments } from "@/components/article-comments";
import { ButtonLink } from "@/components/button";
import { RequireAuth } from "@/components/require-auth";
import { ShareButton } from "@/components/share-button";
import { getArticleBySlug, getArticles, getSimilarArticles } from "@/lib/api";
import {
  dummyArticles,
  getDummyArticleBySlug,
  getDummySimilarArticles,
} from "@/lib/dummy-articles";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderArticleBody(content?: string) {
  if (!content?.trim()) return null;

  const blocks = content.split(/\n\n+/).filter(Boolean);
  let dropCapUsed = false;

  return blocks.map((block, i) => {
    const trimmed = block.trim();
    const isQuote =
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("“") && trimmed.endsWith("”"));

    if (isQuote) {
      return (
        <blockquote
          key={i}
          className="my-10 border-l-[3px] border-[#e34b32] bg-[#fff8f5] px-6 py-5 text-xl font-medium leading-relaxed text-[#1a1a1a] md:px-8 md:text-2xl md:leading-snug"
        >
          {trimmed.replace(/^["“]|["”]$/g, "")}
        </blockquote>
      );
    }

    if (!dropCapUsed) {
      dropCapUsed = true;
      return (
        <p
          key={i}
          className="mb-7 text-[1.075rem] leading-[1.85] text-slate-700 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-5xl first-letter:font-black first-letter:leading-none first-letter:text-[#e34b32]"
        >
          {trimmed}
        </p>
      );
    }

    return (
      <p key={i} className="mb-7 text-[1.075rem] leading-[1.85] text-slate-700">
        {trimmed}
      </p>
    );
  });
}

export async function generateStaticParams() {
  const { articles: apiArticles } = await getArticles({ page: 1, limit: 100 });
  const articles = apiArticles.length > 0 ? apiArticles : dummyArticles;
  return articles.map((article) => ({ slug: article.slug }));
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const redirectTo = `/articles/${slug}`;
  const hasAuth = Boolean(cookieStore.get("token")?.value);

  // Guests: client RequireAuth sends them to login (no content leak via dummy fallback)
  if (!hasAuth) {
    return <RequireAuth redirectTo={redirectTo}>{null}</RequireAuth>;
  }

  const apiArticle = await getArticleBySlug(slug, cookieHeader);
  const article = apiArticle ?? getDummyArticleBySlug(slug);
  const isDummy = !apiArticle;

  if (!article) notFound();

  const apiSimilar = isDummy ? [] : await getSimilarArticles(slug, 3);
  const similar = apiSimilar.length > 0 ? apiSimilar : getDummySimilarArticles(slug, 3);
  const authorName = article.author
    ? `${article.author.firstName} ${article.author.lastName}`.trim()
    : "GroupBuying Editorial";

  return (
    <RequireAuth redirectTo={redirectTo}>
    <main className="bg-[#faf8f6]">
      {/* Top bar */}
      <div className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="container-shell flex flex-wrap items-center justify-between gap-3 py-3.5 text-sm">
          <nav className="flex items-center gap-1.5 font-bold text-slate-500">
            <Link href="/" className="transition hover:text-[#e34b32]">
              Home
            </Link>
            <ChevronRight size={14} className="text-slate-300" />
            <Link href="/articles" className="transition hover:text-[#e34b32]">
              Articles
            </Link>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="max-w-[180px] truncate text-slate-800 sm:max-w-xs">{article.category}</span>
          </nav>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-black text-slate-600 transition hover:border-[#e34b32]/35 hover:text-[#e34b32]"
          >
            <ArrowLeft size={14} /> All articles
          </Link>
        </div>
      </div>

      <article>
        {/* Header */}
        <header className="border-b border-slate-200/70 bg-white">
          <div className="container-shell max-w-4xl py-10 md:py-14">
            <div className="mb-5 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.18em]">
              <span className="rounded-full bg-[#e34b32] px-3.5 py-1.5 text-white">{article.category}</span>
              <span className="text-slate-400">·</span>
              <span className="inline-flex items-center gap-1.5 normal-case tracking-normal text-slate-500">
                <CalendarDays size={14} /> {formatDate(article.createdAt)}
              </span>
              <span className="text-slate-400">·</span>
              <span className="inline-flex items-center gap-1.5 normal-case tracking-normal text-slate-500">
                <Clock size={14} /> {article.readTimeMin} min read
              </span>
            </div>

            <h1 className="font-display text-[2.15rem] font-black leading-[1.12] tracking-tight text-[#111111] md:text-5xl md:leading-[1.08]">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="mt-6 max-w-3xl border-l-2 border-[#e34b32]/40 pl-5 text-lg leading-8 text-slate-600 md:text-xl md:leading-9">
                {article.excerpt}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#e34b32] to-[#f3b64a] text-sm font-black text-white shadow-md">
                  {authorName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-black text-[#111111]">{authorName}</p>
                  <p className="text-xs font-bold text-slate-400">GroupBuying Editorial Team</p>
                </div>
              </div>
              <ShareButton title={article.title} text={article.excerpt || article.title} />
            </div>
          </div>
        </header>

        {/* Cover */}
        {article.coverImageUrl && (
          <div className="bg-white">
            <div className="container-shell max-w-5xl pb-2 pt-2 md:pb-4">
              <div className="overflow-hidden rounded-[1.25rem] shadow-[0_24px_60px_rgba(17,17,17,0.12)] md:rounded-[1.75rem]">
                <div
                  className="aspect-[21/9] min-h-[220px] w-full bg-cover bg-center md:min-h-[360px]"
                  style={{ backgroundImage: `url(${article.coverImageUrl})` }}
                  role="img"
                  aria-label={article.title}
                />
              </div>
            </div>
          </div>
        )}

        {/* Body + sidebar */}
        <section className="py-10 md:py-14">
          <div className="container-shell">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
              <div className="min-w-0">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
                  <div className="article-body">{renderArticleBody(article.content)}</div>

                  <div className="mt-12 overflow-hidden rounded-[1.75rem] border border-[#e34b32]/15 bg-gradient-to-br from-[#fff7f3] via-white to-[#fff3e8] p-8 md:p-10">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e34b32]">Next step</p>
                    <h2 className="mt-2 font-display text-2xl font-black text-[#111111] md:text-3xl">
                      Ready to save on your dream home?
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                      Join a verified buying group and unlock developer-direct pricing plus broker cashback — with end-to-end RM support.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <ButtonLink href="/properties">Explore Properties</ButtonLink>
                      <ButtonLink href="/contact" variant="secondary">
                        Talk to Expert
                      </ButtonLink>
                    </div>
                  </div>

                  <ArticleComments slug={slug} isDummy={isDummy} />
                </div>
              </div>

              <aside className="lg:pt-1">
                <div className="sticky top-24 space-y-5">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">In this article</p>
                    <ul className="mt-4 space-y-3 text-sm font-bold text-slate-600">
                      <li className="flex items-start gap-2">
                        <UserRound size={15} className="mt-0.5 shrink-0 text-[#e34b32]" />
                        Written by {authorName}
                      </li>
                      <li className="flex items-start gap-2">
                        <CalendarDays size={15} className="mt-0.5 shrink-0 text-[#e34b32]" />
                        Published {formatDate(article.createdAt)}
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock size={15} className="mt-0.5 shrink-0 text-[#e34b32]" />
                        {article.readTimeMin} minute read
                      </li>
                      <li className="flex items-start gap-2">
                        <BookOpen size={15} className="mt-0.5 shrink-0 text-[#e34b32]" />
                        Category: {article.category}
                      </li>
                    </ul>
                  </div>

                  {similar.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Related reads</p>
                      <div className="mt-4 space-y-4">
                        {similar.slice(0, 3).map((item) => (
                          <Link key={item.id} href={`/articles/${item.slug}`} className="group flex gap-3">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                              {item.coverImageUrl ? (
                                <div
                                  className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-105"
                                  style={{ backgroundImage: `url(${item.coverImageUrl})` }}
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <BookOpen size={16} className="text-[#e34b32]/40" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-wider text-[#e34b32]">
                                {item.category}
                              </p>
                              <p className="mt-1 text-sm font-black leading-snug text-[#111111] transition group-hover:text-[#e34b32] line-clamp-2">
                                {item.title}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl bg-[#111111] p-5 text-white shadow-lg">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f3b64a]">GroupBuying</p>
                    <p className="mt-2 font-display text-lg font-black leading-snug">
                      Pay less together on your next home.
                    </p>
                    <Link
                      href="/subscribe"
                      className="mt-4 inline-flex text-sm font-black text-[#f3b64a] transition hover:text-white"
                    >
                      View plans →
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </article>

      {/* More stories */}
      {similar.length > 0 && (
        <section className="border-t border-slate-200 bg-white py-14 md:py-16">
          <div className="container-shell">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e34b32]">Keep reading</p>
                <h2 className="mt-2 font-display text-3xl font-black text-[#111111]">More from GroupBuying</h2>
              </div>
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-sm font-black text-[#e34b32] transition hover:gap-3"
              >
                View all articles <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {similar.map((item) => (
                <Link
                  key={item.id}
                  href={`/articles/${item.slug}`}
                  className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[#faf8f6] transition hover:-translate-y-1 hover:border-[#e34b32]/25 hover:shadow-xl"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {item.coverImageUrl ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${item.coverImageUrl})` }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="text-[#e34b32]/30" size={36} />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#e34b32]">{item.category}</p>
                    <h3 className="mt-2 font-display text-lg font-black leading-snug text-[#111111] transition group-hover:text-[#e34b32] line-clamp-2">
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="mt-2 text-sm leading-6 text-slate-500 line-clamp-2">{item.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
    </RequireAuth>
  );
}
