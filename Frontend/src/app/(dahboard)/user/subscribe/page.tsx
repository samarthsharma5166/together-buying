"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUserSubscriptions } from "@/store/slices/subscriptionSlice";
import { 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  Calendar, 
  Users, 
  ArrowRight, 
  Building, 
  Check, 
  Zap, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

const FREE_BENEFITS = [
  "Browse listing search filters",
  "View public property summary cards",
  "Calculate basic mortgage estimation EMIs",
];

const PREMIUM_BENEFITS = [
  "Browse listing search filters",
  "View public property summary cards",
  "Calculate basic mortgage estimation EMIs",
  "Access comprehensive developer layout maps",
  "Direct RM callbacks & WhatsApp channels",
  "Join negotiating project circles & bulk deals",
  "100% broker cashback commission returns",
];

export default function UserSubscribePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { userSubscriptions, userSubscriptionsLoading, userSubscriptionsError } = useAppSelector(
    (state) => state.subscription
  );

  useEffect(() => {
    if (user) {
      dispatch(fetchUserSubscriptions());
    }
  }, [user, dispatch]);

  const activeSub = userSubscriptions.find((sub) => sub.status === "ACTIVE");
  const isPremium = user?.role === "BUYER_PREMIUM" || !!activeSub;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (expiresAtStr?: string | null) => {
    if (!expiresAtStr) return null;
    const expiry = new Date(expiresAtStr).getTime();
    const now = new Date().getTime();
    const diff = expiry - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = activeSub ? getDaysRemaining(activeSub.expiresAt) : null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-800">Subscription Desk</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your membership status, unlock premium negotiating circles, and view your billing receipts.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {/* Main Status Dashboard */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Main Status Card & Actions */}
        <div className="md:col-span-2 space-y-6">
          {isPremium ? (
            /* Active Premium Plan Card */
            <div className="relative overflow-hidden rounded-[2rem] border border-[#e34b32]/20 bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-950 p-8 text-white shadow-xl shadow-orange-500/5">
              <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#e34b32]/10 blur-3xl" />
              
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e34b32] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-md shadow-orange-500/25">
                    <Sparkles size={12} className="animate-pulse" /> Premium Active
                  </span>
                  <h2 className="font-display text-3xl font-black tracking-tight mt-2">
                    {activeSub?.plan?.type ? activeSub.plan.type.replace("_", " ") : "VIP CLUB PLAN"}
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold">
                    Enjoying full negotiation circle discounts, developer layouts, and direct RM assistance.
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Plan Cost</p>
                  <p className="font-display text-3xl font-black text-[#e34b32]">
                    {activeSub ? formatPrice(activeSub.amount) : "N/A"}
                  </p>
                </div>
              </div>

              {/* Expiry Details Grid */}
              <div className={`mt-8 grid gap-4 border-t border-slate-800 pt-6 ${
                activeSub?.plan?.type === "LIFE_TIME" ? "grid-cols-1" : "grid-cols-2"
              }`}>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mb-1">
                    <Calendar size={14} />
                    <span>Purchase Date</span>
                  </div>
                  <p className="text-sm font-black text-slate-200">
                    {formatDate(activeSub?.createdAt)}
                  </p>
                </div>
                {activeSub?.plan?.type !== "LIFE_TIME" && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mb-1">
                      <Clock size={14} />
                      <span>Expiry / Renewal Date</span>
                    </div>
                    <p className="text-sm font-black text-slate-200">
                      {activeSub?.expiresAt ? formatDate(activeSub.expiresAt) : "Never Expires"}
                    </p>
                  </div>
                )}
              </div>

              {/* Banner notification for remaining days */}
              {daysRemaining !== null && activeSub?.plan?.type !== "LIFE_TIME" && (
                <div className="mt-6 flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-slate-300">
                  <AlertCircle size={16} className="text-[#e34b32]" />
                  <span>
                    You have <strong className="text-white">{daysRemaining} days</strong> remaining on your active premium cycle.
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Free Standard Plan Card */
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 border border-slate-200">
                    Standard Access
                  </span>
                  <h2 className="font-display text-3xl font-black text-slate-900 tracking-tight mt-2">
                    Free Membership
                  </h2>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md">
                    You are on our basic tier. You can view properties and estimate basic EMIs, but cannot view developer floor plans, coordinate with RMs, or join group negotiation pools.
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Monthly Price</p>
                  <p className="font-display text-3xl font-black text-slate-800">
                    ₹0
                  </p>
                </div>
              </div>

              {/* Upgrade CTA Section */}
              <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-800">Ready to unlock wholesale rates?</h4>
                  <p className="text-xs text-slate-400 font-semibold">Join group buys and unlock maximum discounts.</p>
                </div>
                
                <Link
                  href="/subscribe"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e34b32] hover:bg-[#d9462e] text-white px-6 py-3.5 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                >
                  Explore Premium Plans <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}

          {/* Member Benefits Comparison */}
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
            <h3 className="font-display text-lg font-black text-slate-800 mb-6">Your Benefits Comparison</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Free features list */}
              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100/60">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                  <span>Standard Tier</span>
                  {!isPremium && <span className="text-[9px] text-[#e34b32] bg-[#fff3ef] px-2 py-0.5 rounded-full font-black border border-red-100">Active</span>}
                </h4>
                <ul className="space-y-3">
                  {FREE_BENEFITS.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs font-bold text-slate-600">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 mt-0.5">
                        <Check size={10} className="stroke-[3]" />
                      </div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium features list */}
              <div className={`rounded-2xl p-5 border ${
                isPremium 
                  ? "bg-[#fffcfb] border-[#e34b32]/30 shadow-inner" 
                  : "bg-slate-50/50 border-slate-200/60"
              }`}>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                  <span className={isPremium ? "text-[#e34b32]" : ""}>Premium VIP Tier</span>
                  {isPremium && <span className="text-[9px] text-[#e34b32] bg-[#fff3ef] px-2 py-0.5 rounded-full font-black border border-red-100">Active</span>}
                </h4>
                <ul className="space-y-3">
                  {PREMIUM_BENEFITS.map((benefit, idx) => {
                    const isExtra = !FREE_BENEFITS.includes(benefit);
                    return (
                      <li 
                        key={idx} 
                        className={`flex items-start gap-2 text-xs font-bold ${
                          isPremium 
                            ? "text-slate-700" 
                            : isExtra 
                            ? "text-slate-400" 
                            : "text-slate-600"
                        }`}
                      >
                        <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                          isPremium 
                            ? "bg-emerald-100 text-emerald-600" 
                            : isExtra
                            ? "bg-slate-100 text-slate-300"
                            : "bg-slate-200 text-slate-600"
                        }`}>
                          <Check size={10} className="stroke-[3]" />
                        </div>
                        <span>{benefit}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Quick stats & summaries */}
        <div className="space-y-6">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="font-display text-md font-black text-slate-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="text-[#e34b32]" size={18} />
              <span>Membership Info</span>
            </h3>
            
            <div className="space-y-4 text-xs font-bold">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-400">Account Role</span>
                <span className="text-slate-700 capitalize font-black">{user?.role?.toLowerCase() || "User"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-400">Negotiation Access</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                  isPremium 
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                    : "bg-slate-100 border-slate-200 text-slate-500"
                }`}>
                  {isPremium ? "UNLOCKED" : "LOCKED"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-400">Verification Level</span>
                <span className="text-slate-700 font-black">Verified Buyer</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400">Broker Cashback</span>
                <span className={isPremium ? "text-emerald-600 font-black" : "text-slate-400"}>
                  {isPremium ? "100% Guaranteed" : "Not eligible"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-slate-100 bg-gradient-to-br from-[#fffbfa] to-[#fff3ef] p-6 shadow-sm border-l-4 border-l-[#e34b32]">
            <h3 className="font-display text-md font-black text-slate-800 mb-2 flex items-center gap-2">
              <Zap className="text-[#e34b32]" size={18} />
              <span>Collective Savings</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">
              GroupBuying enables buyers to purchase luxury property units collectively to squeeze bulk developer discounts.
            </p>
            <div className="bg-white rounded-2xl p-3.5 border border-red-100 shadow-sm text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-0.5">Average Premium Discount</p>
              <p className="font-display text-2xl font-black text-[#e34b32]">12% - 18%</p>
              <p className="text-[9px] text-emerald-600 font-bold mt-1">₹15 Lakhs - ₹80 Lakhs Saved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Receipt & Transactions History */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-black text-slate-800">Billing History</h3>
            <p className="text-xs text-slate-400 mt-1 font-semibold">
              Track invoices, dates, status, and payment details of all transactions.
            </p>
          </div>
        </div>

        {userSubscriptionsLoading ? (
          <div className="py-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e34b32] border-t-transparent mx-auto"></div>
            <p className="mt-3 text-xs font-bold text-slate-500 animate-pulse">Retrieving billing statements...</p>
          </div>
        ) : userSubscriptionsError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50/20 p-6 text-center text-red-600 font-semibold text-xs">
            {userSubscriptionsError}
          </div>
        ) : userSubscriptions.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200">
            <CreditCard className="mx-auto text-slate-300" size={32} />
            <p className="mt-3 text-xs text-slate-500 font-bold">No payment history found.</p>
          </div>
        ) : (
          /* Responsive Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="py-3 px-4 uppercase tracking-wider">Transaction ID</th>
                  <th className="py-3 px-4 uppercase tracking-wider">Plan Type</th>
                  <th className="py-3 px-4 uppercase tracking-wider">Amount Paid</th>
                  <th className="py-3 px-4 uppercase tracking-wider">Purchase Date</th>
                  <th className="py-3 px-4 uppercase tracking-wider">Expiry Date</th>
                  <th className="py-3 px-4 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-bold">
                {userSubscriptions.map((sub) => (
                  <tr key={sub.id} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-mono text-slate-400 font-medium">
                      {sub.id.substring(0, 8)}...{sub.id.substring(sub.id.length - 4)}
                    </td>
                    <td className="py-4 px-4 font-semibold uppercase tracking-wide">
                      {sub.plan?.type ? sub.plan.type.replace("_", " ") : "Custom Plan"}
                    </td>
                    <td className="py-4 px-4 text-slate-900 font-black">
                      {formatPrice(sub.amount)}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-500">
                      {formatDate(sub.createdAt)}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-500">
                      {sub.plan?.type === "LIFE_TIME" ? "Never Expires" : (sub.expiresAt ? formatDate(sub.expiresAt) : "Never Expires")}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        sub.status === "ACTIVE"
                          ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                          : "bg-slate-100 border-slate-200 text-slate-400"
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
