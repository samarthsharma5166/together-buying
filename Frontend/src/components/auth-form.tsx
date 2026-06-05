"use client";

import { useState } from "react";
import { authRequest } from "@/lib/api";
import { Button } from "@/components/button";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function submit(formData: FormData) {
    setLoading(true); setMessage(null);
    const body = Object.fromEntries(formData.entries()) as Record<string, string>;
    try {
      await authRequest(mode === "login" ? "/auth/login" : "/auth/register", body);
      setMessage(mode === "login" ? "Login successful." : "Registration successful. You can login now.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally { setLoading(false); }
  }
  return (
    <form action={submit} className="mx-auto grid max-w-md gap-4 rounded-[2.2rem] bg-white p-6 premium-border md:p-8">
      <div className="text-center"><p className="text-sm font-black uppercase tracking-[0.22em] text-[#df432c]">Member Access</p><h1 className="font-display text-3xl font-black text-[#111111]">{mode === "login" ? "Login" : "Register"}</h1><p className="mt-2 text-sm text-slate-500">Join once, save for life with project-specific group buying support.</p></div>
      {mode === "register" && <div className="grid grid-cols-2 gap-3"><input name="firstName" required placeholder="First name" className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-[#e34b32] focus:bg-white" /><input name="lastName" required placeholder="Last name" className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-[#e34b32] focus:bg-white" /></div>}
      <input name="email" type="email" placeholder="Email" className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-[#e34b32] focus:bg-white" />
      <input name="phone" placeholder="Phone" className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-[#e34b32] focus:bg-white" />
      <input name="password" type="password" required placeholder="Password" className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-[#e34b32] focus:bg-white" />
      <Button disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}</Button>
      {message && <p className="rounded-2xl bg-[#fff3ef] px-4 py-3 text-center text-sm font-bold text-[#d9462e]">{message}</p>}
    </form>
  );
}


