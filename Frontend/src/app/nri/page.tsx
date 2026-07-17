import { ArrowRight, BadgeCheck, Globe2, Headphones, ShieldCheck, Sparkles, Video } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/button";
import { ContactForm } from "@/components/contact-form";
import { Section } from "@/components/section";

const nriBenefits = [
  {
    icon: Globe2,
    title: "Invest from anywhere",
    text: "Shortlist NCR projects, compare inventory and join buyer groups without being on-ground every week.",
  },
  {
    icon: Video,
    title: "Virtual site visits",
    text: "Get curated video walkthroughs, live virtual tours and RM-led project reviews before you commit.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent documentation",
    text: "RERA-verified projects, clear pricing sheets and documented savings on every group negotiation.",
  },
  {
    icon: Headphones,
    title: "Dedicated NRI support",
    text: "Timezone-friendly calls, WhatsApp updates and end-to-end coordination till booking and registration.",
  },
];

const nriSteps = [
  "Share your budget, preferred city and investment horizon with our NRI desk.",
  "Get a curated shortlist with virtual tours, payment plans and appreciation outlook.",
  "Join a verified buyer group for stronger developer negotiation and extra savings.",
  "Complete booking remotely with legal, home loan and registration coordination support.",
];

export default function NriPage() {
  return (
    <main>
      <section className="hero-premium-bg relative overflow-hidden py-16 md:py-24">
        <div className="glow-blob green left-10 top-20" />
        <div className="glow-blob gold bottom-16 right-16" />
        <div className="container-shell grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div className="reveal-up">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#e34b32] shadow-sm">
              <Sparkles size={15} /> NRI Investment Desk
            </p>
            <h1 className="font-display text-4xl font-black leading-tight text-[#111111] md:text-5xl lg:text-6xl">
              Buy premium NCR homes from abroad with confidence
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              GroupBuying helps NRIs invest in Greater Noida, Noida and Gurugram through verified buyer groups,
              developer-direct pricing and 100% broker commission cashback — with full remote support.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/properties">Explore NRI Projects <ArrowRight size={18} /></ButtonLink>
              <ButtonLink href="/contact" variant="secondary">Talk to NRI Expert</ButtonLink>
            </div>
          </div>

          <div className="rounded-[2.4rem] border border-orange-100 bg-white p-6 shadow-[0_24px_70px_rgba(227,75,50,.12)]">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff3ef] text-[#e34b32]">
                <Globe2 size={24} />
              </span>
              <div>
                <p className="font-display text-xl font-black text-slate-900">Built for global Indians</p>
                <p className="text-sm text-slate-500">USA · UK · UAE · Canada · Singapore</p>
              </div>
            </div>
            <ul className="grid gap-3 text-sm text-slate-600">
              {["5-15% extra group discount", "3-10% broker cashback", "RERA-verified inventory", "POA & registration guidance"].map((item) => (
                <li key={item} className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 font-semibold">
                  <BadgeCheck size={16} className="shrink-0 text-[#e34b32]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Section eyebrow="Why NRIs choose GroupBuying" title="Professional end-to-end support without broker bias">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {nriBenefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="magnetic-card hover-lift rounded-[2rem] bg-white p-6 premium-border">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff3ef] text-[#e34b32]">
                <Icon size={22} />
              </div>
              <h2 className="font-display text-xl font-black text-[#111111]">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-[#fff6f2]" eyebrow="How it works for NRIs" title="Four simple steps to your India home">
        <ol className="grid gap-4 md:grid-cols-2">
          {nriSteps.map((step, index) => (
            <li key={step} className="flex gap-4 rounded-[1.75rem] bg-white p-5 premium-border">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111111] text-sm font-black text-white">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-sm leading-7 text-slate-600">{step}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="Popular NRI corridors" title="High-growth zones we actively cover">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { city: "Greater Noida", text: "Plots, villas and premium apartments along Yamuna Expressway" },
            { city: "Noida Extension", text: "Value homes with strong rental demand and metro connectivity" },
            { city: "Gurugram", text: "Luxury high-rises and golf course corridor projects" },
            { city: "Yamuna Expressway", text: "Early-stage appreciation plays with infra-led growth" },
          ].map((item) => (
            <Link
              key={item.city}
              href={`/properties?city=${encodeURIComponent(item.city)}`}
              className="hover-lift rounded-[1.75rem] bg-white p-5 premium-border transition hover:border-[#e34b32]/30"
            >
              <p className="font-display text-lg font-black text-[#111111]">{item.city}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="pb-16" eyebrow="Start your NRI journey" title="Speak with a GroupBuying NRI specialist">
        <div className="visit-panel-bg grid items-center gap-6 rounded-[2rem] p-5 text-white shadow-[0_24px_70px_rgba(10,120,105,.18)] md:grid-cols-[1fr_380px] md:p-7">
          <div>
            <BadgeCheck className="mb-4" size={34} />
            <h2 className="font-display text-3xl font-black leading-tight">Remote buying, real savings</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-orange-50">
              Tell us your preferred city, budget and timeline. Our team will share verified projects,
              arrange virtual tours and help you join the right buyer group.
            </p>
          </div>
          <ContactForm compact />
        </div>
      </Section>
    </main>
  );
}
