"use client";

import { useState } from "react";
import { Building2, ChevronDown, Globe2, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { Button } from "@/components/button";
import { createLead, LeadInput } from "@/lib/api";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-slate-200/90 bg-slate-50/80 px-4 py-3 pl-11 text-sm font-semibold text-[#111111] placeholder:text-slate-400 transition focus:border-[#e34b32]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#e34b32]/10";

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<LeadInput>({
    name: "",
    phone: "",
    email: "",
    purpose: "BUY",
    project: "",
    city: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createLead(formData);
      setSent(true);
      setFormData({ name: "", phone: "", email: "", purpose: "BUY", project: "", city: "" });
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-[0_24px_60px_rgba(17,17,17,.12)]",
        compact ? "p-5" : "p-6 md:p-7"
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#e34b32]/8 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-orange-100 blur-2xl" />

      <div className="relative">
        {!compact && (
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#df432c]">Contact Us</p>
            <h3 className="mt-1 font-display text-2xl font-black text-[#111111]">Get the biggest offer</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Our RM will call back with project facts, inventory and group saving options.
            </p>
          </div>
        )}

        {compact && (
          <div className="mb-4 border-b border-slate-100 pb-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e34b32]">Quick enquiry</p>
            <h3 className="mt-1 font-display text-xl font-black text-[#111111]">Talk to an expert</h3>
          </div>
        )}

        <div className={cn("grid gap-3", compact ? "" : "md:grid-cols-2")}>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input required name="name" value={formData.name} onChange={handleChange} placeholder="Full name" className={inputClass} />
          </div>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email address" className={inputClass} />
          </div>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input required name="phone" value={formData.phone} onChange={handleChange} placeholder="Mobile number for callback" className={inputClass} />
          </div>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input name="city" value={formData.city} onChange={handleChange} placeholder="Preferred city (e.g. Gurugram)" className={inputClass} />
          </div>
          <div className={cn("relative", compact ? "" : "md:col-span-2")}>
            <Building2 className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input name="project" value={formData.project} onChange={handleChange} placeholder="Specific project (optional)" className={inputClass} />
          </div>
          <div className={cn("relative", compact ? "" : "md:col-span-2")}>
            <Globe2 className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select name="purpose" value={formData.purpose} onChange={handleChange} className={cn(inputClass, "appearance-none pr-10")}>
              <option value="BUY">Looking to Buy</option>
              <option value="SELL">Looking to Sell</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="mt-4 w-full !rounded-xl !py-3.5 !text-sm !font-black !shadow-[0_12px_30px_rgba(227,75,50,.28)]"
        >
          {loading ? "Submitting..." : "Get in touch"}
        </Button>

        <p className="mt-3 text-center text-[11px] font-medium text-slate-400">
          We respect your privacy. No spam — only property guidance.
        </p>

        {sent && (
          <p className="mt-3 rounded-xl border border-[#e34b32]/15 bg-[#fff3ef] px-4 py-3 text-sm font-bold text-[#d9462e]">
            Thanks! Our relationship manager will contact you shortly.
          </p>
        )}
      </div>
    </form>
  );
}
