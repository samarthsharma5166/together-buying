import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="mesh-bg py-16 md:py-24">
      <div className="container-shell">
        <AuthForm mode="register" />
        <p className="mt-6 text-center text-sm text-slate-600">Already a member? <Link className="font-bold text-[#e34b32]" href="/login">Login here</Link></p>
      </div>
    </main>
  );
}


