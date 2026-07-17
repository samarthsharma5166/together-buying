"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSubscriptionPlansAdmin,
  createSubscriptionPlanAdmin,
  updateSubscriptionPlanAdmin,
  deleteSubscriptionPlanAdmin,
  clearFormError,
} from "@/store/slices/subscriptionSlice";
import { SubscriptionPlan } from "@/lib/api";
import {
  CreditCard,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  FolderOpen,
  X,
  TrendingUp,
  Percent,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BILLING_TYPES = [
  { value: "MONTHLY", label: "Monthly Billing" },
  { value: "QUARTERLY", label: "Quarterly Billing" },
  { value: "YEARLY", label: "Yearly Billing" },
  { value: "LIFE_TIME", label: "One-time / Lifetime" },
];

export default function AdminSubscriptionsPage() {
  const dispatch = useAppDispatch();
  const { plans, loading, error, formSubmitting, formError } = useAppSelector(
    (state) => state.subscription
  );

  // Modal State variables
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);

  // Form Fields State variables
  const [type, setType] = useState<string>("MONTHLY");
  const [price, setPrice] = useState<string>("");

  // Load data on mount
  useEffect(() => {
    dispatch(fetchSubscriptionPlansAdmin());
  }, [dispatch]);

  // Handle opening Create Form
  const handleOpenCreate = () => {
    setEditingPlan(null);
    setType("MONTHLY");
    setPrice("");
    dispatch(clearFormError());
    setIsModalOpen(true);
  };

  // Handle opening Edit Form
  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setType(plan.type);
    setPrice(String(plan.price));
    dispatch(clearFormError());
    setIsModalOpen(true);
  };

  // Handle opening Delete Confirm
  const handleOpenDelete = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan);
    setIsDeleteOpen(true);
  };

  // Handle Form Submit (Create or Update Plan)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearFormError());

    const body = {
      type,
      price: Number(price),
    };

    try {
      if (editingPlan) {
        await dispatch(
          updateSubscriptionPlanAdmin({ id: editingPlan.id, body })
        ).unwrap();
      } else {
        await dispatch(createSubscriptionPlanAdmin(body)).unwrap();
      }
      setIsModalOpen(false);
    } catch (err) {
      // Handled in reducer formError
    }
  };

  // Handle Confirm Plan Delete
  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    try {
      await dispatch(deleteSubscriptionPlanAdmin(planToDelete.id)).unwrap();
      setIsDeleteOpen(false);
      setPlanToDelete(null);
    } catch (err) {
      // Handled in reducer
    }
  };

  // Calculated Stats
  const totalPlans = plans.length;
  const avgMonthlyEquivalent =
    plans.length > 0
      ? (
          plans.reduce((acc, curr) => {
            if (curr.type === "MONTHLY") return acc + curr.price;
            if (curr.type === "QUARTERLY") return acc + curr.price / 3;
            if (curr.type === "YEARLY") return acc + curr.price / 12;
            return acc; // Ignore lifetime for monthly average
          }, 0) / plans.filter((p) => p.type !== "LIFE_TIME").length || 1
        ).toFixed(0)
      : "0";

  const lifetimeCount = plans.filter((p) => p.type === "LIFE_TIME").length;

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight text-slate-800 md:text-3xl">
            Subscription Plans
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage buyer membership plans, pricing configurations, and subscription types.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#e34b32] to-[#f06e54] text-white font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition duration-150 cursor-pointer w-full sm:w-auto"
        >
          <Plus size={16} /> Create Subscription Plan
        </button>
      </div>

      {/* KPI Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#e34b32]/5 flex items-center justify-center text-[#e34b32]">
            <CreditCard size={22} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Active Plans</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">{totalPlans}</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Avg Monthly Rate</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">₹{Number(avgMonthlyEquivalent).toLocaleString()}/mo</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Lifetime Plans Available</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">{lifetimeCount}</p>
          </div>
        </div>
      </div>

      {/* Grid of Plans */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-3xl border border-slate-100 bg-white p-6 space-y-4 animate-pulse">
              <div className="h-8 w-1/3 bg-slate-100 rounded-lg" />
              <div className="h-12 w-1/2 bg-slate-100 rounded-lg" />
              <div className="h-10 bg-slate-50 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-red-200 bg-red-50/20 text-red-600">
          <AlertTriangle size={32} className="mx-auto text-red-500 mb-3" />
          <p className="font-bold">{error}</p>
          <button
            onClick={() => dispatch(fetchSubscriptionPlansAdmin())}
            className="mt-4 px-4 py-2 text-xs font-bold border border-red-200 bg-white rounded-xl hover:bg-red-50 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-500">
          <FolderOpen size={36} className="mx-auto text-slate-300 mb-3" />
          <p className="font-bold text-sm">No subscription plans found</p>
          <p className="text-xs text-slate-400 mt-1">
            Create a new subscription plan to populate this section.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const planDetails = BILLING_TYPES.find((t) => t.value === plan.type);
            const displayType = planDetails ? planDetails.label : plan.type;
            const cycleText =
              plan.type === "MONTHLY"
                ? "per month"
                : plan.type === "QUARTERLY"
                ? "per quarter"
                : plan.type === "YEARLY"
                ? "per year"
                : "pay once, use forever";

            return (
              <div
                key={plan.id}
                className="group flex flex-col justify-between rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-2.5 py-0.75 rounded-full border shadow-sm",
                        plan.type === "LIFE_TIME"
                          ? "bg-purple-50 text-purple-700 border-purple-100"
                          : plan.type === "YEARLY"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : plan.type === "QUARTERLY"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      )}
                    >
                      {plan.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Created: {new Date(plan.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-black text-slate-800 mt-4">
                    {displayType}
                  </h3>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">
                      ₹{plan.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">/{cycleText}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100/80 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    title="Edit Plan"
                    className="p-2 text-slate-400 hover:text-[#e34b32] hover:bg-slate-50 rounded-xl transition cursor-pointer"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(plan)}
                    title="Delete Plan"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-out Drawer Modal for Create/Edit Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 md:p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative h-full w-full max-w-md bg-white p-6 shadow-2xl z-50 flex flex-col md:rounded-3xl md:h-[80vh] overflow-hidden animate-reveal-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-display text-lg font-black text-slate-800">
                  {editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure plan rates and membership cycles for buyers.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 pb-6">
              {formError && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 flex gap-2.5 text-xs text-rose-600 font-bold leading-tight">
                  <AlertTriangle size={15} className="shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-400">Billing Type / Cycle *</label>
                <select
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition cursor-pointer"
                >
                  {BILLING_TYPES.map((bt) => (
                    <option key={bt.value} value={bt.value}>
                      {bt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-400">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 3999"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                />
              </div>

              <div className="border-t border-slate-100 pt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl border border-slate-200 bg-white font-bold text-xs text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer disabled:opacity-60"
                >
                  {formSubmitting ? "Saving changes..." : editingPlan ? "Save Details" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsDeleteOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-50 text-center border border-slate-100 animate-reveal-up">
            <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="font-display text-lg font-black text-slate-800">
              Delete Subscription Plan?
            </h3>
            <p className="text-xs text-slate-400 mt-2 px-2">
              Are you sure you want to delete the plan:{" "}
              <span className="font-bold text-slate-700">
                "{BILLING_TYPES.find((t) => t.value === planToDelete.type)?.label || planToDelete.type} - ₹
                {planToDelete.price.toLocaleString()}"
              </span>
              ? This action cannot be undone and will prevent new users from choosing this plan.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-xs text-slate-500 hover:bg-slate-50 transition cursor-pointer"
              >
                Keep Plan
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
