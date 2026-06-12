"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeSubscriptionModal } from "@/store/slices/subscriptionSlice";
import { fetchCurrentUser } from "@/store/slices/authSlice";
import { adminListSubscriptionPlans, type SubscriptionPlan } from "@/lib/api";
import { payWithRazorpay } from "@/lib/razorpay";
import { X, Sparkles, Check, CreditCard, ShieldCheck, Zap, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const PLAN_BENEFITS = [
  "Unlock full detailed specifications & layout plans",
  "Direct phone & WhatsApp contact with Relationship Managers",
  "Join project-specific group buying circles",
  "Unlock bulk developer discounts (up to 15% savings)",
  "Request live virtual site visits & document checks",
];

export function SubscriptionModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.subscription.isSubscriptionModalOpen);
  const user = useAppSelector((state) => state.auth.user);
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);
  const [successMode, setSuccessMode] = useState(false);

  // Fetch plans when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      setError(null);
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
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (payingPlanId) return; // Prevent closing while transaction is in progress
    setSuccessMode(false);
    dispatch(closeSubscriptionModal());
  };

  const handlePurchase = async (planId: string) => {
    if (!user) {
      setError("Please sign in to purchase a subscription.");
      return;
    }

    setPayingPlanId(planId);
    setError(null);

    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    try {
      await payWithRazorpay({
        planId,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        userPhone: user.phone || "9999999999",
        onSuccess: async (response) => {
          console.log("[Subscription Modal] Razorpay payment success", response);
          setPayingPlanId(null);
          setSuccessMode(true);
          // Refresh user data immediately
          await dispatch(fetchCurrentUser());
        },
        onFailure: (err) => {
          setError(err.description || err.message || "Payment transaction failed.");
          setPayingPlanId(null);
        },
        onMockSuccess: async () => {
          console.log("[Subscription Modal] Simulated payment success");
          setPayingPlanId(null);
          setSuccessMode(true);
          // Refresh user data immediately
          await dispatch(fetchCurrentUser());
        },
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setPayingPlanId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Box */}
      <div className="relative z-[160] w-full max-w-4xl overflow-hidden rounded-[2.5rem] bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-300 max-h-[90vh] flex flex-col premium-border">
        {/* Top Header Strip */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={handleClose}
            disabled={!!payingPlanId}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {successMode ? (
          /* SUCCESS SCREEN */
          <div className="p-8 md:p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px] overflow-y-auto">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6 shadow-md shadow-emerald-100 animate-bounce">
              <ShieldCheck size={44} className="stroke-[2.5]" />
            </div>
            
            <h2 className="font-display text-3xl font-black text-slate-900">
              Welcome to the Premium Club!
            </h2>
            
            <p className="mt-4 text-base text-slate-600 max-w-lg leading-relaxed">
              Your payment was successfully verified, and your membership status has been upgraded to <strong className="text-[#e34b32]">BUYER_PREMIUM</strong>.
              You now have full unrestricted access to premium property detail layouts, RM contacts, and group discounts.
            </p>

            <button
              onClick={handleClose}
              className="mt-8 rounded-full bg-slate-900 px-8 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg hover:bg-[#e34b32] transition-colors"
            >
              Start Exploring Properties
            </button>
          </div>
        ) : (
          /* PAYMENT & OPTIONS SCREEN */
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff3ef] px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#e34b32]">
                <Sparkles size={14} /> Join Together Buying Premium
              </span>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                Unlock Unbeatable Developer Deals
              </h2>
              <p className="mt-3 text-sm text-slate-500">
                Unlock project-specific buyer groups, expert relationship managers, and direct bulk pricing.
              </p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 p-4 border border-red-100 text-red-700 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[1.1fr_1.2fr] items-start">
              {/* Left Column: Benefits Checklist */}
              <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100">
                <h3 className="font-display text-lg font-black text-slate-900 mb-4">
                  What is included in Premium?
                </h3>
                
                <ul className="space-y-3.5">
                  {PLAN_BENEFITS.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
                        <Check size={12} className="stroke-[3]" />
                      </div>
                      <span className="text-sm font-semibold text-slate-600">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 border-t border-slate-200/80 pt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff3ef] text-[#e34b32]">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Direct Group Power</h4>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      Join other serious buyers to command lower developer quotes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing Plans Selection */}
              <div>
                <h3 className="font-display text-lg font-black text-slate-900 mb-4">
                  Choose your subscription plan
                </h3>

                {loading ? (
                  <div className="py-12 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#e34b32] border-t-transparent mx-auto"></div>
                    <p className="mt-3 text-xs font-bold text-slate-400">Fetching active plans...</p>
                  </div>
                ) : plans.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200">
                    <CreditCard size={32} className="mx-auto text-slate-300" />
                    <p className="mt-3 text-sm font-bold text-slate-500">No active pricing plans found.</p>
                  </div>
                ) : (
                  <div className="grid gap-3.5">
                    {plans.map((plan) => {
                      const isPaying = payingPlanId === plan.id;
                      const badgeText = plan.type === "YEARLY" ? "Recommended" : plan.type === "LIFE_TIME" ? "Ultimate Saving" : null;
                      
                      return (
                        <div
                          key={plan.id}
                          className={`relative rounded-2xl p-4.5 border transition-all ${
                            badgeText 
                              ? "border-[#e34b32] bg-orange-50/10 shadow-sm" 
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          {badgeText && (
                            <span className="absolute -top-2.5 right-4 rounded-full bg-[#e34b32] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
                              {badgeText}
                            </span>
                          )}

                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                                {plan.type.replace("_", " ")} Membership
                              </h4>
                              <p className="mt-1 font-display text-2xl font-black text-slate-900">
                                {formatPrice(plan.price)}
                              </p>
                            </div>

                            <button
                              onClick={() => handlePurchase(plan.id)}
                              disabled={!!payingPlanId}
                              className={`rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all shadow-md ${
                                isPaying
                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                  : badgeText
                                  ? "bg-[#e34b32] text-white hover:bg-[#d9462e] shadow-orange-100"
                                  : "bg-slate-900 text-white hover:bg-slate-800"
                              }`}
                            >
                              {isPaying ? (
                                <span className="flex items-center gap-1.5">
                                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></span>
                                  Processing
                                </span>
                              ) : (
                                "Buy Plan"
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
