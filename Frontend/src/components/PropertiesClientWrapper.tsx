"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function PropertiesClientWrapper({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      if (!user) {
        // Not authenticated, send to login
        router.push("/login?redirect=/properties");
      }
    }
  }, [mounted, user, loading, router]);

  // Render a skeleton load screen while checking auth status
  if (!mounted || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50/50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e34b32] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm font-bold text-slate-500">Checking credentials...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated, render nothing while redirect takes effect
  if (!user) {
    return null;
  }

  // If authenticated, render children page content
  return <>{children}</>;
}
