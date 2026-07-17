import type { Developer, HeroSlide, ShowcaseVideo, YoutubeChannelConfig } from "@/lib/api";

export const fallbackHeroSlides: HeroSlide[] = [
  {
    id: "hero-1",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=86",
    caption: "Luxury apartments in Gurugram",
    tagLabel: "We've saved",
    tagAmount: "₹25Cr+",
    tagSubtext: "for 150+ families",
  },
  {
    id: "hero-2",
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=86",
    caption: "Premium NCR residences",
    tagLabel: "Group savings",
    tagAmount: "10-15%",
    tagSubtext: "extra discount unlocked",
  },
  {
    id: "hero-3",
    imageUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=86",
    caption: "Plots & villas in Greater Noida",
    tagLabel: "Cashback",
    tagAmount: "3-10%",
    tagSubtext: "broker commission returned",
  },
];

export const fallbackDevelopers: Developer[] = [
  {
    id: "godrej",
    companyName: "Godrej Properties",
    logoUrl: "/developers/logos/godrej.svg",
    bannerImageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    headquartersCity: "Mumbai",
    description: "India's leading developer with premium residential and commercial projects across NCR.",
    websiteUrl: "https://www.godrejproperties.com",
    partnershipStatus: "ACTIVE",
    _count: { properties: 12 },
  },
  {
    id: "dlf",
    companyName: "DLF",
    logoUrl: "/developers/logos/dlf.svg",
    bannerImageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    headquartersCity: "Gurugram",
    description: "Pioneer of integrated townships and luxury high-rises in the NCR corridor.",
    websiteUrl: "https://www.dlf.in",
    partnershipStatus: "ACTIVE",
    _count: { properties: 18 },
  },
  {
    id: "m3m",
    companyName: "M3M India",
    logoUrl: "/developers/logos/m3m.svg",
    bannerImageUrl: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80",
    headquartersCity: "Gurugram",
    description: "Known for ultra-luxury residential towers and golf course communities.",
    websiteUrl: "https://www.m3mindia.com",
    partnershipStatus: "ACTIVE",
    _count: { properties: 9 },
  },
  {
    id: "emaar",
    companyName: "Emaar India",
    logoUrl: "/developers/logos/emaar.svg",
    bannerImageUrl: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
    headquartersCity: "Gurugram",
    description: "Global developer bringing world-class design to Indian real estate.",
    websiteUrl: "https://www.emaar.com",
    partnershipStatus: "ACTIVE",
    _count: { properties: 7 },
  },
  {
    id: "signature",
    companyName: "Signature Global",
    logoUrl: "/developers/logos/signature-global.svg",
    bannerImageUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    headquartersCity: "Gurugram",
    description: "Affordable and mid-segment housing specialist across Delhi-NCR.",
    websiteUrl: "https://www.signatureglobal.in",
    partnershipStatus: "ACTIVE",
    _count: { properties: 14 },
  },
  {
    id: "sobha",
    companyName: "Sobha",
    logoUrl: "/developers/logos/sobha.svg",
    bannerImageUrl: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
    headquartersCity: "Bengaluru",
    description: "Backward-integrated developer known for quality construction and timely delivery.",
    websiteUrl: "https://www.sobha.com",
    partnershipStatus: "ACTIVE",
    _count: { properties: 6 },
  },
  {
    id: "mahagun",
    companyName: "Mahagun",
    logoUrl: "/developers/logos/mahagun.svg",
    bannerImageUrl: "https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1200&q=80",
    headquartersCity: "Noida",
    description: "Trusted NCR developer with strong presence in Noida and Greater Noida.",
    websiteUrl: "https://www.mahagunindia.com",
    partnershipStatus: "ACTIVE",
    _count: { properties: 11 },
  },
  {
    id: "adani",
    companyName: "Adani Realty",
    logoUrl: "/developers/logos/adani.svg",
    bannerImageUrl: "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1200&q=80",
    headquartersCity: "Ahmedabad",
    description: "Premium residential projects with modern amenities and smart living features.",
    websiteUrl: "https://www.adanirealty.com",
    partnershipStatus: "ACTIVE",
    _count: { properties: 8 },
  },
  {
    id: "birla",
    companyName: "Birla Estate",
    logoUrl: "/developers/logos/birla.svg",
    bannerImageUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    headquartersCity: "Mumbai",
    description: "Trusted legacy brand delivering thoughtfully designed homes across major cities.",
    websiteUrl: "https://www.birlaestates.com",
    partnershipStatus: "ACTIVE",
    _count: { properties: 10 },
  },
  {
    id: "lodha",
    companyName: "Lodha Group",
    logoUrl: "/developers/logos/lodha.svg",
    bannerImageUrl: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=80",
    headquartersCity: "Mumbai",
    description: "India's largest real estate developer by sales with iconic luxury towers.",
    websiteUrl: "https://www.lodhagroup.com",
    partnershipStatus: "ACTIVE",
    _count: { properties: 15 },
  },
  {
    id: "prestige",
    companyName: "Prestige Group",
    logoUrl: "/developers/logos/prestige.svg",
    bannerImageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    headquartersCity: "Bengaluru",
    description: "South India's most trusted developer with premium residential and commercial assets.",
    websiteUrl: "https://www.prestigeconstructions.com",
    partnershipStatus: "ACTIVE",
    _count: { properties: 13 },
  },
  {
    id: "bptp",
    companyName: "BPTP",
    logoUrl: "/developers/logos/bptp.svg",
    bannerImageUrl: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
    headquartersCity: "Faridabad",
    description: "NCR-focused developer with townships across Gurugram, Faridabad and Noida.",
    websiteUrl: "https://www.bptp.com",
    partnershipStatus: "ACTIVE",
    _count: { properties: 9 },
  },
  {
    id: "eldeco",
    companyName: "Eldeco Group",
    logoUrl: "/developers/logos/eldeco.svg",
    bannerImageUrl: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80",
    headquartersCity: "Noida",
    description: "Four decades of experience in plotted developments and group housing across NCR.",
    websiteUrl: "https://www.eldecogroup.com",
    partnershipStatus: "ACTIVE",
    _count: { properties: 11 },
  },
  {
    id: "ats",
    companyName: "ATS Infrastructure",
    logoUrl: "/developers/logos/ats.svg",
    bannerImageUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    headquartersCity: "Noida",
    description: "Premium residential developer known for high-quality construction in Noida and Greater Noida.",
    websiteUrl: "https://www.atsgreens.com",
    partnershipStatus: "ACTIVE",
    _count: { properties: 8 },
  },
  {
    id: "gaursons",
    companyName: "Gaursons",
    logoUrl: "/developers/logos/gaursons.svg",
    bannerImageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    headquartersCity: "Greater Noida",
    description: "Leading Greater Noida developer with townships, high-rises and commercial projects.",
    websiteUrl: "https://www.gaursons.com",
    partnershipStatus: "ACTIVE",
    _count: { properties: 12 },
  },
  {
    id: "puravankara",
    companyName: "Puravankara",
    logoUrl: "/developers/logos/puravankara.svg",
    bannerImageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    headquartersCity: "Bengaluru",
    description: "Pan-India developer with premium and mid-segment homes across major metros.",
    websiteUrl: "https://www.puravankara.com",
    partnershipStatus: "ACTIVE",
    _count: { properties: 7 },
  },
];

