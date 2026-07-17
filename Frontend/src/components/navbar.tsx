"use client";

import Link from "next/link";
import { Globe2, Menu, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      setScrolled(window.scrollY > 12);
      setShowFilter(window.scrollY / maxScroll >= 0.35);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/rm") || pathname.startsWith("/user")) {
    return null;
  }

  const navLinkClass = (active: boolean) =>
    cn(
      "relative whitespace-nowrap px-1 py-1 text-sm font-semibold transition-all duration-300",
      active ? "text-[#e34b32]" : "text-[#111111] hover:text-[#e34b32]",
      "after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-[#e34b32] after:transition-transform after:duration-300 hover:after:scale-x-100",
      active && "after:scale-x-100"
    );

  const isResourceActive = resourceNavItems.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  const isNavActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const desktopNavItems = navItems.filter((item) => item.href !== "/nri");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-slate-200/80 bg-white/92 shadow-[0_8px_30px_rgba(17,17,17,.06)] backdrop-blur-xl"
          : "border-slate-100 bg-white shadow-[0_2px_12px_rgba(17,17,17,.04)]"
      )}
    >
      <div className="container-shell flex min-h-[4rem] items-center justify-between gap-3 py-2">
        <Link href="/" className="group flex shrink-0 items-center transition-transform duration-300 hover:scale-[1.02]">
          <img src="/logo.jpg" alt="GroupBuying" className="h-10 w-auto object-contain sm:h-12" />
        </Link>

        {showFilter ? (
          <PropertySearchFilter compact className="hidden min-w-0 flex-1 md:block" />
        ) : (
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 lg:flex xl:gap-7">
            {desktopNavItems.map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass(isNavActive(item.href))}>
                {item.label}
              </Link>
            ))}
            <ResourcesDropdown isActive={isResourceActive} linkClass={navLinkClass(isResourceActive)} />
          </nav>
        )}

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {!showFilter && (
            <>
              <Link
                href="/nri"
                className={cn(
                  "group inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-black transition-all duration-300 xl:text-sm",
                  isNavActive("/nri")
                    ? "border-[#e34b32] bg-[#e34b32] text-white shadow-[0_8px_24px_rgba(227,75,50,.28)]"
                    : "border-[#e34b32]/20 bg-[#fff3ef] text-[#d9462e] hover:border-[#e34b32]/40 hover:bg-[#ffe8e0] hover:shadow-[0_8px_20px_rgba(227,75,50,.15)]"
                )}
              >
                <Globe2 size={15} className="transition-transform duration-300 group-hover:rotate-12" />
                NRI Desk
              </Link>
              <BulkDealsDropdown />
            </>
          )}
          {user ? (
            <UserDropdown />
          ) : (
            <ButtonLink
              href="/login"
              variant="primary"
              className="!px-4 !py-2.5 !text-xs !shadow-[0_8px_22px_rgba(227,75,50,.25)] transition-transform duration-300 hover:scale-[1.03] xl:!text-sm"
            >
              <UserRound size={15} /> Sign In
            </ButtonLink>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/nri"
            aria-label="NRI Desk"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300",
              isNavActive("/nri")
                ? "border-[#e34b32] bg-[#e34b32] text-white"
                : "border-[#e34b32]/20 bg-[#fff3ef] text-[#d9462e]"
            )}
          >
            <Globe2 size={16} />
          </Link>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((value) => !value)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white transition-all duration-300 hover:border-[#e34b32]/30 hover:bg-[#fff3ef]"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-slate-100 bg-white/98 shadow-xl backdrop-blur-xl lg:hidden"
          >
            <div className="container-shell grid gap-1 py-3">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                      isNavActive(item.href) ? "bg-[#fff3ef] text-[#e34b32]" : "text-slate-700 hover:bg-[#fff3ef]"
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <ResourcesDropdown variant="mobile" onNavigate={() => setOpen(false)} className="mt-1" />
              <BulkDealsDropdown variant="mobile" onNavigate={() => setOpen(false)} className="mt-1" />
              {user ? (
                <div className="mt-2 grid gap-1 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                  <div className="px-1 py-0.5">
                    <p className="text-sm font-black text-slate-800">
                      {user.firstName} {user.lastName}
                    </p>
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
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
