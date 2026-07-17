"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { FooterRelatedLinks } from "@/components/footer-related-links";
import { navItems } from "@/lib/content";
import { Reveal } from "@/components/reveal";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/rm") || pathname.startsWith("/user");

  if (isDashboard) {
    return null;
  }

  return (
    <footer id="contact" className="footer-animated bg-[#111111] text-white">
      <FooterRelatedLinks />
      <div className="container-shell relative z-10 grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <Reveal>
          <div className="mb-5 flex items-center gap-3">
            <span className="pulse-ring flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e34b32] font-black">GB</span>
            <div><p className="font-display text-xl font-extrabold">GroupBuying</p><p className="text-xs uppercase tracking-[0.22em] text-orange-200">Pay Less Together</p></div>
          </div>
          <p className="max-w-md text-sm leading-7 text-slate-300">Shared dreams, Smart ownership. Helping buyers unlock developer-direct savings through collective buying power.</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-orange-100"><Sparkles size={15} /> Group buying deals live</div>
        </Reveal>
        <Reveal delay={0.08}>
          <h3 className="mb-4 font-display text-lg font-bold">Quick Links</h3>
          <div className="grid gap-3 text-sm text-slate-300">
            {navItems.map((item) => <Link key={item.href} href={item.href} className="transition hover:translate-x-1 hover:text-white">{item.label}</Link>)}
            <Link href="/register" className="transition hover:translate-x-1 hover:text-white">Become Member</Link>
          </div>
        </Reveal>
        <Reveal delay={0.16}>
          <h3 className="mb-4 font-display text-lg font-bold">Contact Us</h3>
          <div className="grid gap-3 text-sm text-slate-300">
            <p className="flex gap-3"><MapPin size={18} className="shrink-0 text-orange-300" /> Sector MU-1, Greater Noida</p>
            <a className="flex gap-3 transition hover:translate-x-1 hover:text-white" href="mailto:hello@groupbuying.in"><Mail size={18} className="text-orange-300" /> hello@groupbuying.in</a>
            <a className="flex gap-3 transition hover:translate-x-1 hover:text-white" href="tel:+919992196879"><Phone size={18} className="text-orange-300" /> +91 9992196879</a>
          </div>
        </Reveal>
      </div>
      <div className="relative z-10 border-t border-white/10 py-5 text-center text-xs text-slate-400">© 2026 GroupBuying. A brand of My Housing Advisor Private Limited.</div>
    </footer>
  );
}
