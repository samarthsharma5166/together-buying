import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Gem,
  Landmark,
  LineChart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ButtonLink } from "@/components/button";
import { Section } from "@/components/section";

const offerings = [
  {
    icon: Gem,
    title: "Curated premium inventory",
    text: "Access developer-direct projects suited for portfolio allocation, legacy planning and long-term appreciation.",
  },
  {
    icon: LineChart,
    title: "Portfolio-level negotiation",
    text: "Combine purchasing power across family members or entities to unlock better pricing and flexible payment terms.",
  },
  {
    icon: BarChart3,
    title: "Data-backed shortlisting",
    text: "Compare micro-markets, builder track records and inventory depth before committing capital.",
  },
  {
    icon: ShieldCheck,
    title: "Discreet, white-glove support",
    text: "Dedicated advisors manage site visits, documentation and closure with confidentiality and precision.",
  },
];

const focusAreas = [
  "Luxury apartments & villas in NCR and top metros",
  "Pre-launch and under-construction inventory with bulk potential",
  "Multi-unit acquisitions for family members or trusts",
  "Structured comparison before capital deployment",
];

export default function FamilyOfficesPage() {
  return (
    <main>
      <section className="mesh-bg relative overflow-hidden py-16 md:py-24">
        <div className="container-shell grid items-center gap-10 lg:grid-cols-[1fr_.9fr]">
          <div className="reveal-up">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#e34b32] shadow-sm">
              <Landmark size={15} /> Family Offices
            </p>
            <h1 className="font-display text-5xl font-black leading-tight text-[#111111] md:text-6xl">
              Institutional-grade real estate access for families.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              GroupBuying helps family offices and HNI buyers deploy capital into residential real estate with
              stronger negotiation leverage, curated inventory and a process designed for discretion.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/contact">
                Schedule a private briefing <ArrowRight size={18} />
              </ButtonLink>
              <ButtonLink href="/properties" variant="secondary">
                Explore projects
              </ButtonLink>
            </div>
          </div>
          <div className="animated-border rounded-[2.4rem] p-1">
            <div className="relative overflow-hidden rounded-[2.2rem] bg-[#111111] p-8 text-white">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=88')] bg-cover bg-center opacity-35" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#111111]/90 via-[#111111]/70 to-[#e34b32]/40" />
              <div className="relative">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-orange-200">Typical mandate</p>
                <p className="font-display text-3xl font-black leading-tight">₹5Cr – ₹50Cr+</p>
                <p className="mt-2 text-sm text-orange-100">Across one or multiple premium residential assets</p>
                <div className="mt-6 grid gap-3">
                  {["Confidential deal flow", "Builder-direct terms", "Multi-unit flexibility"].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                      <BadgeCheck className="text-[#f3b64a]" size={18} />
                      <span className="text-sm font-bold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section eyebrow="What we deliver" title="Beyond a broker — a buying desk for families">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {offerings.map(({ icon: Icon, title, text }) => (
            <div key={title} className="magnetic-card hover-lift rounded-[2rem] bg-white p-7 premium-border">
              <Icon className="mb-4 text-[#e34b32]" size={30} />
              <h2 className="font-display text-xl font-black text-[#111111]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-[#fff6f2]" eyebrow="Focus areas" title="Where family offices find the most value">
        <div className="mx-auto grid max-w-4xl gap-4">
          {focusAreas.map((area) => (
            <div key={area} className="flex items-center gap-4 rounded-[1.75rem] bg-white p-5 premium-border">
              <span className="flex h-3 w-3 shrink-0 rounded-full bg-[#e34b32]" />
              <p className="text-sm font-semibold leading-7 text-slate-700 md:text-base">{area}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/contact">
            Speak with our team <ArrowRight size={18} />
          </ButtonLink>
        </div>
      </Section>

      <Section className="property-detail-bg text-white" eyebrow="Private access" title="Discretion built into every step">
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
          {["No public group exposure", "Direct RM channel", "Documented deal terms"].map((item) => (
            <div key={item} className="rounded-3xl border border-white/15 bg-white/12 p-6 text-center backdrop-blur">
              <Sparkles className="mx-auto mb-3 text-[#f3b64a]" />
              <p className="font-display text-xl font-black">{item}</p>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
