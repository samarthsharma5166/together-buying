"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { loginUser, registerUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(formData: FormData) {
    setSubmitting(true);
    setMessage(null);
    const formFields = Object.fromEntries(formData.entries()) as Record<string, string>;
    const body: Record<string, string> = { ...formFields };

    if (body.identifier) {
      const value = body.identifier.trim();
      if (value.includes("@")) {
        body.email = value;
      } else {
        body.phone = value;
      }
      delete body.identifier;
    }

    try {
      if (mode === "login") {
        const user = await dispatch(loginUser(body)).unwrap();
        setMessage("Login successful. Redirecting...");
        
        // Redirect based on role
        if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
          router.push("/admin/dashboard");
        } else if (user.role === "RM") {
          router.push("/rm/dashboard");
        } else {
          router.push("/");
        }
      } else {
        await dispatch(registerUser(body)).unwrap();
        setMessage("Registration successful. Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (error: any) {
      setMessage(error?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <form action={submit} className="mx-auto grid max-w-md gap-4 rounded-[2.2rem] bg-white p-6 premium-border md:p-8">
      <div className="text-center"><p className="text-sm font-black uppercase tracking-[0.22em] text-[#df432c]">Member Access</p><h1 className="font-display text-3xl font-black text-[#111111]">{mode === "login" ? "Login" : "Register"}</h1><p className="mt-2 text-sm text-slate-500">Join once, save for life with project-specific group buying support.</p></div>
      {mode === "register" && <div className="grid grid-cols-2 gap-3"><input name="firstName" required placeholder="First name" className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-[#e34b32] focus:bg-white" /><input name="lastName" required placeholder="Last name" className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-[#e34b32] focus:bg-white" /></div>}
      <input name="identifier" required placeholder="Email or Phone" className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-[#e34b32] focus:bg-white" />
      <input name="password" type="password" required placeholder="Password" className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-[#e34b32] focus:bg-white" />
      <Button disabled={submitting}>{submitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}</Button>
      {message && <p className="rounded-2xl bg-[#fff3ef] px-4 py-3 text-center text-sm font-bold text-[#d9462e]">{message}</p>}
    </form>
  );
}


