"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCurrentUser } from "@/store/slices/authSlice";
import { adminListSubscriptionPlans, type SubscriptionPlan } from "@/lib/api";
import { payWithRazorpay } from "@/lib/razorpay";
import { useRouter } from "next/navigation";
import { Check, Sparkles, AlertCircle, ShieldCheck, Zap, HelpCircle, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const FREE_BENEFITS = [
  { text: "Browse listing search filters", active: true },
  { text: "View public property summary cards", active: true },
  { text: "Calculate basic mortgage estimation EMIs", active: true },
  { text: "Access comprehensive developer layout maps", active: false },
  { text: "Direct RM callbacks & WhatsApp channels", active: false },
  { text: "Join negotiating project circles", active: false },
];

const PREMIUM_BENEFITS = [
  { text: "Browse listing search filters", active: true },
  { text: "View public property summary cards", active: true },
  { text: "Calculate basic mortgage estimation EMIs", active: true },
  { text: "Access comprehensive developer layout maps", active: true },
  { text: "Direct RM callbacks & WhatsApp channels", active: true },
  { text: "Join negotiating project circles", active: true },
];

export default function SubscribePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);
  const [successMode, setSuccessMode] = useState(false);

  useEffect(() => {
    adminListSubscriptionPlans()
      .then((res) => {
        // Sort plans by price
        const sorted = (res.data || []).sort((a, b) => a.price - b.price);
        setPlans(sorted);
      })
      .catch((err) => {
        setError(err.message || "Failed to load pricing plans");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handlePurchase = async (planId: string) => {
    if (!user) {
      router.push(`/login?redirect=/subscribe`);
      return;
    }

    setPayingPlanId(planId);
    setError(null);

    try {
      await payWithRazorpay({
        planId,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        userPhone: user.phone || "9999999999",
        onSuccess: async (response) => {
          console.log("[Subscribe Page] Razorpay payment success", response);
          setPayingPlanId(null);
          setSuccessMode(true);
          await dispatch(fetchCurrentUser());
        },
        onFailure: (err) => {
          setError(err.description || err.message || "Payment transaction failed.");
          setPayingPlanId(null);
        },
        onMockSuccess: async () => {
          console.log("[Subscribe Page] Simulated payment success");
          setPayingPlanId(null);
          setSuccessMode(true);
          await dispatch(fetchCurrentUser());
        },
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setPayingPlanId(null);
    }
  };

  return (
    <main className="bg-slate-50 min-h-screen py-16">
      <div className="container-shell max-w-6xl">
        
        {/* Success Splash */}
        {successMode ? (
          <div className="mx-auto max-w-2xl rounded-[2.5rem] bg-white p-8 md:p-12 text-center flex flex-col items-center justify-center border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6 shadow-md shadow-emerald-100 animate-bounce">
              <ShieldCheck size={44} className="stroke-[2.5]" />
            </div>
            
            <h2 className="font-display text-3xl font-black text-slate-900">
              Welcome to Together Buying Premium!
            </h2>
            
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Your transaction was verified successfully. You now hold the <strong className="text-[#e34b32]">BUYER_PREMIUM</strong> membership.
              All project specifications, developer blueprints, and direct manager chatrooms have been unlocked for your account.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/properties"
                className="rounded-full bg-[#e34b32] hover:bg-[#d9462e] text-white px-8 py-3.5 text-sm font-black uppercase tracking-wider shadow-md shadow-orange-500/15 transition-colors"
              >
                Browse Gated Projects
              </Link>
              <Link
                href="/"
                className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3.5 text-sm font-black uppercase tracking-wider transition-colors"
              >
                Return Home
              </Link>
            </div>
          </div>
        ) : (
          /* Normal pricing catalog */
          <>
            {/* Header info */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff3ef] px-4.5 py-2 text-xs font-black uppercase tracking-wider text-[#e34b32]">
                <Sparkles size={14} /> VIP Access Membership Plans
              </span>
              <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
                Pay Less, Buy Together
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Unlock 100% broker cashbacks, verified project specifications, and collective buyer negotiations directly with leading real estate developers.
              </p>
            </div>

            {error && (
              <div className="mx-auto max-w-4xl mb-8 flex items-start gap-3 rounded-2xl bg-red-50 p-4 border border-red-100 text-red-700 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Plans Grid */}
            <div className="flex md:flex-row flex-col gap-4 mb-20">
              {loading ? (
                // Skeleton cards
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse rounded-[2rem] bg-white p-6 border border-slate-200/60 h-80 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="h-4 w-24 bg-slate-200 rounded"></div>
                      <div className="h-8 w-32 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-slate-200 rounded-full w-full"></div>
                  </div>
                ))
              ) : plans.length === 0 ? (
                <div className="col-span-full py-16 text-center rounded-[2rem] bg-white border border-dashed border-slate-200">
                  <Zap className="mx-auto text-slate-300" size={40} />
                  <p className="mt-3 text-slate-600 font-bold">No active pricing tiers are online.</p>
                </div>
              ) : (
                plans.map((plan) => {
                  const isPaying = payingPlanId === plan.id;
                  const isPopular = plan.type === "LIFE_TIME";
                  const isLifetime = plan.type === "YEARLY";
                  
                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-[2rem] flex-1 bg-white p-7 border transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 ${
                        isPopular
                          ? "border-[#e34b32] ring-1 ring-[#e34b32] shadow-md shadow-orange-500/5 z-10"
                          : "border-slate-200/80"
                      }`}
                    >
                      {isPopular && (
                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#e34b32] px-4.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                          Most Popular
                        </span>
                      )}
                      
                      {isLifetime && (
                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-4.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                          Best Long-Term Value
                        </span>
                      )}

                      <div className="mb-6">
                        <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          isPopular ? "bg-[#fff3ef] text-[#e34b32]" : "bg-slate-100 text-slate-500"
                        }`}>
                          {plan.type.replace("_", " ")}
                        </span>
                        
                        <div className="mt-4 flex items-baseline gap-1">
                          <span className="font-display text-4xl font-black text-slate-900">
                            {formatPrice(plan.price)}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">
                            /{plan.type === "MONTHLY" ? "mo" : plan.type === "QUARTERLY" ? "3mo" : plan.type === "YEARLY" ? "yr" : "lifetime"}
                          </span>
                        </div>

                        <p className="mt-3.5 text-xs text-slate-500 font-semibold leading-relaxed">
                          {plan.type === "MONTHLY" && "Perfect for shortlisting a specific developer project next month."}
                          {plan.type === "QUARTERLY" && "Ideal timeline for comparisons, site visits, and group assembly."}
                          {plan.type === "YEARLY" && "Our recommended tier. Covers property cycles, negotiations, and closing support."}
                          {plan.type === "LIFE_TIME" && "One payment. Endless group buying benefits and commission returns on any home purchase."}
                        </p>
                      </div>

                      <button
                        onClick={() => handlePurchase(plan.id)}
                        disabled={!!payingPlanId}
                        className={`w-full rounded-full py-3.5 text-xs font-black uppercase tracking-wider transition shadow-md ${
                          isPaying
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : isPopular
                            ? "bg-[#e34b32] text-white hover:bg-[#d9462e] shadow-orange-500/10"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                      >
                        {isPaying ? (
                          <span className="flex items-center justify-center gap-1.5">
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></span>
                            Connecting Razorpay
                          </span>
                        ) : (
                          "Choose Plan"
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Benefit Comparison Section */}
            <div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-6 md:p-10 shadow-xs mb-16">
              <h2 className="font-display text-2xl font-black text-slate-900 mb-8 text-center md:text-left">
                Compare Member Benefits
              </h2>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Basic Column */}
                <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <h3 className="font-display text-lg font-black text-slate-800 mb-4 flex items-center justify-between">
                    <span>Free Membership</span>
                    <span className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">Basic</span>
                  </h3>
                  
                  <ul className="space-y-4">
                    {FREE_BENEFITS.map((benefit, idx) => (
                      <li key={idx} className={`flex items-start gap-2.5 text-xs font-semibold ${benefit.active ? "text-slate-600" : "text-slate-400 line-through"}`}>
                        <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                          benefit.active ? "bg-slate-200 text-slate-600" : "bg-slate-100 text-slate-300"
                        }`}>
                          {benefit.active ? <Check size={10} className="stroke-[3]" /> : "×"}
                        </div>
                        <span>{benefit.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Premium Column */}
                <div className="p-6 rounded-2xl bg-[#fffcfb] border border-[#e34b32]/30 shadow-sm shadow-orange-500/5">
                  <h3 className="font-display text-lg font-black text-slate-800 mb-4 flex items-center justify-between">
                    <span className="text-[#e34b32]">Buyer Premium</span>
                    <span className="text-xs font-black text-white bg-[#e34b32] px-2.5 py-0.5 rounded-full shadow-sm">VIP Club</span>
                  </h3>
                  
                  <ul className="space-y-4">
                    {PREMIUM_BENEFITS.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs font-bold text-slate-700">
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
                          <Check size={10} className="stroke-[3]" />
                        </div>
                        <span>{benefit.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* FAQs Block */}
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl font-black text-slate-900 mb-8 text-center">
                Frequently Asked Pricing Questions
              </h2>
              
              <div className="grid gap-4">
                {[
                  { q: "How is user role updated after checkout?", a: "As soon as your Razorpay transaction receives webhook verification (instantaneous in simulated checkout), your role changes from USER to BUYER_PREMIUM. Refreshing the property page immediately shows specifications and blueprints." },
                  { q: "Is there any extra fee when negotiating in a group?", a: "No. The subscription plan is the only membership charge. All bulk price negotiations and cashback operations are processed without surcharge." },
                  { q: "Can I cancel my subscription any time?", a: "Yes. Monthly and quarterly subscriptions can be configured to not auto-renew. Lifetime memberships have one billing cycle and never expire." },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/80">
                    <h4 className="font-display text-sm font-black text-slate-900 flex items-center gap-2">
                      <HelpCircle size={16} className="text-[#e34b32] shrink-0" />
                      <span>{item.q}</span>
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 font-semibold pl-6">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </main>
  );
}
