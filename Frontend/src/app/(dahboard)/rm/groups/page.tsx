"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRmGroups } from "@/store/slices/groupSlice";
import { 
  Users, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone, 
  Calendar, 
  Building, 
  CheckCircle, 
  Clock, 
  XCircle,
  Compass
} from "lucide-react";

export default function RMGroupsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { rmGroups, rmLoading, rmError, rmMeta } = useAppSelector((state) => state.group);

  const totalPages = rmMeta?.totalPages || 0;
  const page = rmMeta?.page || 1;
  const limit = rmMeta?.limit || 10;
  const total = rmMeta?.total || 0;

  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(inputValue);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  // Fetch groups when query dependencies change
  useEffect(() => {
    if (user) {
      dispatch(
        fetchRmGroups({
          search: searchQuery,
          status: statusFilter,
          page: currentPage,
          limit: itemsPerPage,
        })
      );
    }
  }, [user, searchQuery, statusFilter, currentPage, dispatch]);

  const toggleExpand = (groupId: string) => {
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
    } else {
      setExpandedGroupId(groupId);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to first page on status change
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CREATING":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            <Compass size={11} className="animate-spin duration-1000" /> CREATING
          </span>
        );
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <CheckCircle size={11} /> ACTIVE
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            <CheckCircle size={11} /> COMPLETED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            <XCircle size={11} /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#e34b32]">RM Workspace</p>
          <h1 className="font-display text-3xl font-black text-slate-800 mt-1">My Assigned Groups</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your buyer communities, review active member lists, and check progress towards discount goals.
          </p>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by group name, property, or location..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all hover:border-slate-200 focus:border-[#e34b32] focus:bg-white"
          />
        </div>

        {/* Status Filter */}
        <div className="relative w-full md:w-64 flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none transition-all hover:border-slate-200 focus:border-[#e34b32] focus:bg-white cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="CREATING">Creating</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Main Groups Listing */}
      <div className="space-y-6">
        {rmLoading ? (
          <div className="py-24 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e34b32] border-t-transparent mx-auto"></div>
            <p className="mt-4 text-sm font-bold text-slate-500 animate-pulse">Fetching assigned groups...</p>
          </div>
        ) : rmError ? (
          <div className="rounded-[2rem] border border-red-100 bg-red-50/30 p-8 text-center text-red-600 font-semibold text-sm">
            {rmError}
          </div>
        ) : rmGroups.length === 0 ? (
          <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white py-16 px-6 text-center flex flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
              <Users size={32} />
            </div>
            <div>
              <h3 className="font-display text-lg font-black text-slate-800">No Groups Found</h3>
              <p className="text-sm text-slate-400 mt-1">
                {inputValue || statusFilter !== "ALL"
                  ? "Try adjusting your search query or status filter criteria."
                  : "You don't have any groups assigned to you yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {rmGroups.map((group) => {
              const progress = Math.min(
                100,
                Math.round(((group.current_members || 0) / group.target_group_size) * 100)
              );
              const propertyTitle = group.property?.title || "Property";
              const locationText = group.property
                ? `${group.property.locality || ""}, ${group.property.city || ""}`
                : "Unknown Location";
              const isExpanded = expandedGroupId === group.id;

              return (
                <div
                  key={group.id}
                  className="group rounded-[2.5rem] border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden"
                >
                  {/* Card Header & Main Group Stats */}
                  <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-display text-xl font-black text-slate-800">
                          {group.name}
                        </h2>
                        {getStatusBadge(group.status)}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Building size={14} className="text-slate-400" />
                          {propertyTitle}
                        </span>
                        <span className="text-slate-400">{locationText}</span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          Created {formatDate(group.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="w-full lg:w-72 space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-500">
                        <span>Group Progress: {group.current_members}/{group.target_group_size} buyers</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#e34b32] to-[#f06e54]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-[#e34b32] bg-[#fff3ef] px-3 py-1.5 rounded-xl border border-orange-100/30">
                        <span>Target Discount:</span>
                        <span>{group.target_discount}% Off</span>
                      </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => toggleExpand(group.id)}
                      className="flex items-center justify-center gap-2 self-start lg:self-center px-4 py-2.5 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors group"
                    >
                      {isExpanded ? (
                        <>
                          Hide Members <ChevronUp size={16} className="text-slate-500" />
                        </>
                      ) : (
                        <>
                          View Members ({group.current_members}) <ChevronDown size={16} className="text-slate-500 group-hover:translate-y-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expanded Members list section */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/40 p-6 md:p-8 space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Users size={14} /> Registered Group Members ({group.members?.length || 0})
                      </h3>

                      {!group.members || group.members.length === 0 ? (
                        <p className="text-xs font-bold text-slate-400 py-2">No members have joined this group yet.</p>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {group.members.map((member) => {
                            const name = `${member.user.firstName || ""} ${member.user.lastName || ""}`.trim() || "Unknown User";
                            return (
                              <div
                                key={member.id}
                                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-3"
                              >
                                <div>
                                  <h4 className="text-sm font-black text-slate-800">{name}</h4>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                    Joined {formatDate(member.createdAt)}
                                  </p>
                                </div>

                                <div className="space-y-1.5 text-xs text-slate-600">
                                  <a
                                    href={`mailto:${member.user.email}`}
                                    className="flex items-center gap-2 hover:text-[#e34b32] transition-colors"
                                  >
                                    <Mail size={12} className="text-slate-400" />
                                    <span className="truncate">{member.user.email}</span>
                                  </a>
                                  {member.user.phone && (
                                    <a
                                      href={`tel:${member.user.phone}`}
                                      className="flex items-center gap-2 hover:text-[#e34b32] transition-colors"
                                    >
                                      <Phone size={12} className="text-slate-400" />
                                      <span>{member.user.phone}</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {!rmLoading && rmMeta && totalPages > 1 && (
        <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold text-slate-500">
            Showing {Math.min(total, (page - 1) * limit + 1)} to{" "}
            {Math.min(total, page * limit)} of {total} groups
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || rmLoading}
              className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  disabled={rmLoading}
                  className={`h-8 w-8 rounded-xl text-xs font-bold transition-colors ${
                    page === pageNumber
                      ? "bg-[#e34b32] text-white"
                      : "bg-slate-50 border border-slate-100 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages || rmLoading}
              className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
