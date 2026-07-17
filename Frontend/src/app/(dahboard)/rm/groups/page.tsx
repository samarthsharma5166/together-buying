"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRmGroups, fetchRmGroupsSummary } from "@/store/slices/groupSlice";
import { 
  Users, 
  Search, 
  Filter, 
  ChevronDown, 
  Building, 
  CheckCircle, 
  Compass,
  TrendingUp,
  FileText,
  AlertCircle
} from "lucide-react";
import { GroupDetailsDrawer } from "./GroupDetailsDrawer";
import { PropertyGroup } from "@/lib/api";
import { Button } from "@/components/button";

export default function RMGroupsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const { rmGroups, rmLoading, rmError, rmMeta, rmSummary } = useAppSelector((state) => state.group);

  // Read initial state from URL or use defaults
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">((searchParams.get("order") as "asc" | "desc") || "desc");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  // Debounced input state
  const [inputValue, setInputValue] = useState(searchQuery);

  const [selectedGroup, setSelectedGroup] = useState<PropertyGroup | null>(null);
  const itemsPerPage = 6; // Better for grid layouts (2x3 or 3x2)

  // Fetch Summary Cards on mount
  useEffect(() => {
    if (user) {
      dispatch(fetchRmGroupsSummary());
    }
  }, [user, dispatch]);

  // Sync URL parameters and fetch data whenever dependencies change
  useEffect(() => {
    if (!user) return;

    // Build URL query string
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    params.set("page", currentPage.toString());
    params.set("sortBy", sortBy);
    params.set("order", sortOrder);
    
    // Update URL without reload
    router.push(`?${params.toString()}`, { scroll: false });

    // Fetch groups
    dispatch(
      fetchRmGroups({
        search: searchQuery,
        status: statusFilter,
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        order: sortOrder,
      })
    );
  }, [user, searchQuery, statusFilter, currentPage, sortBy, sortOrder, dispatch, router]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery !== inputValue) {
        setSearchQuery(inputValue);
        setCurrentPage(1); // Reset to first page
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [inputValue, searchQuery]);

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: string) => {
    // Parse format "sortBy:order"
    const [field, dir] = newSort.split(":");
    setSortBy(field);
    setSortOrder(dir as "asc" | "desc");
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "GROUP_FORMING":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            <Compass size={11} className="animate-spin duration-1000" /> FORMING
          </span>
        );
      case "GROUP_ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <CheckCircle size={11} /> ACTIVE
          </span>
        );
      case "DEVELOPER_AGREED":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
            <CheckCircle size={11} /> DEV AGREED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            {status.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  const totalPages = rmMeta?.totalPages || 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-slate-900 mt-1">Group Management</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Monitor your assigned buyer communities, update statuses, and track discount target progress.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-[1.5rem] bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-600"><FileText size={18} /></div>
            <span className="text-xs font-black uppercase tracking-widest">Total Groups</span>
          </div>
          <p className="text-3xl font-display font-black text-slate-800">{rmSummary?.totalGroups || 0}</p>
        </div>
        <div className="rounded-[1.5rem] bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
          <div className="flex items-center gap-3 text-emerald-500 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle size={18} /></div>
            <span className="text-xs font-black uppercase tracking-widest">Active Groups</span>
          </div>
          <p className="text-3xl font-display font-black text-slate-800">{rmSummary?.activeGroups || 0}</p>
        </div>
        <div className="rounded-[1.5rem] bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
          <div className="flex items-center gap-3 text-blue-500 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Compass size={18} /></div>
            <span className="text-xs font-black uppercase tracking-widest">Groups Forming</span>
          </div>
          <p className="text-3xl font-display font-black text-slate-800">{rmSummary?.formingGroups || 0}</p>
        </div>
        <div className="rounded-[1.5rem] bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
          <div className="flex items-center gap-3 text-purple-500 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Users size={18} /></div>
            <span className="text-xs font-black uppercase tracking-widest">Total Customers</span>
          </div>
          <p className="text-3xl font-display font-black text-slate-800">{rmSummary?.totalCustomers || 0}</p>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="rounded-[2rem] border border-slate-100 bg-white p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by group name or project..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all hover:border-[#e34b32]/50 focus:border-[#e34b32] focus:bg-white focus:ring-4 focus:ring-[#e34b32]/10"
          />
        </div>

        <div className="flex w-full md:w-auto gap-4">
          {/* Status Filter */}
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 py-3 pl-11 pr-10 text-sm font-semibold text-slate-800 outline-none transition-all hover:border-[#e34b32]/50 focus:border-[#e34b32] focus:bg-white focus:ring-4 focus:ring-[#e34b32]/10 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="GROUP_FORMING">Group Forming</option>
              <option value="GROUP_ACTIVE">Group Active</option>
              <option value="NEGOTIATING_WITH_DEVELOPER">Negotiating</option>
              <option value="DEVELOPER_AGREED">Developer Agreed</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative w-full md:w-56">
            <TrendingUp className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 py-3 pl-11 pr-10 text-sm font-semibold text-slate-800 outline-none transition-all hover:border-[#e34b32]/50 focus:border-[#e34b32] focus:bg-white focus:ring-4 focus:ring-[#e34b32]/10 cursor-pointer"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="createdAt:asc">Oldest First</option>
              <option value="current_members:desc">Largest Groups First</option>
              <option value="name:asc">Name (A-Z)</option>
              <option value="updatedAt:desc">Recently Updated</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Groups Grid */}
      <div className="space-y-6">
        {rmLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse rounded-[2rem] border border-slate-100 bg-slate-50 h-[300px]" />
            ))}
          </div>
        ) : rmError ? (
          <div className="rounded-[2rem] border border-red-100 bg-red-50 p-8 flex flex-col items-center text-center">
            <AlertCircle className="text-red-500 mb-2" size={32} />
            <p className="text-red-700 font-bold">{rmError}</p>
          </div>
        ) : rmGroups.length === 0 ? (
          <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white py-20 px-6 text-center flex flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
              <Users size={32} />
            </div>
            <div>
              <h3 className="font-display text-xl font-black text-slate-800">No Groups Found</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                {inputValue || statusFilter !== "ALL"
                  ? "Try adjusting your search query or status filter criteria to find what you're looking for."
                  : "You don't have any groups assigned to you yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {rmGroups.map((group) => {
              const progress = Math.min(
                100,
                Math.round(((group.current_members || 0) / group.target_group_size) * 100)
              );
              
              return (
                <div
                  key={group.id}
                  className="group flex flex-col rounded-[2rem] border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                >
                  <div className="p-6 flex-1 space-y-5">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-display text-xl font-black text-slate-900 leading-tight line-clamp-2">
                          {group.name}
                        </h3>
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-2">
                          <Building size={14} className="text-slate-400" />
                          {group.property?.title || "Property"}
                        </p>
                      </div>
                      <div className="shrink-0">{getStatusBadge(group.status)}</div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>{group.current_members} / {group.target_group_size} Members</span>
                        <span className="text-[#e34b32]">{progress}% Target</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#e34b32] to-[#f06e54]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="border-t border-slate-50 p-4 bg-slate-50/50 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Target Disc: {group.target_discount}%
                    </span>
                    <Button variant="secondary" onClick={() => setSelectedGroup(group as any)}>
                      Manage Group
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-6">
            <span className="text-sm font-semibold text-slate-500">
              Showing page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <GroupDetailsDrawer 
        group={selectedGroup} 
        onClose={() => setSelectedGroup(null)} 
        onStatusUpdated={() => {
          // Re-fetch current page and summary
          dispatch(fetchRmGroups({ search: searchQuery, status: statusFilter, page: currentPage, limit: itemsPerPage, sortBy, order: sortOrder }));
          dispatch(fetchRmGroupsSummary());
        }}
      />
    </div>
  );
}
