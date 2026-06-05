"use client";

import { useState } from "react";
import { Button } from "@/components/button";

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [sent, setSent] = useState(false);
  return (
    <form onSubmit={(event) => { event.preventDefault(); setSent(true); }} className={`animated-border grid rounded-[1.6rem] bg-white premium-border ${compact ? "gap-3 p-4" : "gap-4 p-5"}`}>
      {!compact && <div><p className="text-sm font-black uppercase tracking-[0.22em] text-[#df432c]">Book a Visit</p><h3 className="font-display text-2xl font-black text-[#111111]">Get the biggest offer</h3><p className="mt-2 text-sm leading-6 text-slate-500">Our RM will call back with project facts, inventory and group saving options.</p></div>}
      <input required placeholder="Full name" className="professional-focus rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#111111] placeholder:text-slate-500 transition" />
      <input required placeholder="Mobile number for callback" className="professional-focus rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#111111] placeholder:text-slate-500 transition" />
      <input placeholder="City, project or budget range" className="professional-focus rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#111111] placeholder:text-slate-500 transition" />
      <textarea placeholder="Example: 3 BHK in Gurgaon, visit this weekend" className={`professional-focus rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#111111] placeholder:text-slate-500 transition ${compact ? "min-h-20" : "min-h-24"}`} />
      <Button type="submit">Get in touch</Button>
      {sent && <p className="rounded-2xl bg-[#fff3ef] px-4 py-3 text-sm font-bold text-[#d9462e]">Thanks. Our relationship manager will contact you shortly.</p>}
    </form>
  );
}


