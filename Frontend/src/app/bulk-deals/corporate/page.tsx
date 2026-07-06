import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Handshake,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Users,
} from "lucide-react";
import { ButtonLink } from "@/components/button";
import { Section } from "@/components/section";

const benefits = [
  {
    icon: TrendingDown,
    title: "Volume pricing",
    text: "Negotiate developer-direct discounts when multiple employees buy across one or more projects.",
  },
  {
    icon: Users,
    title: "Dedicated RM",
    text: "A relationship manager coordinates site visits, inventory updates and group formation for your team.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent process",
    text: "Documented savings, clear timelines and buyer-first support from shortlist to registration.",
  },
  {
    icon: Handshake,
    title: "HR-friendly rollout",
    text: "We help you communicate benefits, onboard interested employees and track interest centrally.",
  },
];

const steps = [
  "Share company size, preferred cities and budget bands",
  "We shortlist verified projects with bulk-buyer potential",
  "Employees join buying groups with negotiated pricing",
  "Close individually with expert support till possession",
];

export default function CorporatePage() {
  return (
    <main>
      <section className="hero-premium-bg relative overflow-hidden py-16 md:py-24">
        <div className="glow-blob green left-10 top-20" />
        <div className="glow-blob gold bottom-16 right-16" />
        <div className="container-shell grid items-center gap-10 lg:grid-cols-[1fr_.9fr]">
          <div className="reveal-up">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#e34b32] shadow-sm">
              <Building2 size={15} /> Corporate Bulk Deals
            </p>
            <h1 className="font-display text-5xl font-black leading-tight text-[#111111] md:text-6xl">
              Smarter home buying for your workforce.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Give employees access to group buying power on premium residential inventory — with structured
              support, better pricing and a professional experience your HR team can stand behind.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/contact">
                Request corporate demo <ArrowRight size={18} />
              </ButtonLink>
              <ButtonLink href="/properties" variant="secondary">
                View inventory
              </ButtonLink>
            </div>
          </div>
          <div className="animated-border rounded-[2.4rem] p-1">
            <div className="relative overflow-hidden rounded-[2.2rem] bg-[#111111] p-8 text-white">
              <div className="absolute inset-0 bg-gradient-to-br from-[#111111] via-[#e34b32]/60 to-[#f3b64a]/30" />
              <div className="relative grid gap-4">
                {["10–500+ employees", "Multi-city inventory", "Developer-direct rates", "End-to-end RM support"].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
                      <BadgeCheck className="shrink-0 text-[#f3b64a]" size={22} />
                      <p className="font-display text-lg font-black">{item}</p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section eyebrow="Why corporates choose us" title="A structured program, not ad-hoc referrals">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="hover-lift rounded-[1.75rem] bg-white p-6 premium-border">
              <Icon className="mb-4 text-[#e34b32]" size={30} />
              <h2 className="font-display text-xl font-black text-[#111111]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-[#fff6f2]" eyebrow="How it works" title="From HR outreach to employee bookings">
        <div className="mx-auto grid max-w-4xl gap-4">
          {steps.map((step, index) => (
            <div key={step} className="flex items-start gap-4 rounded-[1.75rem] bg-white p-5 premium-border">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e34b32] font-display text-lg font-black text-white">
                {index + 1}
              </span>
              <p className="pt-2 text-sm font-semibold leading-7 text-slate-700 md:text-base">{step}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/contact">
            Partner with us <ArrowRight size={18} />
          </ButtonLink>
        </div>
      </Section>

      <Section className="aurora-bg text-white" eyebrow="Trusted approach" title="Built for enterprise-grade expectations">
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
          {["Verified projects only", "Clear savings documentation", "Buyer-first negotiation"].map((item) => (
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
