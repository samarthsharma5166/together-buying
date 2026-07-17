"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, User, LayoutGrid, Shield, Briefcase } from "lucide-react";

export function UserDropdown() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  async function handleLogout() {
    setOpen(false);
    await dispatch(logoutUser());
    router.push("/");
  }

  // Get initial letters of name
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 p-1 pr-2.5 text-xs font-semibold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md focus:outline-none xl:gap-2 xl:p-1.5 xl:pr-3.5 xl:text-sm"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff3ef] text-[10px] font-black text-[#d9462e] xl:h-8 xl:w-8 xl:text-xs">
          {initials || <User size={13} />}
        </span>
        <span className="hidden max-w-[100px] truncate xl:block">
          {user.firstName} {user.lastName}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2.5 w-60 origin-top-right rounded-2xl border border-slate-100 bg-white/94 p-2 shadow-[0_20px_50px_rgba(17,17,17,.12)] backdrop-blur-xl transition-all z-[100]">
          <div className="px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Account</p>
            <p className="mt-0.5 truncate text-sm font-black text-slate-800">{user.firstName} {user.lastName}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-600">
              {user.role}
            </span>
          </div>

          <div className="my-1 border-t border-slate-100" />

          <div className="space-y-0.5">
            {/* Dashboard Link based on role */}
            {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
              <Link
                href="/admin/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#d9462e]"
              >
                <Shield size={16} className="text-slate-400" />
                Admin Dashboard
              </Link>
            )}

            {user.role === "RM" && (
              <Link
                href="/rm/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#d9462e]"
              >
                <Briefcase size={16} className="text-slate-400" />
                RM Dashboard
              </Link>
            )}

            {(user.role === "USER" || user.role === "BUYER_PREMIUM") && (
              <Link
                href="/user/myGroups"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#d9462e]"
              >
                <User size={16} className="text-slate-400" />
                User Dashboard
              </Link>
            )}


            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <LayoutDashboard size={16} className="text-slate-400" />
              Go to Home Page
            </Link>
          </div>

          <div className="my-1 border-t border-slate-100" />

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-600 transition-colors hover:bg-red-50/70"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
