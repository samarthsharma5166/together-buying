/**
 * Upsert a few sample published blogs for local testing.
 * Run: npx tsx prisma/seed-blogs.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BLOG_SEEDS = [
  {
    title: "How Collective Buying Is Changing Homeownership in India",
    slug: "collective-buying-changing-homeownership-india",
    excerpt:
      "A practical look at why buyers are joining groups to unlock developer-direct pricing and broker cashback.",
    content: `<p>Indian homebuyers are discovering that negotiating alone rarely unlocks the best terms. When five to seven serious buyers approach a developer together, the conversation changes.</p>
<p>GroupBuying helps shortlist inventory, form verified groups, and document savings so cashback and discounts actually land at booking.</p>
<blockquote><p>Transparency beats verbal promises — every group offer should be written into the booking path.</p></blockquote>
<p>Whether you are a first-time buyer in Noida or an NRI investing from Dubai, collective intent is becoming the smarter default.</p>`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=86",
    category: "Market Insights",
    readTimeMin: 5,
  },
  {
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
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=86",
    category: "NRI Corner",
    readTimeMin: 6,
  },
  {
    title: "Site Visit Notes That Actually Help Your Group Decide",
    slug: "site-visit-notes-help-group-decide",
    excerpt: "A shared checklist keeps every member evaluating the same things on visit day.",
    content: `<p>Photograph tower boards, check approach roads, sample flat quality, and parking allotment. Ask the same possession questions as a group.</p>
<p>One shared tracker prevents last-minute surprises when negotiation starts.</p>`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=86",
    category: "Buyer's Guide",
    readTimeMin: 4,
  },
  {
    title: "Why Broker Cashback Only Counts When It Is Documented",
    slug: "broker-cashback-documented",
    excerpt: "If cashback is not written into the demand or booking path, treat it as a promise — not a saving.",
    content: `<p>Ask whether cashback is adjusted in the demand letter, paid after registration, or credited against milestones.</p>
<p>Get the path in writing before you book — especially inside a group deal.</p>`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=86",
    category: "Tips & Guides",
    readTimeMin: 3,
  },
];

async function main() {
  let admin = await prisma.user.findFirst({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
  });

  if (!admin) {
    const bcrypt = await import("bcrypt");
    admin = await prisma.user.create({
      data: {
        firstName: "Group",
        lastName: "Admin",
        email: "admin@groupbuying.in",
        phone: "9999999999",
        password: await bcrypt.hash("Admin@1234", 10),
        role: "SUPER_ADMIN",
      },
    });
  }

  for (const blog of BLOG_SEEDS) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      create: {
        ...blog,
        isPublished: true,
        authorId: admin.id,
      },
      update: {
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        coverImageUrl: blog.coverImageUrl,
        category: blog.category,
        readTimeMin: blog.readTimeMin,
        isPublished: true,
      },
    });
  }

  const total = await prisma.blog.count();
  const published = await prisma.blog.count({ where: { isPublished: true } });
  console.log(`Blogs ready: ${published} published / ${total} total`);
}

const isDirectRun = process.argv[1]?.includes("seed-blogs");
if (isDirectRun) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
