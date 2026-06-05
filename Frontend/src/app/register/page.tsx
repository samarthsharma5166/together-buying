"use client"
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { useAppSelector } from "@/store/hooks";
import { redirect } from "next/navigation";

export default function RegisterPage() {
  const user = useAppSelector(state => state.auth.user)

  if(user){
    if (user.role== "ADMIN"){
      redirect('/admin/dashboard')
    }else{
      redirect('/')
    }
  }

  return (
    <main className="mesh-bg py-16 md:py-24">
      <div className="container-shell">
        <AuthForm mode="register" />
        <p className="mt-6 text-center text-sm text-slate-600">Already a member? <Link className="font-bold text-[#e34b32]" href="/login">Login here</Link></p>
      </div>
    </main>
  );
}


