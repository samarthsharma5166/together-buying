"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

type RequireAuthProps = {
  children: ReactNode;
  /** Path to return to after login, e.g. `/articles/my-slug` */
  redirectTo: string;
};

/**
 * Client-side auth gate (same pattern as properties).
 * AuthInit + Redux user must be loaded; guests are sent to login.
 */
export function RequireAuth({ children, redirectTo }: RequireAuthProps) {
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      const redirect = encodeURIComponent(redirectTo);
      router.push(`/login?redirect=${redirect}`);
    }
  }, [mounted, user, loading, router, redirectTo]);

  if (!mounted || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50/50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#e34b32] border-t-transparent" />
          <p className="mt-4 text-sm font-bold text-slate-500">Checking credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
