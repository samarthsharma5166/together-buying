"use client";

import Link from "next/link";
import { Menu, Phone, Search, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "@/lib/content";
import { ButtonLink } from "@/components/button";
import { PropertySearchFilter } from "@/components/property-search-filter";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      setShowFilter(window.scrollY / maxScroll >= 0.35);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/94 shadow-[0_10px_34px_rgba(17,17,17,.08)] backdrop-blur-2xl">
      <div className="container-shell flex min-h-18 items-center justify-between gap-4 py-2">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-10 w-10 -rotate-6 items-center justify-center rounded-xl bg-[#e34b32] text-lg font-black text-white shadow-lg">T</span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-black text-[#e34b32]">Group</span>
            <span className="-mt-1 block font-display text-lg font-black text-[#111111]">Buying</span>
          </span>
        </Link>
        {showFilter ? (
          <PropertySearchFilter compact className="hidden min-w-0 flex-1 lg:block" />
        ) : (
          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => <Link key={item.href} href={item.href} className="relative text-sm font-semibold text-[#111111] transition hover:text-[#e34b32] after:absolute after:-bottom-3 after:left-0 after:h-0.5 after:w-0 after:bg-[#e34b32] after:transition-all hover:after:w-full">{item.label}</Link>)}
          </nav>
        )}
        <div className="hidden items-center gap-3 lg:flex">
          {!showFilter && (
            <>
              <Link href="/properties" className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[#e34b32] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><Search size={18} /></Link>
              <a href="tel:+919992196879" className="flex items-center gap-2 rounded-full bg-[#fff3ef] px-4 py-3 text-sm font-black text-[#d9462e]"><Phone size={17} /> Call Now</a>
              <ButtonLink href="/register" variant="secondary">Corporate</ButtonLink>
            </>
          )}
          <ButtonLink href="/login" variant="primary"><UserRound size={17} /> Sign In</ButtonLink>
        </div>
        <button aria-label="Toggle menu" onClick={() => setOpen((value) => !value)} className="rounded-full border border-slate-200 bg-white p-3 lg:hidden">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-white p-4 lg:hidden">
          <div className="container-shell grid gap-2">
            {navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 font-semibold text-slate-700 hover:bg-[#fff3ef]">{item.label}</Link>)}
            <ButtonLink href="/login" variant="primary" className="mt-2">Login / Register</ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}


