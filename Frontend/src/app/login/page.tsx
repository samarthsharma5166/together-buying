"use client"
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { useAppSelector } from "@/store/hooks";
import { redirect } from "next/navigation";

export default function LoginPage() {
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
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-slate-600">New to GroupBuying? <Link className="font-bold text-[#e34b32]" href="/register">Create your membership</Link></p>
      </div>
    </main>
  );
}


