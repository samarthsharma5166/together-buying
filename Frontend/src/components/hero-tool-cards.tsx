"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Calculator, IndianRupee, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRef } from "react";

type ToolCardData = {
  icon: LucideIcon;
  title: string;
  text: string;
  badge: string;
  metric: string;
  gradient: string;
  orb: string;
  ring: string;
  index: string;
};

const cards: ToolCardData[] = [
  {
    icon: Sparkles,
    title: "Saving Intelligence",
    text: "Group discounts, cashback and negotiated quotes in one view.",
    badge: "Insights",
    metric: "10-15%",
    gradient: "from-[#fff0eb] via-white to-[#fffaf8]",
    orb: "bg-[#e34b32]/20",
    ring: "border-[#e34b32]/20",
    index: "01",
  },
  {
    icon: Calculator,
    title: "Saving Calculator",
    text: "Estimate extra savings instantly from property price.",
    badge: "Estimate",
    metric: "Live",
    gradient: "from-[#fff8f5] via-white to-[#fff3ef]",
    orb: "bg-[#f3b64a]/22",
    ring: "border-[#f3b64a]/25",
    index: "02",
  },
  {
    icon: IndianRupee,
    title: "EMI Calculator",
    text: "Plan monthly EMIs before your site visit.",
    badge: "Finance",
    metric: "₹ EMI",
    gradient: "from-[#f8fafc] via-white to-[#fff6f2]",
    orb: "bg-[#111111]/10",
    ring: "border-slate-200",
    index: "03",
  },
];

function ToolCard({ card, delay }: { card: ToolCardData; delay: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), { stiffness: 280, damping: 24 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), { stiffness: 280, damping: 24 });

  const { icon: Icon, title, text, badge, metric, gradient, orb, ring, index } = card;

  function handleMouseMove(event: React.MouseEvent<HTMLAnchorElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
    ref.current?.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    ref.current?.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href="#calculators"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`hero-tool-card hover-lift group relative flex flex-col overflow-hidden rounded-[1.35rem] bg-white/80 border border-white p-4 shadow-[0_15px_35px_-5px_rgba(227,75,50,0.06),0_0_0_1px_rgba(255,255,255,0.7)_inset] backdrop-blur-xl transition-all ${ring}`}
    >
      <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${orb} blur-2xl transition duration-500 group-hover:scale-110`} />
      <div className="hero-tool-grid pointer-events-none absolute inset-0 opacity-[0.28]" />

      <div className="relative flex items-center justify-between gap-2">
        <span className="rounded-full border border-white/80 bg-white/85 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#e34b32] shadow-sm">
          {badge}
        </span>
        <span className="text-xs font-black text-slate-300">{index}</span>
      </div>

      <div className="relative mt-3 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#e34b32] to-[#f36a4b] text-white shadow-[0_8px_20px_rgba(227,75,50,.28)] transition group-hover:scale-105">
          <Icon size={18} strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-black leading-snug text-[#111111] md:text-[1.05rem]">{title}</h3>
            <span className="shrink-0 rounded-lg border border-slate-100 bg-white/90 px-2 py-1 text-right shadow-sm">
              <span className="block font-display text-sm font-black leading-none text-[#111111]">{metric}</span>
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-600">{text}</p>
        </div>
      </div>

      <div className="relative mt-3 flex items-center justify-between border-t border-slate-100/80 pt-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 transition group-hover:text-[#e34b32]">Open tool</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[#e34b32] shadow-sm transition group-hover:border-[#e34b32]/30 group-hover:bg-[#fff3ef]">
          <ArrowUpRight size={15} />
        </span>
      </div>

      <div className="hero-tool-shine pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100" />
    </motion.a>
  );
}

export function HeroToolCards() {
  return (
    <section className="relative -mt-8 z-30 pb-4">
      <div className="container-shell relative">
        <div className="premium-border rounded-[1.6rem] p-1 bg-white/40 backdrop-blur-xl">
          <div className="relative overflow-hidden rounded-[1.45rem] bg-white/70 p-2 backdrop-blur-2xl md:p-2.5">
            <div className="relative grid gap-2.5 md:grid-cols-3">
              {cards.map((card, index) => (
                <ToolCard key={card.title} card={card} delay={index * 0.08} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
