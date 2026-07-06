"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDevelopers,
  createDeveloper,
  updateDeveloper,
  deleteDeveloper,
  clearFormError,
  clearError
} from "@/store/slices/developerSlice";
import { Developer } from "@/lib/api";
import {
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  Globe,
  Trash2,
  Edit3,
  Calendar,
  AlertTriangle,
  Upload,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  CircleGauge
} from "lucide-react";
import { cn } from "@/lib/utils";

const LIMIT = 6;

export default function AdminDevelopersPage() {
  const dispatch = useAppDispatch();
  const developers = useAppSelector((state) => state.developer.developers);
  const total = useAppSelector((state) => state.developer.total);
  const loading = useAppSelector((state) => state.developer.loading);
  const error = useAppSelector((state) => state.developer.error);
  const formSubmitting = useAppSelector((state) => state.developer.formSubmitting);
  const formError = useAppSelector((state) => state.developer.formError);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);

  // File Inputs Refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [headquartersCity, setHeadquartersCity] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [establishedYear, setEstablishedYear] = useState("");
  const [description, setDescription] = useState("");
  const [reraRegistered, setReraRegistered] = useState(false);
  const [partnershipStatus, setPartnershipStatus] = useState<"ACTIVE" | "SUSPENDED" | "TERMINATED">("ACTIVE");
  const[logo,setLogo]=useState<File | null>(null)
  const[banner,setBanner]=useState<File | null>(null)
  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Run on mount and page changes
  const loadData = (currentPage: number) => {
    dispatch(fetchDevelopers({ page: currentPage, limit: LIMIT, search, status: statusFilter }));
  };

  useEffect(() => {
    loadData(page);
  }, [page]);

  // Trigger fetch on search/filter changes
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    dispatch(fetchDevelopers({ page: 1, limit: LIMIT, search, status: statusFilter }));
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
    dispatch(fetchDevelopers({ page: 1, limit: LIMIT, search, status }));
  };

  const getAssetUrl = (filename?: string | null) => {
    if (!filename) return null;
    if (filename.startsWith("http://") || filename.startsWith("https://")) return filename;
    const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api").replace(/\/api$/, "");
    return `${baseUrl}/uploads/${filename}`;
  };

  const openCreateModal = () => {
    setEditingDeveloper(null);
    setCompanyName("");
    setHeadquartersCity("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setWebsiteUrl("");
    setEstablishedYear("");
    setDescription("");
    setReraRegistered(false);
    setPartnershipStatus("ACTIVE");
    setLogo(null);
    setBanner(null);
    dispatch(clearFormError());
    setModalOpen(true);
  };

  const openEditModal = (dev: Developer) => {
    setEditingDeveloper(dev);
    setCompanyName(dev.companyName || "");
    setHeadquartersCity(dev.headquartersCity || "");
    setContactName(dev.contactName || "");
    setContactEmail(dev.contactEmail || "");
    setContactPhone(dev.contactPhone || "");
    setWebsiteUrl(dev.websiteUrl || "");
    setEstablishedYear(dev.establishedYear ? String(dev.establishedYear) : "");
    setDescription(dev.description || "");
    setReraRegistered(dev.reraRegistered || false);
    setPartnershipStatus(dev.partnershipStatus || "ACTIVE");
    dispatch(clearFormError());
    setModalOpen(true);
  };
    // console.log(
    //     companyName,
    //     headquartersCity,
    //     contactName,
    //     contactEmail,
    //     contactPhone,
    //     websiteUrl,
    //     establishedYear,
    //     description,
    //     reraRegistered,
    //     partnershipStatus
    // )
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearFormError());
    
    const formData = new FormData();
    formData.append("companyName", companyName);
    formData.append("headquartersCity", headquartersCity);
    formData.append("contactName", contactName);
    formData.append("contactEmail", contactEmail);
    formData.append("contactPhone", contactPhone);
    formData.append("websiteUrl", websiteUrl);
    if (establishedYear) formData.append("establishedYear", establishedYear);
    formData.append("description", description);
    formData.append("reraRegistered", String(reraRegistered));
    formData.append("partnershipStatus", partnershipStatus);

    const logoFile = logoInputRef.current?.files?.[0];
    const bannerFile = bannerInputRef.current?.files?.[0];

    if (logoFile) formData.append("logo", logoFile);
    if (bannerFile) formData.append("bannerImage", bannerFile);
    console.log(Object.fromEntries(formData.entries()));
    try {
      if (editingDeveloper) {
        await dispatch(updateDeveloper({ id: editingDeveloper.id, formData })).unwrap();
      } else {
        await dispatch(createDeveloper(formData)).unwrap();
      }
      setModalOpen(false);
      loadData(page);
    } catch (err) {
      // Handled in Redux slice formError
    }
  };

  const handleDeleteTrigger = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await dispatch(deleteDeveloper(deleteConfirmId)).unwrap();
      setDeleteConfirmId(null);
      loadData(page);
    } catch (err) {
      // Handled in Redux slice error
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#e34b32]">Developer Partnerships</p>
          <h1 className="font-display text-3xl font-black text-slate-800 mt-1">Developers Management</h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage real estate developers, partnership statuses, and verify RERA profiles. Active partners with logos appear on the homepage partners section.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#e34b32] to-[#f06e54] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus size={18} /> Add Partner
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search developers, locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none transition focus:bg-white focus:border-[#e34b32]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-100 font-bold text-sm text-slate-600 hover:bg-slate-200 transition"
          >
            Find
          </button>
        </form>

        {/* Status Filter Tab Buttons */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-50 border border-slate-200/50 rounded-2xl">
          {[
            { label: "All Statuses", value: "" },
            { label: "Active", value: "ACTIVE" },
            { label: "Suspended", value: "SUSPENDED" },
            { label: "Terminated", value: "TERMINATED" }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleStatusChange(tab.value)}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer",
                statusFilter === tab.value
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/30"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Listing View */}
      {loading ? (
        /* Loading Skeleton Grid */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: LIMIT }).map((_, idx) => (
            <div key={idx} className="rounded-3xl border border-slate-100 bg-white p-6 space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-100" />
                <div className="space-y-1 flex-1">
                  <div className="h-4 w-2/3 bg-slate-100 rounded" />
                  <div className="h-3 w-1/3 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="space-y-2 py-2">
                <div className="h-3 w-full bg-slate-100 rounded" />
                <div className="h-3 w-3/4 bg-slate-100 rounded" />
              </div>
              <div className="h-8 bg-slate-50 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-red-200 bg-red-50/20 text-red-600">
          <AlertTriangle size={32} className="mx-auto text-red-500 mb-3" />
          <p className="font-bold">{error}</p>
          <button onClick={() => loadData(page)} className="mt-4 px-4 py-2 text-xs font-bold border border-red-200 bg-white rounded-xl hover:bg-red-50">
            Retry Loading
          </button>
        </div>
      ) : developers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-500">
          <Building2 size={36} className="mx-auto text-slate-300 mb-3" />
          <p className="font-bold text-sm">No developers found</p>
          <p className="text-xs text-slate-400 mt-1">Try refining your filters or search keywords.</p>
        </div>
      ) : (
        /* Developer Grid List */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {developers.map((dev) => {
            const logo = getAssetUrl(dev.logoUrl);
            const statusColors = {
              ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
              SUSPENDED: "bg-amber-50 text-amber-700 border-amber-100",
              TERMINATED: "bg-rose-50 text-rose-700 border-rose-100"
            };

            return (
              <div key={dev.id} className="group flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                <div>
                  {/* Top line logo/names */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {logo ? (
                        <img
                          src={logo}
                          alt={dev.companyName}
                          className="h-14 w-14 shrink-0 rounded-2xl object-contain border border-slate-100 p-1 bg-slate-50"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff3ef] text-[#e34b32] font-black border border-orange-100">
                          {dev.companyName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 leading-tight truncate">{dev.companyName}</h3>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Building2 size={12} /> {dev.headquartersCity || "No headquarters listed"}
                        </p>
                      </div>
                    </div>
                    {/* Status Badge */}
                    <span className={cn(
                      "inline-flex text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                      statusColors[dev.partnershipStatus || "ACTIVE"]
                    )}>
                      {dev.partnershipStatus}
                    </span>
                  </div>

                  {/* Contact Details Card */}
                  <div className="mt-5 space-y-2.5 border-t border-slate-100/80 pt-4 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-50 text-slate-400"><Info size={11} /></span>
                      <span className="font-medium text-slate-700 truncate">{dev.contactName || "No contact listed"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-50 text-slate-400"><Mail size={11} /></span>
                      <a href={`mailto:${dev.contactEmail}`} className="hover:text-[#e34b32] truncate">{dev.contactEmail}</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-50 text-slate-400"><Phone size={11} /></span>
                      <a href={`tel:${dev.contactPhone}`} className="hover:text-[#e34b32]">{dev.contactPhone}</a>
                    </div>
                    {dev.websiteUrl && (
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-50 text-slate-400"><Globe size={11} /></span>
                        <a href={dev.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#e34b32] flex items-center gap-1.5 min-w-0">
                          <span className="truncate">{dev.websiteUrl}</span> <ExternalLink size={10} className="shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operations / Status counters at bottom */}
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Calendar size={13} className="text-[#e34b32]" />
                    <span>{dev._count?.properties || 0} active projects</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(dev)}
                      aria-label="Edit"
                      className="p-2 text-slate-400 hover:text-[#e34b32] hover:bg-slate-50 rounded-xl transition"
                    >
                      <Edit3 size={16} />
                    </button>
                    {dev.partnershipStatus !== "TERMINATED" && (
                      <button
                        onClick={() => handleDeleteTrigger(dev.id)}
                        aria-label="Terminate Partnership"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <p className="text-xs font-semibold text-slate-400">
            Showing <span className="font-bold text-slate-700">{(page - 1) * LIMIT + 1}</span> to{" "}
            <span className="font-bold text-slate-700">{Math.min(page * LIMIT, total)}</span> of{" "}
            <span className="font-bold text-slate-700">{total}</span> developers
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="flex items-center justify-center h-10 w-10 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="flex items-center justify-center h-10 w-10 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Modal Form (Overlay Slide Over style) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setModalOpen(false)}
          />
          {/* Form Content panel */}
          <div className="relative flex flex-col w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-100 z-50 animate-reveal-up">
            {/* Modal header */}
            <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-100 px-6 md:px-8">
              <div>
                <h2 className="font-display text-lg font-black text-slate-800">
                  {editingDeveloper ? "Edit Developer Profile" : "Create Developer Partner"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Define partnership credentials and properties count.</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 focus:outline-none transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-5">
              {formError && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 flex gap-2.5 text-xs text-rose-600 font-bold leading-tight">
                  <AlertTriangle size={15} className="shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Company & City Fields */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-400">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Godrej Properties"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none transition focus:bg-white focus:border-[#e34b32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400">Headquarters City</label>
                  <input
                    type="text"
                    placeholder="e.g. Gurugram"
                    value={headquartersCity}
                    onChange={(e) => setHeadquartersCity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none transition focus:bg-white focus:border-[#e34b32]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400">Established Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 1990"
                    value={establishedYear}
                    onChange={(e) => setEstablishedYear(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none transition focus:bg-white focus:border-[#e34b32]"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Contact Person</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400">Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Kumar"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none transition focus:bg-white focus:border-[#e34b32]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. amit@godrej.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none transition focus:bg-white focus:border-[#e34b32]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400">Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10 digit number"
                      maxLength={10}
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none transition focus:bg-white focus:border-[#e34b32]"
                    />
                  </div>
                </div>
              </div>

              {/* Logo / Images / Links */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Digital Assets & Metadata</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400">Website URL</label>
                  <input
                    type="url"
                    placeholder="e.g. https://www.godrejproperties.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none transition focus:bg-white focus:border-[#e34b32]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400">Company Logo</label>
                    <div className="relative">
                      <input
                        type="file"
                        // onChange={(e)=>setLogo(e.target.files?.[0] || null)}
                        ref={logoInputRef}
                        accept="image/*"
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload" className="flex items-center gap-2 border border-dashed border-slate-200 bg-slate-50 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-500 cursor-pointer hover:bg-slate-100 transition justify-center">
                        <Upload size={14} /> Upload Logo
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400">Banner Image</label>
                    <div className="relative">
                      <input
                        type="file"
                        // onChange={(e)=>setBanner(e.target.files?.[0] || null)}
                        ref={bannerInputRef}
                        accept="image/*"
                        className="hidden"
                        id="banner-upload"
                      />
                      <label htmlFor="banner-upload" className="flex items-center gap-2 border border-dashed border-slate-200 bg-slate-50 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-500 cursor-pointer hover:bg-slate-100 transition justify-center">
                        <Upload size={14} /> Upload Banner
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and settings */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex items-center justify-between bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rera"
                      checked={reraRegistered}
                      onChange={(e) => setReraRegistered(e.target.checked)}
                      className="h-4.5 w-4.5 border-slate-300 rounded text-[#e34b32] outline-none cursor-pointer"
                    />
                    <label htmlFor="rera" className="text-xs font-black uppercase tracking-wider text-slate-600 cursor-pointer">
                      RERA Registered Profile
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400">Partnership Status</label>
                  <select
                    value={partnershipStatus}
                    onChange={(e) => setPartnershipStatus(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none transition focus:bg-white focus:border-[#e34b32] cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="TERMINATED">TERMINATED</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400">Description</label>
                  <textarea
                    placeholder="Partnership details, company description..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none transition focus:bg-white focus:border-[#e34b32]"
                  />
                </div>
              </div>

              {/* Sticky Modal footer submit controls */}
              <div className="border-t border-slate-100 pt-5 pb-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl border border-slate-200 bg-white font-bold text-sm text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#e34b32] to-[#f06e54] text-white font-bold text-sm shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-60"
                >
                  {formSubmitting ? "Saving changes..." : editingDeveloper ? "Save Profile" : "Create Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Popup for deletion */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          {/* Popup Card */}
          <div className="relative w-full max-w-sm rounded-[2rem] border border-slate-100 bg-white p-6 md:p-8 shadow-2xl z-50 text-center animate-reveal-up">
            <Trash2 size={36} className="mx-auto text-red-500 mb-3" />
            <h3 className="font-display text-lg font-black text-slate-800">Terminate Partnership?</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This action will set the developer status to **TERMINATED**. Active projects associated with this partner may be hidden.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 border border-slate-200 bg-white rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                No, Go Back
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 rounded-xl font-bold text-xs text-white hover:bg-red-700 shadow-sm cursor-pointer"
              >
                Confirm Terminate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}