export const fallbackShowcaseVideos: ShowcaseVideo[] = [
  {
    id: "video-1",
    title: "Luxury Project Walkthrough — Greater Noida",
    subtitle: "Premium 3 & 4 BHK inventory with group buying benefits",
    videoUrl: "https://www.youtube.com/watch?v=8rEyWz0Ss0Y",
    posterUrl: "https://img.youtube.com/vi/8rEyWz0Ss0Y/hqdefault.jpg",
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "video-2",
    title: "Yamuna Expressway Plot Investment Guide",
    subtitle: "Why NRI buyers are choosing this growth corridor",
    videoUrl: "https://www.youtube.com/watch?v=E8gmARGvPlI",
    posterUrl: "https://img.youtube.com/vi/E8gmARGvPlI/hqdefault.jpg",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "video-3",
    title: "Group Buying Success Story — Saved ₹42L",
    subtitle: "Real buyer testimonial from Gurugram",
    videoUrl: "https://www.youtube.com/watch?v=x0fSBAg02dw",
    posterUrl: "https://img.youtube.com/vi/x0fSBAg02dw/hqdefault.jpg",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "video-4",
    title: "Pre-Launch Project Comparison — NCR 2026",
    subtitle: "Side-by-side review of top developer projects",
    videoUrl: "https://www.youtube.com/watch?v=R1Qq3H6ZzVU",
    posterUrl: "https://img.youtube.com/vi/R1Qq3H6ZzVU/hqdefault.jpg",
    sortOrder: 3,
    isActive: true,
  },
];

