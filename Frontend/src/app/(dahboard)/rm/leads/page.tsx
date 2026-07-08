"use client";

import { useEffect, useState } from "react";
import { getMyLeads, Lead, LeadStatus, LeadPriority } from "@/lib/api";
import { Search, Briefcase, Filter, ChevronDown, ChevronUp, User, Calendar, MapPin, Mail, Phone, AlertCircle } from "lucide-react";
import { LeadDrawer } from "./LeadDrawer";
import { Button } from "@/components/button";

export default function RMLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  // Drawer State
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(inputValue);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [inputValue]);

  useEffect(() => {
    fetchLeads();
  }, [page, search, statusFilter, priorityFilter, sortBy, order]);

  async function fetchLeads() {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyLeads({
        page,
        limit,
        search,
        status: statusFilter,
        priority: priorityFilter,
        sortBy,
        order
      });
      setLeads(response.leads);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("desc");
    }
    setPage(1);
  };

  const getStatusColor = (status: LeadStatus) => {
    const colors: Record<LeadStatus, string> = {
      NEW: "bg-blue-50 text-blue-600 border-blue-200",
      CONTACTED: "bg-yellow-50 text-yellow-600 border-yellow-200",
      FOLLOW_UP: "bg-orange-50 text-orange-600 border-orange-200",
      SITE_VISIT: "bg-purple-50 text-purple-600 border-purple-200",
      NEGOTIATION: "bg-indigo-50 text-indigo-600 border-indigo-200",
      BOOKED: "bg-emerald-50 text-emerald-600 border-emerald-200",
      LOST: "bg-red-50 text-red-600 border-red-200",
      CLOSED: "bg-slate-50 text-slate-600 border-slate-200"
    };
    return colors[status] || colors.NEW;
  };

  const getPriorityColor = (priority: LeadPriority) => {
    const colors: Record<LeadPriority, string> = {
      HIGH: "bg-red-50 text-red-600 border-red-200",
      MEDIUM: "bg-orange-50 text-orange-600 border-orange-200",
      LOW: "bg-blue-50 text-blue-600 border-blue-200",
    };
    return colors[priority] || colors.MEDIUM;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Briefcase className="text-[#e34b32]" size={32} />
            Assigned Leads
          </h1>
          <p className="text-slate-500 font-semibold mt-1">Manage and track your assigned leads effectively.</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto_auto]">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, phone, project or city..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-[#e34b32] focus:ring-2 focus:ring-[#e34b32]/20"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0">
          <div className="relative min-w-[150px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="appearance-none w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-[#e34b32] focus:ring-2 focus:ring-[#e34b32]/20"
            >
              <option value="ALL">All Status</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="FOLLOW_UP">Follow Up</option>
              <option value="SITE_VISIT">Site Visit</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="BOOKED">Booked</option>
              <option value="LOST">Lost</option>
              <option value="CLOSED">Closed</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          <div className="relative min-w-[150px]">
            <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className="appearance-none w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-[#e34b32] focus:ring-2 focus:ring-[#e34b32]/20"
            >
              <option value="ALL">All Priority</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-2">Customer {sortBy === "name" && (order === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                </th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("status")}>
                  <div className="flex items-center gap-2">Status {sortBy === "status" && (order === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                </th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("followUpDate")}>
                  <div className="flex items-center gap-2">Follow Up {sortBy === "followUpDate" && (order === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-5">
                      <div className="h-6 w-full animate-pulse rounded-md bg-slate-100"></div>
                    </td>
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 mb-3 text-slate-400">
                      <Search size={24} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">No leads found</h3>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fde9e6] text-[#e34b32] font-black">
                          {lead.name ? lead.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{lead.name || "Unknown"}</div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{lead.project || "No project"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
                        {lead.phone && <div className="flex items-center gap-1.5"><Phone size={12} /> {lead.phone}</div>}
                        {lead.email && <div className="flex items-center gap-1.5"><Mail size={12} /> {lead.email}</div>}
                        {!lead.phone && !lead.email && <span className="text-slate-400 italic">No contact info</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${getStatusColor(lead.status)}`}>
                        {lead.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${getPriorityColor(lead.priority)}`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-slate-600">
                        {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : <span className="text-slate-400 italic">Not set</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="secondary" onClick={() => setSelectedLeadId(lead.id)}>
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} leads
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <LeadDrawer 
        leadId={selectedLeadId} 
        onClose={() => setSelectedLeadId(null)} 
        onLeadUpdated={fetchLeads}
      />
    </div>
  );
}
