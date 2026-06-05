"use client";

import { usePathname } from "next/navigation";

export function FloatingAction() {
  const pathname = usePathname();

  // Hide the WhatsApp button in dashboards
  if (pathname.startsWith("/admin") || pathname.startsWith("/rm")) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-70 hidden md:block">
      <a href="https://wa.me/919992196879" target="_blank" rel="noreferrer" className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_55px_rgba(37,211,102,.38)] transition hover:-translate-y-1 hover:scale-105" aria-label="WhatsApp GroupBuying">
        <span className="absolute inset-0 rounded-full border border-[#25D366]/60 animate-ping" />
        <span className="absolute -left-28 top-1/2 hidden -translate-y-1/2 rounded-full bg-[#111111] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white shadow-xl transition group-hover:block">WhatsApp</span>
        <svg viewBox="0 0 32 32" aria-hidden="true" className="relative h-8 w-8 fill-current">
          <path d="M16.03 3.2A12.66 12.66 0 0 0 5.2 22.42L3.68 28l5.7-1.5a12.66 12.66 0 1 0 6.65-23.3Zm0 2.14a10.52 10.52 0 0 1 8.93 16.08 10.5 10.5 0 0 1-13.98 3.84l-.4-.2-3.38.88.9-3.28-.25-.42A10.52 10.52 0 0 1 16.03 5.34Zm-4.5 5.6c-.23 0-.6.08-.92.43-.32.36-1.2 1.18-1.2 2.88 0 1.7 1.24 3.34 1.42 3.57.17.23 2.42 3.88 5.98 5.28 2.96 1.17 3.56.94 4.2.88.64-.06 2.06-.84 2.36-1.65.3-.8.3-1.5.2-1.65-.08-.14-.32-.23-.67-.4-.35-.17-2.06-1.02-2.38-1.13-.32-.12-.56-.18-.8.17-.23.35-.9 1.13-1.1 1.36-.2.23-.4.26-.75.09-.35-.18-1.48-.55-2.82-1.75-1.04-.93-1.74-2.07-1.94-2.42-.2-.35-.02-.54.15-.72.16-.16.35-.4.52-.6.17-.2.23-.35.35-.58.12-.23.06-.43-.03-.6-.09-.17-.78-1.9-1.08-2.6-.28-.67-.57-.58-.8-.59h-.68Z" />
        </svg>
      </a>
    </div>
  );
}


