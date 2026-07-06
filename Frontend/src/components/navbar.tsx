"use client";

import Link from "next/link";
import { Menu, Phone, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "@/lib/content";
import { ButtonLink } from "@/components/button";
import { PropertySearchFilter } from "@/components/property-search-filter";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import { UserDropdown } from "@/components/user-dropdown";
import { BulkDealsDropdown } from "@/components/bulk-deals-dropdown";
import { ResourcesDropdown } from "@/components/resources-dropdown";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { resourceNavItems } from "@/lib/content";

export function Navbar() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
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

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/rm") || pathname.startsWith("/user")) {
    return null;
  }

  const navLinkClass = (active: boolean) =>
    cn(
      "relative whitespace-nowrap text-sm font-semibold text-[#111111] transition-colors hover:text-[#e34b32]",
      "after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:rounded-full after:bg-[#e34b32] after:transition-all",
      active ? "text-[#e34b32] after:w-full" : "after:w-0 hover:after:w-full"
    );

  const isResourceActive = resourceNavItems.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  const isNavActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white shadow-[0_2px_12px_rgba(17,17,17,.04)]">
      <div className="container-shell flex min-h-[4rem] items-center justify-between gap-3 py-2">
        <Link href="/" className="flex shrink-0 items-center">
          <img
            src="/logo.jpg"
            alt="GroupBuying"
            className="h-10 w-auto object-contain sm:h-12"
          />
        </Link>

        {showFilter ? (
          <PropertySearchFilter compact className="hidden min-w-0 flex-1 md:block" />
        ) : (
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-6 lg:flex xl:gap-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass(isNavActive(item.href))}>
                {item.label}
              </Link>
            ))}
            <ResourcesDropdown
              isActive={isResourceActive}
              linkClass={navLinkClass(isResourceActive)}
            />
          </nav>
        )}

        <div className="hidden shrink-0 items-center gap-1.5 sm:gap-2 lg:flex">
          {!showFilter && (
            <>
              <a
                href="tel:+919992196879"
                className="flex items-center gap-1.5 rounded-full bg-[#fff3ef] px-2.5 py-1.5 text-xs font-bold text-[#d9462e] transition hover:bg-[#ffe8e0] sm:px-3 sm:py-2 xl:text-sm"
              >
                <Phone size={14} />
                <span className="hidden sm:inline">Call Now</span>
              </a>
              <BulkDealsDropdown />
            </>
          )}
          {user ? (
            <UserDropdown />
          ) : (
            <ButtonLink href="/login" variant="primary" className="!px-3 !py-2 !text-xs xl:!px-3.5 xl:!py-2 xl:!text-sm">
              <UserRound size={15} /> Sign In
            </ButtonLink>
          )}
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          <a
            href="tel:+919992196879"
            aria-label="Call Now"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff3ef] text-[#d9462e] sm:h-9 sm:w-9"
          >
            <Phone size={15} />
          </a>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((value) => !value)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white sm:h-9 sm:w-9"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-slate-100 bg-white shadow-lg lg:hidden">
          <div className="container-shell grid gap-1 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-[#fff3ef]",
                  isNavActive(item.href) ? "text-[#e34b32] bg-[#fff3ef]" : "text-slate-700"
                )}
              >
                {item.label}
              </Link>
            ))}
            <ResourcesDropdown variant="mobile" onNavigate={() => setOpen(false)} className="mt-1" />
            <BulkDealsDropdown variant="mobile" onNavigate={() => setOpen(false)} className="mt-1" />
            {user ? (
              <div className="mt-2 grid gap-1 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <div className="px-1 py-0.5">
                  <p className="text-sm font-black text-slate-800">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="my-1 h-px bg-slate-200/60" />
                {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                  <Link href="/admin/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2 text-sm font-bold text-slate-700 hover:bg-white">
                    Admin Dashboard
                  </Link>
                )}
                {user.role === "RM" && (
                  <Link href="/rm/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2 text-sm font-bold text-slate-700 hover:bg-white">
                    RM Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setOpen(false);
                    dispatch(logoutUser());
                    router.push("/");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <ButtonLink href="/login" variant="primary" className="mt-2 !py-2.5 !text-sm" onClick={() => setOpen(false)}>
                Login / Register
              </ButtonLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

