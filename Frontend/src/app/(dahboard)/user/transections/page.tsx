"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUserTransections } from "@/store/slices/transectionSlice";
import { 
  CreditCard, 
  Calendar, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Receipt,
  Download
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default function UserTransectionsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { transections, loading, error } = useAppSelector((state) => state.transection);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserTransections());
    }
  }, [user, dispatch]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Compute metric cards stats
  const successfulTransections = transections.filter((t) => t.status === "SUCCESS");
  const pendingTransections = transections.filter((t) => t.status === "PENDING");
  
  const totalSpent = successfulTransections.reduce((acc, t) => acc + t.amount, 0);

  const handlePrintReceipt = (transectionId: string) => {
    // Basic mock receipt display/print trigger
    alert(`Generating invoice receipt for transaction ${transectionId}... (Mock Download)`);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-800">Transaction Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your deposit histories, Razorpay billing orders, and invoice details.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Card 1: Total Spent */}
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Total Paid</span>
            <p className="font-display text-2xl font-black text-slate-800">
              {formatPrice(totalSpent)}
            </p>
            <p className="text-[9px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp size={10} /> Unlocked Premium Benefits
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#e34b32]">
            <Receipt size={22} />
          </div>
        </div>

        {/* Card 2: Successful Payments */}
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Success Ratio</span>
            <p className="font-display text-2xl font-black text-slate-800">
              {successfulTransections.length} / {transections.length}
            </p>
            <p className="text-[9px] text-slate-400 font-semibold">
              Cleared & Active Subscriptions
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle size={22} />
          </div>
        </div>

        {/* Card 3: Pending Invoices */}
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Pending Verification</span>
            <p className="font-display text-2xl font-black text-slate-800">
              {pendingTransections.length}
            </p>
            <p className="text-[9px] text-slate-400 font-semibold">
              Awaiting webhook confirmation
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertCircle size={22} />
          </div>
        </div>
      </div>

      {/* Main Ledger list */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
        <h3 className="font-display text-lg font-black text-slate-800 mb-6">Payment Ledger History</h3>

        {loading ? (
          <div className="py-16 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e34b32] border-t-transparent mx-auto"></div>
            <p className="mt-3 text-xs font-bold text-slate-500 animate-pulse">Consulting invoice databases...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50/20 p-6 text-center text-red-600 font-semibold text-xs">
            {error}
          </div>
        ) : transections.length === 0 ? (
          <div className="py-16 text-center rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
              <CreditCard size={32} />
            </div>
            <div>
              <h4 className="font-display text-md font-black text-slate-800">No Transactions Found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No billing transactions are mapped to this profile yet. Upgrade to premium to register payments.
              </p>
            </div>
            <Link
              href="/subscribe"
              className="inline-flex items-center gap-2 rounded-xl bg-[#e34b32] hover:bg-[#d9462e] text-white px-5 py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
            >
              Get Premium VIP
            </Link>
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="py-3 px-4 uppercase tracking-wider">Transaction ID</th>
                  <th className="py-3 px-4 uppercase tracking-wider">Timestamp</th>
                  <th className="py-3 px-4 uppercase tracking-wider">Amount</th>
                  <th className="py-3 px-4 uppercase tracking-wider">Status</th>
                  {/* <th className="py-3 px-4 uppercase tracking-wider text-right">Invoice</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-bold">
                {transections.map((t) => (
                  <tr key={t.id} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-mono text-slate-400 font-medium">
                      {t.id}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-500">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-slate-900 font-black">
                      {formatPrice(t.amount)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        t.status === "SUCCESS"
                          ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                          : t.status === "PENDING"
                          ? "bg-amber-50 border-amber-100 text-amber-600"
                          : "bg-rose-50 border-rose-100 text-rose-600"
                      }`}>
                        {t.status === "SUCCESS" && <CheckCircle size={10} />}
                        {t.status === "PENDING" && <AlertCircle size={10} />}
                        {t.status === "FAILED" && <XCircle size={10} />}
                        {t.status}
                      </span>
                    </td>
                    {/* <td className="py-4 px-4 text-right">
                      {t.status === "SUCCESS" ? (
                        <button
                          onClick={() => handlePrintReceipt(t.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 shadow-xs hover:border-slate-300 transition-colors"
                        >
                          <Download size={10} /> Receipt
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">-</span>
                      )}
                    </td> */}
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
