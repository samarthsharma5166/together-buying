"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { useAppSelector } from "@/store/hooks";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function safeRedirectPath(raw: string | null): string | null {
  if (!raw) return null;
  // Only allow same-origin relative paths
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function LoginRedirect() {
  const user = useAppSelector((state) => state.auth.user);
  const searchParams = useSearchParams();
  const next = safeRedirectPath(searchParams.get("redirect"));

  if (user) {
    if (next) {
      redirect(next);
    }
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      redirect("/admin/dashboard");
    }
    redirect("/");
  }

  return (
    <main className="mesh-bg py-16 md:py-24">
      <div className="container-shell">
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-slate-600">
          New to GroupBuying?{" "}
          <Link className="font-bold text-[#e34b32]" href="/register">
            Create your membership
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginRedirect />
    </Suspense>
  );
}
