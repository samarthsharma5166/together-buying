import type { Article } from "@/lib/api";
import {
  buildListingPaginationMeta,
  getListingPageParams,
} from "@/lib/articles-pagination";

export const dummyArticles: Article[] = [
  {
    id: "dummy-1",
    title: "How Group Buying Saved a Family Over ₹1 Crore in Gurugram",
    slug: "group-buying-saved-family-one-crore-gurugram",
    excerpt:
      "When the Mehta family joined a 6-buyer group at a premium Gurugram project, they unlocked a developer-direct discount that no individual buyer could negotiate alone.",
    content: `Buying a home in Gurugram's premium corridors often means paying the listed price — or close to it. The Mehta family had shortlisted a 3 BHK in a Sector 79 project, but the developer's quote felt steep at ₹2.4 crore.

Through GroupBuying, they joined an active buyer group of six families targeting the same tower and inventory type. The collective intent gave the developer confidence to offer a bulk-rate discount, waive the floor-rise premium, and pass back the full broker commission as buyer cashback.

The result: the Mehtas closed at ₹2.05 crore — a saving of over ₹35 lakh on the unit price alone, plus ₹8 lakh in broker cashback. Across the group, total savings exceeded ₹1 crore.

"The transparency was the biggest win," says Rajat Mehta. "We knew exactly what the developer offered the group versus what we would have got individually. No hidden cuts, no surprises at registration."

Group buying works because developers respond to volume. Multiple serious buyers signing within the same window reduces inventory risk and marketing cost — savings that can be passed directly to buyers when broker commission is returned as cashback.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=86",
    category: "Success Stories",
    readTimeMin: 6,
    isPublished: true,
    createdAt: "2026-06-15T10:00:00.000Z",
    author: { id: "author-1", firstName: "Priya", lastName: "Sharma" },
  },
  {
    id: "dummy-2",
    title: "The Group Buying Revolution in Indian Real Estate",
    slug: "group-buying-revolution-indian-real-estate",
    excerpt:
      "Individual buyers rarely get developer attention. Group buying flips the script — turning 5–7 serious buyers into a negotiation force that unlocks better pricing and payment terms.",
    content: `Indian real estate has long favoured developers and channel partners. Individual buyers walk into showrooms alone, compare scattered quotes, and often pay broker fees that never come back.

Group buying changes the power dynamic. When five to seven verified buyers express interest in the same project, developers see reduced inventory risk and lower customer acquisition cost. That creates room for genuine price concessions.

Platforms like GroupBuying formalise this process: shortlisting, RM-guided comparisons, group formation, and documented negotiation — so savings are real and traceable, not verbal promises that evaporate at booking.

Early adopters in NCR corridors — Greater Noida, Noida Extension, Gurugram — are already seeing 5–15% extra savings beyond individual quotes. As more buyers understand that they still own their individual units while negotiating as a group, the model is scaling fast.

The revolution isn't about cutting corners. It's about buyers showing up together, with data, intent, and expert support — and developers responding with terms they reserve for bulk deals.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=86",
    category: "Market Insights",
    readTimeMin: 5,
    isPublished: true,
    createdAt: "2026-06-08T10:00:00.000Z",
    author: { id: "author-2", firstName: "Arun", lastName: "Raghav" },
  },
  {
    id: "dummy-3",
    title: "How to Compare Luxury Apartment Inventory Before You Join a Group",
    slug: "compare-luxury-apartment-inventory",
    excerpt:
      "Not all inventory in the same project is equal. Floor rise, tower orientation, payment plans, and possession timelines can swing your final cost by lakhs.",
    content: `Joining a buying group is smart — but only if you've compared the right inventory first. Two 3 BHK units in the same project can differ by ₹15–25 lakh depending on tower, floor, and view category.

Start with the basics: super area vs carpet area, loading factor, and what's included in the base price. Then compare floor-rise charts — some developers charge steep premiums above the 10th floor that wipe out group discounts.

Check possession status carefully. Under-construction units may offer better entry pricing, but ready-to-move inventory reduces rental overlap if you're upgrading. Payment plans matter too: construction-linked plans reduce upfront outflow but extend your EMI window.

Use your RM to pull a side-by-side sheet: base price, floor rise, PLC charges, parking, club membership, and estimated registration. GroupBuying buyers who do this homework negotiate from strength — the group knows exactly which inventory blocks to target for maximum savings.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=86",
    category: "Buyer's Guide",
    readTimeMin: 7,
    isPublished: true,
    createdAt: "2026-05-28T10:00:00.000Z",
    author: { id: "author-1", firstName: "Priya", lastName: "Sharma" },
  },
  {
    id: "dummy-4",
    title: "NRI Buyers: Why Group Buying Works Even From Abroad",
    slug: "nri-buyers-group-buying-from-abroad",
    excerpt:
      "NRIs face trust gaps, remote site visits, and opaque pricing. A verified buying group with RM support solves all three — without requiring you to fly in for every step.",
    content: `Non-resident Indians often hesitate to buy in India because they can't visit sites frequently, verify developer claims, or trust individual brokers who may not have their interests at heart.

Group buying addresses each concern. Virtual site tours and RM-led inventory comparisons replace repeated flights. A group of verified buyers creates accountability — developers know they're dealing with serious, documented demand, not a single enquiry that may never convert.

Payment schedules can be structured for NRI banking workflows, and the cashback model ensures commission isn't silently embedded in the price. Vikram Mehta, based in New Jersey, closed a Greater Noida 3 BHK entirely remotely: "I had weekly updates, a clear comparison sheet, and a group discount I wouldn't have got calling the developer from the US alone."

If you're an NRI evaluating NCR or Yamuna Expressway projects, start by expressing interest on GroupBuying. Your RM will shortlist projects, connect you to an active group, and manage documentation so you can participate from anywhere.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=86",
    category: "NRI Corner",
    readTimeMin: 5,
    isPublished: true,
    createdAt: "2026-05-20T10:00:00.000Z",
    author: { id: "author-3", firstName: "Neha", lastName: "Kapoor" },
  },
  {
    id: "dummy-5",
    title: "Pre-Launch vs Ready-to-Move: Where Group Buying Saves More",
    slug: "pre-launch-vs-ready-to-move-group-buying",
    excerpt:
      "Pre-launch projects offer deeper group discounts, but ready-to-move units reduce wait time. Here's how to decide based on your timeline and risk appetite.",
    content: `Pre-launch inventory is where group buying often delivers the biggest percentage savings. Developers launching a new phase need early absorption — a group of five to seven buyers signing in the launch window can unlock launch-specific pricing, flexible payment plans, and waived premiums.

Ready-to-move (RTM) units trade some of that discount for immediate possession. Groups still negotiate — developers holding unsold RTM inventory in a tower may offer bulk clearance rates — but the margin is typically 3–5% rather than 8–12%.

Match your choice to your situation. Upgrading from a rented flat? RTM avoids double EMI-plus-rent. Investing for 5+ years? Pre-launch with a construction-linked plan maximises capital appreciation entry point.

Your GroupBuying RM can show active groups in both categories for your shortlisted projects. The key is joining early — pre-launch groups fill fast, and the best inventory blocks go to buyers who commit first.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=86",
    category: "Market Insights",
    readTimeMin: 6,
    isPublished: true,
    createdAt: "2026-05-12T10:00:00.000Z",
    author: { id: "author-2", firstName: "Arun", lastName: "Raghav" },
  },
  {
    id: "dummy-6",
    title: "Understanding Broker Cashback: The Hidden Saving Most Buyers Miss",
    slug: "understanding-broker-cashback-hidden-saving",
    excerpt:
      "Broker commission is built into most deals — usually 2–5% of the agreement value. GroupBuying returns it to buyers as documented cashback, not a verbal promise.",
    content: `When you buy through a traditional channel partner, the developer pays a commission — typically 2–5% of the agreement value. That cost is often baked into the price you pay, even if nobody mentions it explicitly.

GroupBuying's model passes this commission back to buyers as cashback. It's not a gimmick: the amount is documented in your offer letter and reflected at booking or registration, depending on the developer arrangement.

For a ₹1.5 crore apartment, 3% cashback means ₹4.5 lakh back in your pocket — on top of any group-negotiated price discount. Combined, buyers routinely see total savings of 8–15% versus walking into a developer's sales office alone.

Always ask for a written breakdown: base offer price, group discount, and cashback amount. GroupBuying provides this by default. If a broker tells you "this is the best price possible" without showing commission structure, you're likely leaving lakhs on the table.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=86",
    category: "Buyer's Guide",
    readTimeMin: 4,
    isPublished: true,
    createdAt: "2026-05-05T10:00:00.000Z",
    author: { id: "author-3", firstName: "Neha", lastName: "Kapoor" },
  },
  {
    id: "dummy-7",
    title: "5 Questions to Ask Before Joining a Buying Group",
    slug: "5-questions-before-joining-buying-group",
    excerpt: "Not every group is the right fit. Ask these questions before you commit your booking amount.",
    content: `Before you join a buying group, clarify inventory type, payment plan, and expected discount range with your RM.\n\nAsk how many buyers are confirmed, what happens if the group does not fill, and when offers are locked.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=86",
    category: "Buyer's Guide",
    readTimeMin: 4,
    isPublished: true,
    createdAt: "2026-04-28T10:00:00.000Z",
    author: { id: "author-1", firstName: "Priya", lastName: "Sharma" },
  },
  {
    id: "dummy-8",
    title: "Greater Noida vs Gurugram: Where Groups Save More in 2026",
    slug: "greater-noida-vs-gurugram-group-savings-2026",
    excerpt: "Corridor choice changes both entry price and group discount depth. Here is a practical comparison.",
    content: `Gurugram groups often unlock higher absolute savings on luxury inventory.\n\nGreater Noida and Yamuna Expressway groups can deliver stronger percentage discounts on mid-segment launches.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=86",
    category: "Market Insights",
    readTimeMin: 5,
    isPublished: true,
    createdAt: "2026-04-20T10:00:00.000Z",
    author: { id: "author-2", firstName: "Arun", lastName: "Raghav" },
  },
  {
    id: "dummy-9",
    title: "How Relationship Managers Guide Group Negotiations",
    slug: "how-rms-guide-group-negotiations",
    excerpt: "Your RM is not a broker — they structure comparisons, timelines, and offer documentation for the group.",
    content: `RMs shortlist inventory, align buyer preferences, and present a unified ask to the developer.\n\nThey also track cashback and payment milestones so each buyer closes with a clear written offer.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=86",
    category: "Success Stories",
    readTimeMin: 5,
    isPublished: true,
    createdAt: "2026-04-12T10:00:00.000Z",
    author: { id: "author-3", firstName: "Neha", lastName: "Kapoor" },
  },
  {
    id: "dummy-10",
    title: "Plot Buying in Groups: What Changes vs Apartments",
    slug: "plot-buying-in-groups-vs-apartments",
    excerpt: "Plot groups negotiate differently — focus on location premiums, registry timelines, and developer approvals.",
    content: `Plot inventory has fewer unit variants, so groups usually target contiguous plots or the same sector phase.\n\nNegotiate registry support, PLC waivers, and payment flexibility as a package.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=86",
    category: "Buyer's Guide",
    readTimeMin: 6,
    isPublished: true,
    createdAt: "2026-04-05T10:00:00.000Z",
    author: { id: "author-2", firstName: "Arun", lastName: "Raghav" },
  },
  {
    id: "dummy-11",
    title: "Documentation Checklist for Group Home Buyers",
    slug: "documentation-checklist-group-home-buyers",
    excerpt: "KYC, loan letters, and offer acceptance timelines keep groups on track during negotiation windows.",
    content: `Keep PAN, Aadhaar, address proof, and income documents ready before the group offer window opens.\n\nLoan pre-approval strengthens the group's seriousness with the developer.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=86",
    category: "Tips & Guides",
    readTimeMin: 4,
    isPublished: true,
    createdAt: "2026-03-28T10:00:00.000Z",
    author: { id: "author-1", firstName: "Priya", lastName: "Sharma" },
  },
  {
    id: "dummy-12",
    title: "When Not to Join a Group Buying Deal",
    slug: "when-not-to-join-group-buying-deal",
    excerpt: "If timelines, inventory, or risk appetite do not match, walking away is smarter than forced savings.",
    content: `Skip a group if the possession date does not fit your move-in plan, or if the inventory block is not what you want.\n\nSavings only matter when the home itself is right for you.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=86",
    category: "Tips & Guides",
    readTimeMin: 3,
    isPublished: true,
    createdAt: "2026-03-20T10:00:00.000Z",
    author: { id: "author-3", firstName: "Neha", lastName: "Kapoor" },
  },
  // Extra articles for pagination pages 2–3 (39 total ≈ 3 × PAGE_SIZE 13)
  {
    id: "dummy-13",
    title: "Sector 150 Noida: Why Groups Are Forming Early",
    slug: "sector-150-noida-groups-forming-early",
    excerpt: "Early group formation in Sector 150 is locking better floor preferences before inventory thins out.",
    content: "Sector 150 launches are attracting NRI and local buyers at the same time. Groups that form before the second inventory release often secure preferred stacks.",
    coverImageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=86",
    category: "Market Insights",
    readTimeMin: 4,
    isPublished: true,
    createdAt: "2026-03-18T10:00:00.000Z",
    author: { id: "author-2", firstName: "Arun", lastName: "Raghav" },
  },
  {
    id: "dummy-14",
    title: "How to Compare Two Towers in the Same Project",
    slug: "compare-two-towers-same-project",
    excerpt: "View, noise, floor rise, and parking can change the real cost of two units with the same carpet area.",
    content: "Same project does not mean same deal. Compare view corridors, lift density, and floor-rise premiums before you lock a group inventory block.",
    coverImageUrl: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=86",
    category: "Buyer's Guide",
    readTimeMin: 5,
    isPublished: true,
    createdAt: "2026-03-16T10:00:00.000Z",
    author: { id: "author-1", firstName: "Priya", lastName: "Sharma" },
  },
  {
    id: "dummy-15",
    title: "Possession Delays: What Group Buyers Should Ask",
    slug: "possession-delays-what-group-buyers-ask",
    excerpt: "A group deal is only strong if possession risk is discussed upfront — not after booking.",
    content: "Ask for RERA timelines, past delay history, and compensation clauses before the group commits.",
    coverImageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=86",
    category: "Tips & Guides",
    readTimeMin: 4,
    isPublished: true,
    createdAt: "2026-03-14T10:00:00.000Z",
    author: { id: "author-3", firstName: "Neha", lastName: "Kapoor" },
  },
  {
    id: "dummy-16",
    title: "NRI Power of Attorney Checklist for Indian Homes",
    slug: "nri-power-of-attorney-checklist",
    excerpt: "A clean PoA process keeps remote buyers in control without slowing registration.",
    content: "Use a specific PoA for property purchase, notarise abroad, stamp in India, and keep certified copies with your RM and lawyer.",
    coverImageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=86",
    category: "NRI Corner",
    readTimeMin: 6,
    isPublished: true,
    createdAt: "2026-03-12T10:00:00.000Z",
    author: { id: "author-2", firstName: "Arun", lastName: "Raghav" },
  },
  {
    id: "dummy-17",
    title: "Inside a 5-Buyer Group That Closed in 11 Days",
    slug: "five-buyer-group-closed-eleven-days",
    excerpt: "Speed came from pre-verified shortlists and a single negotiation window — not pressure tactics.",
    content: "Five families shortlisted the same 2 BHK inventory type and closed in eleven days with documented cashback.",
    coverImageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=86",
    category: "Success Stories",
    readTimeMin: 5,
    isPublished: true,
    createdAt: "2026-03-10T10:00:00.000Z",
    author: { id: "author-1", firstName: "Priya", lastName: "Sharma" },
  },
  {
    id: "dummy-18",
    title: "Floor Rise Premiums Explained Simply",
    slug: "floor-rise-premiums-explained",
    excerpt: "Higher floors cost more — but groups can sometimes negotiate a flat premium band.",
    content: "Floor rise is charged per floor above a base level. In group deals, developers sometimes cap the premium for a block of units.",
    coverImageUrl: "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1400&q=86",
    category: "Buyer's Guide",
    readTimeMin: 3,
    isPublished: true,
    createdAt: "2026-03-08T10:00:00.000Z",
    author: { id: "author-3", firstName: "Neha", lastName: "Kapoor" },
  },
  {
    id: "dummy-19",
    title: "Greater Noida West vs Noida Extension for First Homes",
    slug: "greater-noida-west-vs-noida-extension",
    excerpt: "Budget, commute, and possession readiness decide which corridor fits a first-time buyer group.",
    content: "Greater Noida West often wins on ticket size. Noida Extension can win on connectivity depending on your office belt.",
    coverImageUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1400&q=86",
    category: "Market Insights",
    readTimeMin: 5,
    isPublished: true,
    createdAt: "2026-03-06T10:00:00.000Z",
    author: { id: "author-2", firstName: "Arun", lastName: "Raghav" },
  },
  {
    id: "dummy-20",
    title: "Questions to Ask Before Paying a Booking Amount",
    slug: "questions-before-paying-booking-amount",
    excerpt: "A short checklist that protects your token money in both individual and group purchases.",
    content: "Confirm inventory allotment language, refund timelines, payment schedule, and cashback documentation before you pay.",
    coverImageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=86",
    category: "Tips & Guides",
    readTimeMin: 4,
    isPublished: true,
    createdAt: "2026-03-04T10:00:00.000Z",
    author: { id: "author-1", firstName: "Priya", lastName: "Sharma" },
  },
  {
    id: "dummy-21",
    title: "How Couples Align Budgets Inside a Buying Group",
    slug: "couples-align-budgets-buying-group",
    excerpt: "Shared EMI comfort and down-payment clarity keep group commitments from breaking mid-deal.",
    content: "Agree on max EMI, down payment, and must-have amenities before joining a group.",
    coverImageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=86",
    category: "Buyer's Guide",
    readTimeMin: 4,
    isPublished: true,
    createdAt: "2026-03-02T10:00:00.000Z",
    author: { id: "author-3", firstName: "Neha", lastName: "Kapoor" },
  },
  {
    id: "dummy-22",
    title: "Dubai NRIs Buying in Gurugram: A Practical Path",
    slug: "dubai-nris-buying-gurugram",
    excerpt: "Time-zone friendly RMs, video inventories, and escrow-style payment clarity make remote buying workable.",
    content: "Dubai-based buyers often need evening India calls and clear fund-transfer steps.",
    coverImageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=86",
    category: "NRI Corner",
    readTimeMin: 6,
    isPublished: true,
    createdAt: "2026-02-28T10:00:00.000Z",
    author: { id: "author-2", firstName: "Arun", lastName: "Raghav" },
  },
  {
    id: "dummy-23",
    title: "Clubhouse and Amenities: What Actually Adds Value",
    slug: "clubhouse-amenities-what-adds-value",
    excerpt: "Not every amenity increases resale — focus on maintenance cost versus daily use.",
    content: "Prioritise parking, security, power backup, and usable green space when your group compares projects.",
    coverImageUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=86",
    category: "Tips & Guides",
    readTimeMin: 3,
    isPublished: true,
    createdAt: "2026-02-26T10:00:00.000Z",
    author: { id: "author-1", firstName: "Priya", lastName: "Sharma" },
  },
  {
    id: "dummy-24",
    title: "Why Developers Prefer Verified Buyer Groups",
    slug: "developers-prefer-verified-buyer-groups",
    excerpt: "Pre-KYC buyers reduce drop-offs — which is why verified groups unlock better terms.",
    content: "Developers discount when conversion risk is low. Groups with completed KYC close faster.",
    coverImageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=86",
    category: "Market Insights",
    readTimeMin: 4,
    isPublished: true,
    createdAt: "2026-02-24T10:00:00.000Z",
    author: { id: "author-2", firstName: "Arun", lastName: "Raghav" },
  },
  {
    id: "dummy-25",
    title: "A First-Time Buyer’s Week-by-Week Group Buying Plan",
    slug: "first-time-buyer-week-by-week-plan",
    excerpt: "From shortlist to booking — a simple four-week plan that keeps momentum without rushing.",
    content: "Week 1: shortlist. Week 2: site visits. Week 3: join a group. Week 4: negotiate and book.",
    coverImageUrl: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=1400&q=86",
    category: "Buyer's Guide",
    readTimeMin: 5,
    isPublished: true,
    createdAt: "2026-02-22T10:00:00.000Z",
    author: { id: "author-3", firstName: "Neha", lastName: "Kapoor" },
  },
  {
    id: "dummy-26",
    title: "Resale vs New Launch Inside a Group Deal",
    slug: "resale-vs-new-launch-group-deal",
    excerpt: "Groups usually win hardest on new launches — resale deals need a different playbook.",
    content: "Use groups for under-construction inventory; treat resale as one-to-one negotiation.",
    coverImageUrl: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1400&q=86",
    category: "Market Insights",
    readTimeMin: 4,
    isPublished: true,
    createdAt: "2026-02-20T10:00:00.000Z",
    author: { id: "author-1", firstName: "Priya", lastName: "Sharma" },
  },
  {
    id: "dummy-27",
    title: "How We Document Cashback So It Actually Lands",
    slug: "document-cashback-so-it-lands",
    excerpt: "Cashback that is not written into the booking path is a promise, not a saving.",
    content: "Ask whether cashback is adjusted in the demand letter, paid after registration, or credited against milestones.",
    coverImageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=86",
    category: "Tips & Guides",
    readTimeMin: 3,
    isPublished: true,
    createdAt: "2026-02-18T10:00:00.000Z",
    author: { id: "author-2", firstName: "Arun", lastName: "Raghav" },
  },
  {
    id: "dummy-28",
    title: "Pune IT Corridor Groups: What Changed in 2026",
    slug: "pune-it-corridor-groups-2026",
    excerpt: "Hinjawadi and Kharadi buyers are forming smaller, faster groups around ready inventory.",
    content: "Pune groups in 2026 are tighter — often four to five buyers — and focused on near-ready stock.",
    coverImageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=86",
    category: "Market Insights",
    readTimeMin: 4,
    isPublished: true,
    createdAt: "2026-02-16T10:00:00.000Z",
    author: { id: "author-3", firstName: "Neha", lastName: "Kapoor" },
  },
  {
    id: "dummy-29",
    title: "Site Visit Checklist for Group Members",
    slug: "site-visit-checklist-group-members",
    excerpt: "One shared checklist keeps every member evaluating the same things on visit day.",
    content: "Check approach roads, sample flat quality, construction progress, and parking allotment.",
    coverImageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=86",
    category: "Buyer's Guide",
    readTimeMin: 3,
    isPublished: true,
    createdAt: "2026-02-14T10:00:00.000Z",
    author: { id: "author-1", firstName: "Priya", lastName: "Sharma" },
  },
  {
    id: "dummy-30",
    title: "Singapore NRIs: Remitting Funds for an Indian Booking",
    slug: "singapore-nris-remitting-funds-india",
    excerpt: "Plan remittance timing around booking milestones so the group seat is not lost to banking delays.",
    content: "Coordinate with your bank early and confirm the Indian account path with your RM before the booking window opens.",
    coverImageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=86",
    category: "NRI Corner",
    readTimeMin: 5,
    isPublished: true,
    createdAt: "2026-02-12T10:00:00.000Z",
    author: { id: "author-2", firstName: "Arun", lastName: "Raghav" },
  },
  {
    id: "dummy-31",
    title: "The Family That Waited for the Right Inventory Block",
    slug: "family-waited-right-inventory-block",
    excerpt: "Skipping the first discount window helped them land a better stack two weeks later.",
    content: "This family stayed on the waitlist, joined a second group for a preferred tower, and still saved more than their first quote.",
    coverImageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=86",
    category: "Success Stories",
    readTimeMin: 4,
    isPublished: true,
    createdAt: "2026-02-10T10:00:00.000Z",
    author: { id: "author-1", firstName: "Priya", lastName: "Sharma" },
  },
  {
    id: "dummy-32",
    title: "PLC Charges: Preferential Location Without the Confusion",
    slug: "plc-charges-explained",
    excerpt: "Park, road, and corner PLCs can quietly inflate your all-in price — ask for them itemised.",
    content: "Preferential location charges should appear as separate line items. Groups can sometimes negotiate a PLC waiver.",
    coverImageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=86",
    category: "Buyer's Guide",
    readTimeMin: 3,
    isPublished: true,
    createdAt: "2026-02-08T10:00:00.000Z",
    author: { id: "author-3", firstName: "Neha", lastName: "Kapoor" },
  },
  {
    id: "dummy-33",
    title: "How RMs Keep Multi-City Groups Organised",
    slug: "rms-keep-multi-city-groups-organised",
    excerpt: "Shared trackers, evening stand-ups, and one negotiation owner prevent chaos across time zones.",
    content: "A single RM-owned tracker for inventory, docs, and payment status keeps the group decision window intact.",
    coverImageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=86",
    category: "Tips & Guides",
    readTimeMin: 4,
    isPublished: true,
    createdAt: "2026-02-06T10:00:00.000Z",
    author: { id: "author-2", firstName: "Arun", lastName: "Raghav" },
  },
  {
    id: "dummy-34",
    title: "Ready-to-Move Groups vs Under-Construction Groups",
    slug: "ready-to-move-vs-under-construction-groups",
    excerpt: "Different risk, different leverage — pick the group type that matches your move-in date.",
    content: "Ready-to-move groups negotiate on vacant stock. Under-construction groups negotiate on volume and payment plans.",
    coverImageUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=86",
    category: "Market Insights",
    readTimeMin: 4,
    isPublished: true,
    createdAt: "2026-02-04T10:00:00.000Z",
    author: { id: "author-1", firstName: "Priya", lastName: "Sharma" },
  },
  {
    id: "dummy-35",
    title: "What Soft Booking Really Means in a Group Deal",
    slug: "what-soft-booking-means-group-deal",
    excerpt: "Soft booking holds inventory briefly — it is not a substitute for a signed allotment.",
    content: "Treat soft booking as a short hold while paperwork finishes. Confirm how long the hold lasts.",
    coverImageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=86",
    category: "Tips & Guides",
    readTimeMin: 3,
    isPublished: true,
    createdAt: "2026-02-02T10:00:00.000Z",
    author: { id: "author-3", firstName: "Neha", lastName: "Kapoor" },
  },
  {
    id: "dummy-36",
    title: "Bengaluru Suburban Launches: Group Timing Tips",
    slug: "bengaluru-suburban-launches-group-timing",
    excerpt: "East and north corridor launches reward groups that arrive with pre-approved financing.",
    content: "Get in-principle sanction letters ready before the group negotiation call.",
    coverImageUrl: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=86",
    category: "Market Insights",
    readTimeMin: 4,
    isPublished: true,
    createdAt: "2026-01-30T10:00:00.000Z",
    author: { id: "author-2", firstName: "Arun", lastName: "Raghav" },
  },
  {
    id: "dummy-37",
    title: "How to Exit a Group Without Burning Bridges",
    slug: "exit-group-without-burning-bridges",
    excerpt: "Life happens — exit early, in writing, so the remaining members can refill the seat.",
    content: "Tell the RM as soon as your timeline or budget changes. Early exits are easier to replace.",
    coverImageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=86",
    category: "Buyer's Guide",
    readTimeMin: 3,
    isPublished: true,
    createdAt: "2026-01-28T10:00:00.000Z",
    author: { id: "author-1", firstName: "Priya", lastName: "Sharma" },
  },
  {
    id: "dummy-38",
    title: "UK NRIs: Visiting India Once for Registration",
    slug: "uk-nris-one-trip-registration",
    excerpt: "Batch KYC, PoA, and registration into one trip when your group is close to allotment.",
    content: "Plan the India trip only after inventory and payment schedule are locked.",
    coverImageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=86",
    category: "NRI Corner",
    readTimeMin: 5,
    isPublished: true,
    createdAt: "2026-01-26T10:00:00.000Z",
    author: { id: "author-3", firstName: "Neha", lastName: "Kapoor" },
  },
  {
    id: "dummy-39",
    title: "Reading Demand Letters Like a Pro",
    slug: "reading-demand-letters-like-a-pro",
    excerpt: "Milestone language, taxes, and adjustments hide in plain sight — read every line before you pay.",
    content: "Check due dates, GST treatment, and whether cashback or waivers appear as adjustments.",
    coverImageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=86",
    category: "Tips & Guides",
    readTimeMin: 4,
    isPublished: true,
    createdAt: "2026-01-24T10:00:00.000Z",
    author: { id: "author-2", firstName: "Arun", lastName: "Raghav" },
  },
];

