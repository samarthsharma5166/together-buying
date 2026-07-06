import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, UserRound } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { getBlogBySlug, getBlogs } from "@/lib/api";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateStaticParams() {
  const blogs = await getBlogs();
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) notFound();

  return (
    <main>
      <article>
        <section className="relative overflow-hidden bg-[#111111] py-16 md:py-24">
          {blog.coverImageUrl && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{ backgroundImage: `url(${blog.coverImageUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/80 via-[#111111]/70 to-[#111111]" />
            </>
          )}
          <div className="container-shell relative">
            <Link
              href="/blogs"
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              <ArrowLeft size={16} /> Back to Blogs
            </Link>

            <span className="mb-4 inline-block rounded-full bg-[#e34b32] px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white">
              {blog.category}
            </span>

            <h1 className="max-w-4xl font-display text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
              {blog.title}
            </h1>

            {blog.excerpt && (
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{blog.excerpt}</p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm font-bold text-slate-400">
              {blog.author && (
                <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur">
                  <UserRound size={16} />
                  {blog.author.firstName} {blog.author.lastName}
                </span>
              )}
              <span className="flex items-center gap-2"><CalendarDays size={16} /> {formatDate(blog.createdAt)}</span>
              <span className="flex items-center gap-2"><Clock size={16} /> {blog.readTimeMin} min read</span>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container-shell">
            <div className="mx-auto max-w-3xl">
              <div className="prose prose-lg prose-slate max-w-none">
                {blog.content?.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="mb-6 text-base leading-8 text-slate-600">{paragraph}</p>
                ))}
              </div>

              <div className="mt-12 rounded-[2rem] bg-[#fff6f2] p-8 text-center">
                <h2 className="font-display text-2xl font-black text-[#111111]">Ready to save on your dream home?</h2>
                <p className="mt-3 text-sm text-slate-500">Join a buying group and unlock developer-direct savings.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <ButtonLink href="/properties">Explore Properties</ButtonLink>
                  <ButtonLink href="/contact" variant="secondary">Talk to Expert</ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
