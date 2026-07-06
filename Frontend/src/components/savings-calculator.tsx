"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils";

export function SavingsCalculator() {
  const [price, setPrice] = useState(112700000);
  const [buyers, setBuyers] = useState(6);
  const saving = useMemo(() => Math.round(price * (0.05 + Math.min(buyers, 7) * 0.0065)), [price, buyers]);
  return (
    <div className="rounded-[1.7rem] bg-white p-5 premium-border md:p-6">
      <div className="mb-4 text-left">
        <h3 className="font-display text-2xl font-black text-[#111111] md:text-3xl">Savings Calculator</h3>
        <p className="mt-1 text-sm font-medium text-slate-600 md:text-base lg:whitespace-nowrap">Calculate how much can you save?</p>
      </div>
      <label className="grid gap-2 text-xs font-bold text-slate-700">Cost of Single Apartment <span className="justify-self-end rounded-xl border border-[#f1b7aa] bg-[#fff3ef] px-3 py-2 text-[#e34b32]">{formatPrice(price)}</span><input type="range" min="10000000" max="130000000" step="1000000" value={price} onChange={(event) => setPrice(Number(event.target.value))} className="accent-[#e34b32]" /></label>
      <label className="mt-4 grid gap-2 text-xs font-bold text-slate-700">No of Buyers / Apartments <span className="justify-self-end rounded-xl border border-[#f1b7aa] bg-[#fff3ef] px-3 py-2 text-[#e34b32]">{buyers}</span><input type="range" min="2" max="8" value={buyers} onChange={(event) => setBuyers(Number(event.target.value))} className="accent-[#e34b32]" /></label>
      <div className="shine mx-auto mt-6 w-fit rounded-2xl bg-[#e34b32] px-12 py-4 text-center text-white shadow-[0_18px_45px_rgba(227,75,50,.28)]"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/80">Save Upto</p><p className="font-display text-3xl font-black">{formatPrice(saving)}</p></div>
    </div>
  );
}

