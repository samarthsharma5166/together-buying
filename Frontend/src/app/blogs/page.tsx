import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Clock, Sparkles } from "lucide-react";
import { Section } from "@/components/section";
import { getBlogs } from "@/lib/api";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return (
    <main>
      <section className="hero-premium-bg relative overflow-hidden py-16 md:py-24">
        <div className="glow-blob green left-10 top-20" />
        <div className="glow-blob gold bottom-16 right-16" />
        <div className="container-shell text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#e34b32] shadow-sm">
            <Sparkles size={15} /> Insights & Stories
          </p>
          <h1 className="font-display text-5xl font-black leading-tight text-[#111111] md:text-6xl">
            GroupBuying <span className="gradient-text">Blogs</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
            Real estate success stories, market insights, and expert tips on group buying — curated by our team.
          </p>
        </div>
      </section>

      <Section eyebrow="Latest Articles" title="Read, learn & save smarter">
        {blogs.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-[#fff6f2] px-8 py-20 text-center">
            <BookOpen className="mx-auto mb-4 text-slate-300" size={48} />
            <h2 className="font-display text-2xl font-black text-slate-700">No blogs published yet</h2>
            <p className="mt-2 text-sm text-slate-500">Check back soon for fresh content from our experts.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.slug}`}
                className="group stagger-card magnetic-card hover-lift overflow-hidden rounded-[2rem] bg-white premium-border"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#fff3ef] to-slate-100">
                  {blog.coverImageUrl ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${blog.coverImageUrl})` }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="text-[#e34b32]/30" size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#e34b32]">
                    {blog.category}
                  </span>
                </div>

                <div className="p-6">
                  <div className="mb-3 flex items-center gap-3 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1"><CalendarDays size={14} /> {formatDate(blog.createdAt)}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {blog.readTimeMin} min</span>
                  </div>
                  <h3 className="font-display text-xl font-black text-[#111111] transition group-hover:text-[#e34b32] line-clamp-2">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="mt-3 text-sm leading-7 text-slate-500 line-clamp-3">{blog.excerpt}</p>
                  )}
                  {blog.author && (
                    <p className="mt-4 text-xs font-bold text-slate-400">
                      By {blog.author.firstName} {blog.author.lastName}
                    </p>
                  )}
                  <p className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#e34b32]">
                    Read More <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
