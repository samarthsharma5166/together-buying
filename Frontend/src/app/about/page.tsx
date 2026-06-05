import { ArrowRight, BadgeCheck, Building2, Handshake, ShieldCheck, Sparkles, Users } from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import { ButtonLink } from "@/components/button";
import { Section } from "@/components/section";
import { stats, valueCards } from "@/lib/content";

export default function AboutPage() {
  return (
    <main>
      <section className="hero-premium-bg relative overflow-hidden py-16 md:py-24">
        <div className="glow-blob green left-10 top-20" />
        <div className="glow-blob gold bottom-16 right-16" />
        <div className="container-shell grid items-center gap-10 lg:grid-cols-[1fr_.85fr]">
          <div className="reveal-up">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#e34b32] shadow-sm"><Sparkles size={15} /> About GroupBuying</p>
            <h1 className="font-display text-5xl font-black leading-tight text-[#111111] md:text-6xl">Making premium homes smarter to buy together.</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">GroupBuying brings serious buyers together so they can negotiate with developers from a stronger position, compare inventory clearly, and save more with expert support.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/properties">Explore Properties <ArrowRight size={18} /></ButtonLink>
              <ButtonLink href="/contact" variant="secondary">Talk to expert</ButtonLink>
            </div>
          </div>
          <div className="animated-border rounded-[2.4rem] p-1">
            <div className="relative overflow-hidden rounded-[2.2rem] bg-[#111111] p-6 text-white">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=88')] bg-cover bg-center opacity-45" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#111111]/85 via-[#e34b32]/55 to-transparent" />
              <div className="relative grid gap-4">
                {[{ icon: Users, title: "Verified buyer groups" }, { icon: Building2, title: "Developer-direct inventory" }, { icon: Handshake, title: "Transparent negotiation" }, { icon: ShieldCheck, title: "Support till closure" }].map(({ icon: Icon, title }) => (
                  <div key={title} className="rounded-3xl border border-white/15 bg-white/12 p-5 backdrop-blur">
                    <Icon className="mb-3 text-[#f3b64a]" />
                    <p className="font-display text-xl font-black">{title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section eyebrow="Our impact" title="Built for buyers who want better numbers">
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="hover-lift rounded-[1.75rem] bg-white p-6 text-center premium-border">
              <p className="font-display text-4xl font-black text-[#df432c]"><AnimatedCounter value={stat.value} /></p>
              <p className="mt-2 text-sm font-bold text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-[#fff6f2]" eyebrow="Why buyers choose us" title="Professional support at every step">
        <div className="grid gap-5 md:grid-cols-3">
          {valueCards.map((card) => (
            <div key={card.title} className="magnetic-card hover-lift rounded-[2rem] bg-white p-7 premium-border">
              <BadgeCheck className="mb-4 text-[#e34b32]" />
              <h2 className="font-display text-2xl font-black text-[#111111]">{card.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{card.text}</p>
              <p className="mt-5 rounded-full bg-[#111111] px-4 py-2 text-center text-sm font-black text-white">{card.metric}</p>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
