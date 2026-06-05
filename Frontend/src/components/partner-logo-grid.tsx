"use client";

import { motion } from "framer-motion";
import { Building2, Crown, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 3).toUpperCase();
}

export function PartnerLogoGrid({ partners }: { partners: string[] }) {
  const uniquePartners = Array.from(new Set(partners)).slice(0, 20);
  const [active, setActive] = useState(uniquePartners[0] || "GroupBuying");

  return (
    <div className="partner-premium-shell grid gap-5 rounded-4xl border border-white/80 p-4 shadow-[0_22px_70px_rgba(17,17,17,.1)] md:p-5 lg:grid-cols-[1fr_290px]">
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {["Verified Developers", "Live Inventory", "Direct Negotiation"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3 py-2 text-xs font-black text-[#111111] shadow-sm backdrop-blur">
                <ShieldCheck size={14} className="text-[#e34b32]" /> {item}
              </span>
            ))}
          </div>
          <span className="rounded-full bg-[#111111] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">30+ partners</span>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-4xl border border-white/70 bg-white/45 p-3 backdrop-blur-xl md:grid-cols-4 lg:grid-cols-5">
        {uniquePartners.map((name, index) => (
          <motion.button
            type="button"
            key={`${name}-${index}`}
            onMouseEnter={() => setActive(name)}
            onFocus={() => setActive(name)}
            className="partner-logo-tile group relative flex h-20 items-center justify-center overflow-hidden rounded-2xl bg-white/92 p-3 text-center font-display text-sm font-black text-slate-700 shadow-[0_10px_24px_rgba(17,17,17,.07)] outline-none backdrop-blur"
            whileHover={{ y: -5, scale: 1.025 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
          >
            <span className="absolute inset-px rounded-2xl bg-white transition duration-300 group-hover:bg-[#fff7f4]" />
            <span className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-[#e34b32]/10 transition group-hover:scale-150" />
            <span className="relative transition duration-300 group-hover:scale-90 group-hover:opacity-0">{name}</span>
            <span className="absolute flex scale-75 flex-col items-center opacity-0 transition duration-300 group-hover:scale-100 group-hover:opacity-100">
              <span className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl bg-[#e34b32] text-xs font-black text-white shadow-lg">{initials(name)}</span>
              <span className="text-xs font-black text-[#111111]">{name}</span>
            </span>
          </motion.button>
        ))}
        </div>
      </div>
      <motion.div
        key={active}
        initial={{ opacity: 0, x: 24, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="sticky top-24 hidden h-fit overflow-hidden rounded-4xl bg-[#111111] p-4 text-white shadow-[0_20px_58px_rgba(17,17,17,.22)] lg:block"
      >
        <div className="brand-preview mb-3 flex h-40 items-center justify-center rounded-3xl bg-[#fff3ef]">
          <div className="relative rounded-[1.4rem] bg-white p-5 text-center text-[#111111] shadow-2xl">
            <Crown className="absolute -right-3 -top-3 rounded-full bg-[#f3b64a] p-2 text-[#111111]" size={34} />
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e34b32] font-display text-xl font-black text-white shadow-[0_16px_32px_rgba(227,75,50,.28)]">{initials(active)}</div>
            <p className="font-display text-xl font-black">{active}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-[#e34b32]">Premium Developer Partner</p>
          </div>
        </div>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <span className="rounded-2xl bg-white/10 p-3 text-xs font-black"><Building2 className="mb-1 text-[#f3b64a]" size={16} /> Active projects</span>
          <span className="rounded-2xl bg-white/10 p-3 text-xs font-black"><Sparkles className="mb-1 text-[#f3b64a]" size={16} /> Group offers</span>
        </div>
        <p className="text-xs leading-5 text-white/72">Hover any partner to preview its premium brand card and active project identity.</p>
      </motion.div>
    </div>
  );
}
