"use client";

import { useEffect, useState } from "react";
import { getProperties, getDevelopers, Property, Developer } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import { Building2, Briefcase, Users, TrendingUp, ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [properties, setProperties] = useState<Property[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const { properties: props } = await getProperties();
        const devs = await getDevelopers();
        setProperties(props || []);
        setDevelopers(devs || []);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200"></div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-[2rem] bg-slate-200"></div>
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-[2.5rem] bg-slate-200"></div>
      </div>
    );
  }

  const activePropertiesCount = properties.length;
  const activeDevelopersCount = developers.length;
  // Mock leads & active groups for demonstration
  const totalLeadsCount = 42;
  const activeGroupsCount = 7;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#e34b32]">Dashboard</p>
          <h1 className="font-display text-3xl font-black text-slate-800 mt-1">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">Here's a snapshot of the TogetherBuying portal activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/properties/new"
            className="flex items-center gap-2 rounded-2xl bg-[#e34b32] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[#d9462e] hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Plus size={16} /> New Property
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Properties Stat */}
        <div className="group rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff3ef] text-[#e34b32] transition-colors group-hover:bg-[#e34b32] group-hover:text-white">
              <Building2 size={22} />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendingUp size={11} /> +12%
            </span>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-400">Total Properties</p>
          <h3 className="font-display text-3xl font-black text-slate-800 mt-1">{activePropertiesCount}</h3>
        </div>

        {/* Developers Stat */}
        <div className="group rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 transition-colors group-hover:bg-[#e34b32] group-hover:text-white">
              <Briefcase size={22} />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              Stable
            </span>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-400">Developer Partners</p>
          <h3 className="font-display text-3xl font-black text-slate-800 mt-1">{activeDevelopersCount}</h3>
        </div>

        {/* Leads Stat */}
        <div className="group rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-[#e34b32] group-hover:text-white">
              <Users size={22} />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Active
            </span>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-400">Total Buyer Leads</p>
          <h3 className="font-display text-3xl font-black text-slate-800 mt-1">{totalLeadsCount}</h3>
        </div>

        {/* Group Buys Stat */}
        <div className="group rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-[#e34b32] group-hover:text-white">
              <TrendingUp size={22} />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              Hot
            </span>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-400">Active Group Buys</p>
          <h3 className="font-display text-3xl font-black text-slate-800 mt-1">{activeGroupsCount}</h3>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Properties list */}
        <div className="lg:col-span-2 rounded-[2.5rem] border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-black text-slate-800">Recent Listings</h2>
              <p className="text-xs text-slate-500 mt-0.5">Lately added properties on the platform</p>
            </div>
            <Link href="/admin/properties" className="text-xs font-black text-[#e34b32] hover:text-[#d9462e] flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {properties.slice(0, 4).map((prop) => (
              <div key={prop.id} className="flex items-center justify-between py-4 group">
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-[#e34b32] transition-colors">{prop.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{prop.locality}, {prop.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 px-3 py-1 rounded-xl">
                    {prop.propertyType}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">₹{(Number(prop.minPrice || 0) / 10000000).toFixed(2)} Cr+</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Developer List */}
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-black text-slate-800">Developer Partners</h2>
              <p className="text-xs text-slate-500 mt-0.5">Top brand associations</p>
            </div>
          </div>
          <div className="space-y-4">
            {developers.slice(0, 4).map((dev) => (
              <div key={dev.id} className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xs font-black text-slate-700 border border-slate-200">
                  {dev.companyName[0]}
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800">{dev.companyName}</p>
                  <p className="text-[10px] text-slate-500">{dev.headquartersCity || "India"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
