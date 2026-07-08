"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { createLead, LeadInput } from "@/lib/api";
import { ChevronDown } from "lucide-react";

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<LeadInput>({
    name: "",
    phone: "",
    email: "",
    purpose: "BUY",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createLead(formData);
      setSent(true);
      setFormData({ name: "", phone: "", email: "", purpose: "BUY" });
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`animated-border grid rounded-[1.6rem] bg-white premium-border ${compact ? "gap-3 p-4" : "gap-4 p-5"}`}>
      {!compact && <div><p className="text-sm font-black uppercase tracking-[0.22em] text-[#df432c]">Contact Us</p><h3 className="font-display text-2xl font-black text-[#111111]">Get the biggest offer</h3><p className="mt-2 text-sm leading-6 text-slate-500">Our RM will call back with project facts, inventory and group saving options.</p></div>}
      <input required name="name" value={formData.name} onChange={handleChange} placeholder="Full name" className="professional-focus rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#111111] placeholder:text-slate-500 transition" />
      <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email address" className="professional-focus rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#111111] placeholder:text-slate-500 transition" />
      <input required name="phone" value={formData.phone} onChange={handleChange} placeholder="Mobile number for callback" className="professional-focus rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#111111] placeholder:text-slate-500 transition" />
      <div className="relative">
        <select name="purpose" value={formData.purpose} onChange={handleChange} className="appearance-none professional-focus w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-[#111111] transition">
          <option value="BUY">Looking to Buy</option>
          <option value="SELL">Looking to Sell</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
      
      <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Get in touch"}</Button>
      {sent && <p className="rounded-2xl bg-[#fff3ef] px-4 py-3 text-sm font-bold text-[#d9462e]">Thanks. Our relationship manager will contact you shortly.</p>}
    </form>
  );
}
