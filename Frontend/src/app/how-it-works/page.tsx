import { ArrowRight, ClipboardCheck, HandCoins, Home, Search, ShieldCheck, Users } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { Section } from "@/components/section";
import { StepTimeline } from "@/components/step-timeline";
import { steps } from "@/lib/content";

export default function HowItWorksPage() {
  const highlights = [
    { icon: Search, title: "Search smarter", text: "Filter by city, locality, budget and property type." },
    { icon: Users, title: "Join serious buyers", text: "Group with verified buyers interested in the same project." },
    { icon: HandCoins, title: "Unlock better offers", text: "Negotiate developer-direct discounts and cashback." },
    { icon: Home, title: "Close confidently", text: "Finalize your individual home purchase with expert support." },
  ];

  return (
    <main>
      <section className="mesh-bg relative overflow-hidden py-16 md:py-24">
        <div className="container-shell text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#e34b32] shadow-sm"><ClipboardCheck size={15} /> Simple Process</p>
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-black leading-tight text-[#111111] md:text-6xl">Follow a clear path from shortlist to savings.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">GroupBuying keeps the process transparent, structured and buyer-first from first project search to final booking.</p>
        </div>
      </section>

      <Section eyebrow="Step by step" title="How GroupBuying works">
        <StepTimeline steps={steps} />
      </Section>

      <Section className="bg-[#fff6f2]" eyebrow="Buyer journey" title="Everything stays organized and professional">
        <div className="grid gap-5 md:grid-cols-4">
          {highlights.map(({ icon: Icon, title, text }) => (
            <div key={title} className="hover-lift rounded-[1.75rem] bg-white p-6 premium-border">
              <Icon className="mb-4 text-[#e34b32]" size={30} />
              <h2 className="font-display text-xl font-black text-[#111111]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/properties">Start exploring <ArrowRight size={18} /></ButtonLink>
        </div>
      </Section>

      <Section className="aurora-bg text-white" eyebrow="Trust layer" title="Every buyer gets clarity before commitment">
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
          {["Project comparison", "Inventory guidance", "Documented savings"].map((item) => (
            <div key={item} className="rounded-3xl border border-white/15 bg-white/12 p-6 text-center backdrop-blur">
              <ShieldCheck className="mx-auto mb-3 text-[#f3b64a]" />
              <p className="font-display text-xl font-black">{item}</p>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