export const fallbackYoutubeChannel: YoutubeChannelConfig = {
  id: "default",
  channelName: "GroupBuying Official",
  channelUrl: "https://www.youtube.com/@GroupBuying",
  metadataText: "823K views · Updated weekly",
};

export type HeroToolCardMock = {
  title: string;
  text: string;
  badge: string;
  metric: string;
  subMetric?: string;
};

export const heroToolCardMocks: HeroToolCardMock[] = [
  {
    title: "Saving Intelligence",
    text: "Group discounts, cashback and negotiated quotes in one view.",
    badge: "Insights",
    metric: "10-15%",
    subMetric: "avg extra saving",
  },
  {
    title: "Saving Calculator",
    text: "On a ₹1.2Cr property, group buyers save ₹12-18L extra.",
    badge: "Estimate",
    metric: "₹15L",
    subMetric: "potential savings",
  },
  {
    title: "EMI Calculator",
    text: "Plan monthly EMIs before your site visit — no surprises.",
    badge: "Finance",
    metric: "₹85K",
    subMetric: "per month est.",
  },
];

export type TestimonialMock = {
  name: string;
  role: string;
  text: string;
  saved: string;
};

export const testimonialMocks: TestimonialMock[] = [
  {
    name: "Rajat Garg",
    role: "Home Buyer, Gurugram",
    text: "The team helped us compare inventory and negotiate like a serious buying group. We saved significantly on our 3 BHK in Sector 76.",
    saved: "Saved ₹1Cr+",
  },
  {
    name: "Arun Raghav",
    role: "Investor, Noida",
    text: "Clear guidance, real numbers and a better final offer than our individual quote. The cashback made the deal completely transparent.",
    saved: "Saved ₹42L",
  },
  {
    name: "Riya Kapoor",
    role: "First-time Buyer, Greater Noida",
    text: "The cashback structure made the deal transparent and surprisingly simple. RM support was excellent from shortlist to booking.",
    saved: "Saved ₹87L",
  },
  {
    name: "Vikram Mehta",
    role: "NRI Buyer, USA",
    text: "Managed everything remotely — virtual tours, group negotiation and documentation. Felt fully supported from 8,000 miles away.",
    saved: "Saved ₹65L",
  },
  {
    name: "Priya Sharma",
    role: "Family Buyer, Noida Extension",
    text: "Joined a group of 5 buyers and unlocked a price we could not get alone. Highly recommend for serious home buyers.",
    saved: "Saved ₹28L",
  },
  {
    name: "Amit Joshi",
    role: "Plot Investor, Yamuna Expressway",
    text: "Compared multiple plot projects with data-backed advice. The group discount on our Yamuna Expressway plot was outstanding.",
    saved: "Saved ₹15L",
  },
];
