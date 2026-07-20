import type { Blog } from "@/lib/api";
import {
  buildListingPaginationMeta,
  getListingPageParams,
} from "@/lib/blogs-pagination";

export const dummyBlogs: Blog[] = [
  {
    id: "dummy-blog-1",
    title: "How Collective Buying Is Changing Homeownership in India",
    slug: "collective-buying-changing-homeownership-india",
    excerpt:
      "A practical look at why buyers are joining groups to unlock developer-direct pricing and broker cashback.",
    content: `<p>Indian homebuyers are discovering that negotiating alone rarely unlocks the best terms. When five to seven serious buyers approach a developer together, the conversation changes.</p>
<p>GroupBuying helps shortlist inventory, form verified groups, and document savings so cashback and discounts actually land at booking.</p>
<blockquote><p>Transparency beats verbal promises — every group offer should be written into the booking path.</p></blockquote>
<p>Whether you are a first-time buyer in Noida or an NRI investing from Dubai, collective intent is becoming the smarter default.</p>`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=86",
    category: "Market Insights",
    readTimeMin: 5,
    isPublished: true,
    createdAt: "2026-07-10T10:00:00.000Z",
    author: { id: "author-1", firstName: "Priya", lastName: "Sharma" },
  },
  {
    id: "dummy-blog-2",
    title: "NRI Checklist: Buying a Home in India Without Flying Back Twice",
    slug: "nri-checklist-buying-home-india",
    excerpt: "PoA, remittance timing, and RM coordination — a compact checklist for overseas buyers.",
    content: `<h2>Before you join a group</h2>
<p>Get in-principle financing clarity, shortlist one corridor, and appoint a trusted local attorney for registration.</p>
<ul>
<li>Specific property PoA (not a blanket general PoA)</li>
<li>FEMA-compliant remittance documents ready</li>
<li>Evening call windows with your RM</li>
</ul>
<p>Batch KYC and registration into one India trip once inventory and payment schedules are locked.</p>`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=86",
    category: "NRI Corner",
    readTimeMin: 6,
    isPublished: true,
    createdAt: "2026-07-05T10:00:00.000Z",
    author: { id: "author-2", firstName: "Arun", lastName: "Raghav" },
  },
  {
    id: "dummy-blog-3",
    title: "Site Visit Notes That Actually Help Your Group Decide",
    slug: "site-visit-notes-help-group-decide",
    excerpt: "A shared checklist keeps every member evaluating the same things on visit day.",
    content: `<p>Photograph tower boards, check approach roads, sample flat quality, and parking allotment. Ask the same possession questions as a group.</p>
<p>One shared tracker prevents last-minute surprises when negotiation starts.</p>`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=86",
    category: "Buyer's Guide",
    readTimeMin: 4,
    isPublished: true,
    createdAt: "2026-06-28T10:00:00.000Z",
    author: { id: "author-3", firstName: "Neha", lastName: "Kapoor" },
  },
  {
    id: "dummy-blog-4",
    title: "Why Broker Cashback Only Counts When It Is Documented",
    slug: "broker-cashback-documented",
    excerpt: "If cashback is not written into the demand or booking path, treat it as a promise — not a saving.",
    content: `<p>Ask whether cashback is adjusted in the demand letter, paid after registration, or credited against milestones.</p>
<p>Get the path in writing before you book — especially inside a group deal.</p>`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=86",
    category: "Tips & Guides",
    readTimeMin: 3,
    isPublished: true,
    createdAt: "2026-06-20T10:00:00.000Z",
    author: { id: "author-1", firstName: "Priya", lastName: "Sharma" },
  },
];

export function getDummyBlogBySlug(slug: string): Blog | null {
  return dummyBlogs.find((blog) => blog.slug === slug) ?? null;
}

export function getDummyBlogsPage(
  page = 1,
  options?: { search?: string; category?: string }
) {
  const safePage = Math.max(1, page);
  const { limit, skip } = getListingPageParams(safePage);
  const q = options?.search?.trim().toLowerCase() || "";
  const category = options?.category?.trim() || "";

  const filtered = dummyBlogs.filter((blog) => {
    if (category && blog.category !== category) return false;
    if (!q) return true;
    const haystack = [blog.title, blog.excerpt || "", blog.content || "", blog.slug, blog.category]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return {
    blogs: filtered.slice(skip, skip + limit),
    meta: buildListingPaginationMeta(filtered.length, safePage),
  };
}

export function getDummySimilarBlogs(slug: string, limit = 3) {
  const current = getDummyBlogBySlug(slug);
  if (!current) return [];
  const sameCategory = dummyBlogs.filter(
    (blog) => blog.slug !== slug && blog.category === current.category
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  const others = dummyBlogs.filter(
    (blog) => blog.slug !== slug && !sameCategory.some((item) => item.id === blog.id)
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export const dummyBlogCommentsBySlug: Record<
  string,
  Array<{
    id: string;
    content: string;
    guestName?: string | null;
    blogId: string;
    createdAt: string;
    author?: { id: string; firstName: string; lastName: string } | null;
  }>
> = {
  "collective-buying-changing-homeownership-india": [
    {
      id: "bc1",
      content: "Clear write-up. We joined a group in Sector 150 after reading something similar.",
      guestName: "Mehul Shah",
      blogId: "dummy-blog-1",
      createdAt: "2026-07-11T08:00:00.000Z",
    },
  ],
};
