import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "dark";
const variants: Record<Variant, string> = {
  primary: "shine bg-gradient-to-r from-[#e34b32] to-[#f36a4b] text-white shadow-[0_18px_44px_rgba(227,75,50,.28)] hover:shadow-[0_24px_55px_rgba(227,75,50,.34)]",
  secondary: "bg-white text-[#111111] border border-slate-200 shadow-sm hover:border-[#e34b32]/40 hover:text-[#df432c] hover:shadow-lg",
  ghost: "bg-white/12 text-white border border-white/20 hover:bg-white/20",
  dark: "bg-[#111111] text-white hover:bg-[#e34b32] shadow-[0_18px_38px_rgba(17,17,17,.22)]",
};

const base = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition duration-300 disabled:pointer-events-none disabled:opacity-60";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };
export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: Variant; children: ReactNode };
export function ButtonLink({ className, variant = "primary", href, children, ...props }: ButtonLinkProps) {
  return <Link href={href} className={cn(base, variants[variant], className)} {...props}>{children}</Link>;
}


