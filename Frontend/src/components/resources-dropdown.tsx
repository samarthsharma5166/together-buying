"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { resourceNavItems } from "@/lib/content";

type ResourcesDropdownProps = {
  className?: string;
  onNavigate?: () => void;
  variant?: "navbar" | "mobile";
  isActive?: boolean;
  linkClass?: string;
};

export function ResourcesDropdown({
  className,
  onNavigate,
  variant = "navbar",
  isActive,
  linkClass,
}: ResourcesDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  function handleMouseEnter() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
  }

  function handleMouseLeave() {
    closeTimerRef.current = setTimeout(() => setOpen(false), 120);
  }

  if (variant === "mobile") {
    return (
      <div className={cn("grid gap-1", className)}>
        <p className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">Resources</p>
        {resourceNavItems.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            onClick={onNavigate}
            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-[#fff3ef]"
          >
            {label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("relative", className)}
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        className={cn(
          linkClass,
          "inline-flex cursor-default items-center gap-1 bg-transparent p-0",
          (isActive || open) && "text-[#e34b32] after:w-full"
        )}
      >
        Resources
        <ChevronDown size={14} className={cn("transition-transform duration-200", open && "rotate-180")} />
      </span>

      {open && (
        <div className="absolute left-1/2 top-full z-[100] mt-3 w-52 -translate-x-1/2 rounded-2xl border border-slate-100 bg-white p-2 shadow-[0_16px_40px_rgba(17,17,17,.1)]">
          {resourceNavItems.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-[#111111] transition hover:bg-[#fff3ef] hover:text-[#e34b32]"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
