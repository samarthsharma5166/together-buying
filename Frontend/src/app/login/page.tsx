import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="mesh-bg py-16 md:py-24">
      <div className="container-shell">
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-slate-600">New to GroupBuying? <Link className="font-bold text-[#e34b32]" href="/register">Create your membership</Link></p>
      </div>
    </main>
  );
}