export function getDummyArticleBySlug(slug: string): Article | null {
  return dummyArticles.find((article) => article.slug === slug) ?? null;
}

export function getDummyArticlesPage(
  page = 1,
  options?: { search?: string; category?: string }
) {
  const safePage = Math.max(1, page);
  const { limit, skip } = getListingPageParams(safePage);
  const q = options?.search?.trim().toLowerCase() || "";
  const category = options?.category?.trim() || "";

  const filtered = dummyArticles.filter((article) => {
    if (category && article.category !== category) return false;
    if (!q) return true;
    const haystack = [
      article.title,
      article.excerpt || "",
      article.content || "",
      article.slug,
      article.category,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  const total = filtered.length;
  return {
    articles: filtered.slice(skip, skip + limit),
    meta: buildListingPaginationMeta(total, safePage),
  };
}

export function getDummySimilarArticles(slug: string, limit = 3) {
  const current = getDummyArticleBySlug(slug);
  if (!current) return [];
  const sameCategory = dummyArticles.filter(
    (article) => article.slug !== slug && article.category === current.category
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  const others = dummyArticles.filter(
    (article) => article.slug !== slug && !sameCategory.some((item) => item.id === article.id)
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export const dummyCommentsBySlug: Record<
  string,
  Array<{
    id: string;
    content: string;
    guestName?: string | null;
    articleId: string;
    createdAt: string;
    author?: { id: string; firstName: string; lastName: string } | null;
  }>
> = {
  "group-buying-saved-family-one-crore-gurugram": [
    {
      id: "c1",
      content: "This matches our experience in Sector 79. Group negotiation really works when everyone is serious.",
      guestName: "Rajat Garg",
      articleId: "dummy-1",
      createdAt: "2026-06-16T08:00:00.000Z",
    },
    {
      id: "c2",
      content: "Would love a follow-up on how payment plans were structured for the group.",
      author: { id: "u1", firstName: "Riya", lastName: "Kapoor" },
      articleId: "dummy-1",
      createdAt: "2026-06-17T11:30:00.000Z",
    },
  ],
  "group-buying-revolution-indian-real-estate": [
    {
      id: "c3",
      content: "Clear explanation of why developers prefer bulk intent. Bookmarking this for my NRI clients.",
      guestName: "Vikram Mehta",
      articleId: "dummy-2",
      createdAt: "2026-06-09T09:15:00.000Z",
    },
  ],
};
