"use client";

import Link from "next/link";
import { Heart, Home, LogIn, Newspaper, Search } from "lucide-react";

const items = [
  { label: "Home", href: "/", icon: Home },
  { label: "Properties", href: "/properties", icon: Search },
  { label: "Blogs", href: "/blogs", icon: Newspaper },
  { label: "Login", href: "/login", icon: LogIn },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-orange-100 bg-white/94 px-2 py-2 shadow-[0_-14px_38px_rgba(14,45,74,.12)] backdrop-blur-2xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map(({ label, href, icon: Icon }) => (
          <Link key={label} href={href} className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-black text-slate-500 transition hover:bg-[#fff3ef] hover:text-[#df432c]">
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}


