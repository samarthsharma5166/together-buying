"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRmGroups } from "@/store/slices/groupSlice";
import { Users, Briefcase, MessageSquare, Award, ArrowUpRight, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function RMDashboardPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { rmGroups, rmLoading, rmError } = useAppSelector((state) => state.group);

  // Fetch groups on mount
  useEffect(() => {
    if (user) {
      dispatch(fetchRmGroups());
    }
  }, [user, dispatch]);

  // Mock RM stats
  const activeGroupsCount = rmGroups.length;
  const assignedLeadsCount = 14;
  const activeChatsCount = 5;
  const closedDealsRate = "82%";

  const recentLeads = [
    { id: "lead-1", name: "Amit Sharma", property: "Godrej Miraya", budget: "₹5.5 Cr", status: "Follow up" },
    { id: "lead-2", name: "Priya Patel", property: "DLF Privana West", budget: "₹6.8 Cr", status: "Negotiating" },
    { id: "lead-3", name: "Suresh Gupta", property: "M3M Altitude", budget: "₹4.2 Cr", status: "Site Visit Scheduled" },
    { id: "lead-4", name: "Karan Johar", property: "Godrej Miraya", budget: "₹7.4 Cr", status: "Token Submitted" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[#e34b32]">RM Desk</p>
        <h1 className="font-display text-3xl font-black text-slate-800 mt-1">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-sm text-slate-500 mt-1">Track your assigned buyer groups, manage lead pipelines, and coordinate developer terms.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Groups */}
        <div className="group rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff3ef] text-[#e34b32] transition-colors group-hover:bg-[#e34b32] group-hover:text-white">
              <Users size={22} />
            </span>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-400">My Active Groups</p>
          <h3 className="font-display text-3xl font-black text-slate-800 mt-1">{activeGroupsCount}</h3>
        </div>

        {/* Assigned Leads */}
        <div className="group rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-[#e34b32] group-hover:text-white">
              <Briefcase size={22} />
            </span>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-400">Assigned Leads</p>
          <h3 className="font-display text-3xl font-black text-slate-800 mt-1">{assignedLeadsCount}</h3>
        </div>

        {/* Messages */}
        <div className="group rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-[#e34b32] group-hover:text-white">
              <MessageSquare size={22} />
            </span>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-400">Active Conversations</p>
          <h3 className="font-display text-3xl font-black text-slate-800 mt-1">{activeChatsCount}</h3>
        </div>

        {/* Success Rate */}
        <div className="group rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-[#e34b32] group-hover:text-white">
              <Award size={22} />
            </span>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-400">Group Closure Rate</p>
          <h3 className="font-display text-3xl font-black text-slate-800 mt-1">{closedDealsRate}</h3>
        </div>
      </div>

      {/* Main Content Panels */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* My Groups Listing */}
        <div className="lg:col-span-2 rounded-[2.5rem] border border-slate-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="font-display text-xl font-black text-slate-800">My Assigned Buyer Groups</h2>
            <p className="text-xs text-slate-500 mt-0.5">Monitoring progress towards target group sizes to unlock discounts</p>
          </div>
          
          <div className="space-y-6">
            {rmLoading ? (
              <div className="py-12 text-center text-slate-400">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e34b32] border-t-transparent mx-auto animate-spin"></div>
                <p className="mt-2 text-xs font-semibold animate-pulse">Loading assigned groups...</p>
              </div>
            ) : rmError ? (
              <div className="py-8 text-center text-red-500 text-xs font-semibold">
                {rmError}
              </div>
            ) : rmGroups.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold border border-dashed border-slate-200 rounded-[1.5rem] flex flex-col items-center justify-center gap-2">
                <Users size={32} className="text-slate-300 animate-pulse" />
                <p>No assigned groups found.</p>
              </div>
            ) : (
              rmGroups.map((group) => {
                const progress = Math.min(100, Math.round(((group.current_members || 0) / group.target_group_size) * 100));
                const propertyTitle = group.property?.title || "Property Listing";
                const locality = group.property ? `${group.property.locality || ""}, ${group.property.city || ""}` : "Unknown Location";
                
                return (
                  <div key={group.id} className="border border-slate-100 rounded-2xl p-5 hover:border-slate-200 transition-all space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-800">{group.name}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Property: <strong className="text-slate-700">{propertyTitle}</strong></p>
                        <p className="text-xs text-slate-400 mt-0.5">{locality}</p>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#e34b32] bg-[#fff3ef] px-3 py-1 rounded-full border border-orange-100/50">
                          Target: {group.target_discount}% Off
                        </span>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 flex items-center justify-start sm:justify-end gap-1">
                          <Clock size={10} /> {group.status.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-500">
                        <span>Group Progress: {group.current_members}/{group.target_group_size} buyers</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#e34b32] to-[#f06e54]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Assigned Leads Table */}
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-black text-slate-800">Assigned Leads</h2>
              <p className="text-xs text-slate-500 mt-0.5">Follow up actions required</p>
            </div>
            <Link href="/rm/leads" className="text-xs font-black text-[#e34b32] hover:text-[#d9462e] flex items-center gap-1">
              View All <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentLeads.slice(0, 4).map((lead) => (
              <div key={lead.id} className="py-3.5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800">{lead.name}</p>
                  <p className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                    {lead.budget}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[10px] text-slate-400">Target: {lead.property}</p>
                  <span className="text-[10px] font-black text-[#e34b32] flex items-center gap-1">
                    <CheckCircle size={10} className="text-[#e34b32]" /> {lead.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
