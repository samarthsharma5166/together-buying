"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Building2, ChevronDown, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  {
    label: "Corporate",
    href: "/bulk-deals/corporate",
    description: "Employee housing & bulk bookings",
    icon: Building2,
  },
  {
    label: "Family Offices",
    href: "/bulk-deals/family-offices",
    description: "Portfolio-scale property deals",
    icon: Landmark,
  },
];

type BulkDealsDropdownProps = {
  className?: string;
  onNavigate?: () => void;
  variant?: "navbar" | "mobile";
};

export function BulkDealsDropdown({ className, onNavigate, variant = "navbar" }: BulkDealsDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (variant === "mobile") {
    return (
      <div className={cn("grid gap-1", className)}>
        <p className="px-4 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">Bulk Deals</p>
        {items.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-slate-700 hover:bg-[#fff3ef]"
          >
            <Icon size={18} className="text-[#e34b32]" />
            {label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative inline-block text-left", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#111111] shadow-sm transition duration-300 hover:border-[#e34b32]/40 hover:text-[#df432c] hover:shadow-md xl:gap-2 xl:px-3.5 xl:py-2 xl:text-sm"
      >
        Bulk Deals
        <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-200 xl:size-4", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 z-[100] mt-2.5 w-64 origin-top-right rounded-2xl border border-slate-100 bg-white/94 p-2 shadow-[0_20px_50px_rgba(17,17,17,.12)] backdrop-blur-xl">
          <div className="px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bulk Deals</p>
          </div>
          <div className="space-y-0.5">
            {items.map(({ label, href, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#fff3ef]"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff3ef] text-[#e34b32]">
                  <Icon size={17} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-slate-800">{label}</span>
                  <span className="block text-xs text-slate-500">{description}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
