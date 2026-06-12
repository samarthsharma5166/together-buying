"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchGroupsAdmin,
  fetchRMsAdmin,
  fetchUnassignedPropertiesAdmin,
  fetchAssignedPropertiesAdmin,
  createGroupAdmin,
  updateGroupAdmin,
  deleteGroupAdmin,
  clearFormError,
} from "@/store/slices/groupSlice";
import { PropertyGroup, Property } from "@/lib/api";
import {
  Users,
  Building2,
  Percent,
  Plus,
  Search,
  Edit3,
  Trash2,
  AlertTriangle,
  FolderOpen,
  X,
  UserCheck,
  TrendingUp,
  FileText,
  BadgeAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminGroupsPage() {
  const dispatch = useAppDispatch();
  const {
    groups,
    rms,
    unassignedProperties,
    assignedProperties,
    loading,
    error,
    formSubmitting,
    formError,
  } = useAppSelector((state) => state.group);

  // Search & Navigation tab states
  const [activeTab, setActiveTab] = useState<"groups" | "open" | "assigned">("groups");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State variables
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PropertyGroup | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<PropertyGroup | null>(null);

  // Form Fields State variables
  const [name, setName] = useState("");
  const [rmId, setRmId] = useState("");
  const [minGroupSize, setMinGroupSize] = useState("");
  const [targetGroupSize, setTargetGroupSize] = useState("");
  const [targetDiscount, setTargetDiscount] = useState("");
  const [status, setStatus] = useState("GROUP_FORMING");

  // Load datasets on mount
  useEffect(() => {
    dispatch(fetchGroupsAdmin());
    dispatch(fetchRMsAdmin());
    dispatch(fetchUnassignedPropertiesAdmin());
    dispatch(fetchAssignedPropertiesAdmin());
  }, [dispatch]);

  // Handle opening Create Form
  const handleOpenCreate = (property: Property) => {
    setEditingGroup(null);
    setSelectedProperty(property);
    setName(`${property.title} Buying Club`);
    setRmId("");
    setMinGroupSize("5");
    setTargetGroupSize("20");
    setTargetDiscount("8");
    setStatus("GROUP_FORMING");
    dispatch(clearFormError());
    setIsModalOpen(true);
  };

  // Handle opening Edit Form
  const handleOpenEdit = (group: PropertyGroup) => {
    setEditingGroup(group);
    setSelectedProperty(null);
    setName(group.name || "");
    setRmId(group.rm_id || "");
    setMinGroupSize(String(group.min_group_size || 5));
    setTargetGroupSize(String(group.target_group_size || 20));
    setTargetDiscount(String(group.target_discount || 10));
    setStatus(group.status || "GROUP_FORMING");
    dispatch(clearFormError());
    setIsModalOpen(true);
  };

  // Handle opening Delete Confirm
  const handleOpenDelete = (group: PropertyGroup) => {
    setGroupToDelete(group);
    setIsDeleteOpen(true);
  };

  // Handle Form Submit (Create or Update Group)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearFormError());

    const body: Record<string, any> = {
      name,
      rmId,
      minGroupSize: Number(minGroupSize),
      targetGroupSize: Number(targetGroupSize),
      targetDiscount: Number(targetDiscount),
      status,
    };

    try {
      if (editingGroup) {
        await dispatch(
          updateGroupAdmin({ id: editingGroup.id, body })
        ).unwrap();
      } else if (selectedProperty) {
        body.propertyId = selectedProperty.id;
        await dispatch(createGroupAdmin(body)).unwrap();
      }

      setIsModalOpen(false);
      // Reload lists
      dispatch(fetchGroupsAdmin());
      dispatch(fetchUnassignedPropertiesAdmin());
      dispatch(fetchAssignedPropertiesAdmin());
    } catch (err) {
      // Form error captured in slice
    }
  };

  // Handle Confirm Group Delete
  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    try {
      await dispatch(deleteGroupAdmin(groupToDelete.id)).unwrap();
      setIsDeleteOpen(false);
      setGroupToDelete(null);
      // Reload lists
      dispatch(fetchGroupsAdmin());
      dispatch(fetchUnassignedPropertiesAdmin());
      dispatch(fetchAssignedPropertiesAdmin());
    } catch (err) {
      // Handled in reducer
    }
  };

  // Calculated Stats
  const totalActiveGroups = groups.length;
  const totalParticipatingBuyers = groups.reduce((acc, curr) => acc + (curr.current_members || 0), 0);
  const avgDiscount =
    groups.length > 0
      ? (groups.reduce((acc, curr) => acc + Number(curr.target_discount), 0) / groups.length).toFixed(1)
      : "0";
  const unassignedCount = unassignedProperties.length;

  // Filter lists based on search query
  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.rmUser?.firstName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.rmUser?.lastName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUnassigned = unassignedProperties.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.city || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAssigned = assignedProperties.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.groups?.[0]?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.groups?.[0]?.rmUser?.firstName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Top Title Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight text-slate-800 md:text-3xl">
            Groups & RM Assignments
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure co-buying groups, assign Relationship Managers, and track progress goals.
          </p>
        </div>
      </div>

      {/* KPI Dashboard Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#e34b32]/5 flex items-center justify-center text-[#e34b32]">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Active Groups</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">{totalActiveGroups}</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Buyers</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">{totalParticipatingBuyers}</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Percent size={22} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Avg Discount</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">{avgDiscount}%</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <BadgeAlert size={22} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Unassigned</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">{unassignedCount}</p>
          </div>
        </div>
      </div>

      {/* Main Tab Controls & Search Filter */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/50">
            {[
              { id: "groups", label: "Group Directory", count: groups.length },
              { id: "open", label: "Open Properties", count: unassignedCount },
              { id: "assigned", label: "Managed Assignments", count: assignedProperties.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchQuery("");
                }}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2",
                  activeTab === tab.id
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/40"
                    : "text-slate-400 hover:text-slate-700"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-black",
                    activeTab === tab.id
                      ? "bg-[#e34b32]/10 text-[#e34b32]"
                      : "bg-slate-200/60 text-slate-500"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={`Search ${
                activeTab === "groups"
                  ? "group, RM name..."
                  : activeTab === "open"
                  ? "property title..."
                  : "assigned properties..."
              }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs outline-none focus:bg-white focus:border-[#e34b32] transition"
            />
          </div>
        </div>

        {/* Tab 1 Content: Groups Directory */}
        {activeTab === "groups" && (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e34b32]/10 border-t-[#e34b32]" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <FolderOpen size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="font-bold text-sm">No group buying campaigns found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {searchQuery ? "Try refining your search terms." : "Create groups for properties to manage them here."}
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="pb-3 pl-4">Group Name</th>
                    <th className="pb-3">Property</th>
                    <th className="pb-3">RM Partner</th>
                    <th className="pb-3">Members & Progress</th>
                    <th className="pb-3">Target Discount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredGroups.map((group) => {
                    const progress = Math.min(
                      100,
                      Math.round(((group.current_members || 0) / group.target_group_size) * 100)
                    );
                    const statusColors: Record<string, string> = {
                      GROUP_FORMING: "bg-indigo-50 text-indigo-700 border-indigo-100",
                      COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
                      CANCELLED: "bg-slate-50 text-slate-400 border-slate-200",
                    };

                    return (
                      <tr key={group.id} className="group hover:bg-slate-50/50 transition">
                        <td className="py-4 pl-4 font-bold text-slate-800 align-middle">
                          {group.name}
                        </td>
                        <td className="py-4 align-middle">
                          <p className="font-semibold text-slate-700">
                            {group.property ? (group.property as any).title : "Deleted Property"}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {group.property ? `${(group.property as any).locality}, ${(group.property as any).city}` : ""}
                          </p>
                        </td>
                        <td className="py-4 align-middle">
                          {group.rmUser ? (
                            <div>
                              <p className="font-semibold text-slate-700">
                                {group.rmUser.firstName} {group.rmUser.lastName}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{group.rmUser.email}</p>
                            </div>
                          ) : (
                            <span className="text-red-500 italic font-semibold">Unassigned RM</span>
                          )}
                        </td>
                        <td className="py-4 align-middle pr-4">
                          <div className="flex items-center justify-between font-bold text-slate-700 mb-1 text-[10px]">
                            <span>{group.current_members || 0} / {group.target_group_size}</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#e34b32] to-[#f06e54]"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-4 font-black text-slate-800 align-middle">
                          {group.target_discount}%
                        </td>
                        <td className="py-4 align-middle">
                          <span
                            className={cn(
                              "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-full",
                              statusColors[group.status] || "bg-slate-100 text-slate-600"
                            )}
                          >
                            {group.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 pr-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition duration-150">
                            <button
                              onClick={() => handleOpenEdit(group)}
                              className="p-1.5 text-slate-400 hover:text-[#e34b32] rounded-lg hover:bg-slate-100 transition"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(group)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2 Content: Open Properties */}
        {activeTab === "open" && (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e34b32]/10 border-t-[#e34b32]" />
              </div>
            ) : filteredUnassigned.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <FolderOpen size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="font-bold text-sm">No unassigned properties found</p>
                <p className="text-xs text-slate-400 mt-1">
                  All properties have active buying groups configured. Perfect!
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="pb-3 pl-4">Property Title</th>
                    <th className="pb-3">Developer</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Budget Range</th>
                    <th className="pb-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredUnassigned.map((property) => (
                    <tr key={property.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 pl-4 font-bold text-slate-800 align-middle">
                        {property.title}
                      </td>
                      <td className="py-4 align-middle">
                        {property.developer?.companyName || "No Developer Partner"}
                      </td>
                      <td className="py-4 align-middle text-slate-500">
                        {property.locality}, {property.city}
                      </td>
                      <td className="py-4 font-semibold text-slate-700 align-middle">
                        ₹{(Number(property.minPrice) / 10000000).toFixed(2)}Cr - ₹
                        {(Number(property.maxPrice) / 10000000).toFixed(2)}Cr
                      </td>
                      <td className="py-4 pr-4 align-middle text-right">
                        <button
                          onClick={() => handleOpenCreate(property)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Plus size={12} /> Create Group
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3 Content: Managed Assignments */}
        {activeTab === "assigned" && (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e34b32]/10 border-t-[#e34b32]" />
              </div>
            ) : filteredAssigned.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <FolderOpen size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="font-bold text-sm">No assigned properties found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Properties with active groups will appear here.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="pb-3 pl-4">Property</th>
                    <th className="pb-3">Group Name</th>
                    <th className="pb-3">Developer</th>
                    <th className="pb-3">Assigned RM</th>
                    <th className="pb-3">Members Count</th>
                    <th className="pb-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredAssigned.map((property) => {
                    const group = property.groups?.[0];
                    return (
                      <tr key={property.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 pl-4 font-bold text-slate-800 align-middle">
                          {property.title}
                          <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                            {property.locality}, {property.city}
                          </p>
                        </td>
                        <td className="py-4 font-semibold text-slate-700 align-middle">
                          {group?.name || "N/A"}
                        </td>
                        <td className="py-4 align-middle text-slate-500">
                          {property.developer?.companyName || "N/A"}
                        </td>
                        <td className="py-4 align-middle">
                          {group?.rmUser ? (
                            <span className="font-semibold text-slate-700">
                              {group.rmUser.firstName} {group.rmUser.lastName}
                            </span>
                          ) : (
                            <span className="text-red-500 font-medium italic">Unassigned RM</span>
                          )}
                        </td>
                        <td className="py-4 font-bold text-slate-700 align-middle">
                          {group?.current_members || 0} / {group?.target_group_size || 0}
                        </td>
                        <td className="py-4 pr-4 align-middle text-right">
                          {group && (
                            <button
                              onClick={() => handleOpenEdit(group)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                            >
                              <Edit3 size={12} /> Edit RM
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Slide-out Create / Edit Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 md:p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative h-full w-full max-w-lg bg-white p-6 shadow-2xl z-50 flex flex-col md:rounded-3xl md:h-[90vh] overflow-hidden animate-reveal-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-display text-lg font-black text-slate-800">
                  {editingGroup ? "Edit Group Campaign" : "Create Group Campaign"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingGroup
                    ? "Update settings for the buying group campaign."
                    : `Configure a new co-buying group for ${selectedProperty?.title}`}
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
                <label className="text-xs font-black uppercase text-slate-400">Group Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Godrej Habitat buying club"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-400">
                  Assigned RM (Relationship Manager) *
                </label>
                <select
                  required
                  value={rmId}
                  onChange={(e) => setRmId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition cursor-pointer"
                >
                  <option value="">Select RM</option>
                  {rms.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.firstName} {rm.lastName} ({rm.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400">Min Group Size *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={minGroupSize}
                    onChange={(e) => setMinGroupSize(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400">Target Group Size *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={targetGroupSize}
                    onChange={(e) => setTargetGroupSize(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400">
                    Target Discount (%) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min={0.1}
                    max={100}
                    value={targetDiscount}
                    onChange={(e) => setTargetDiscount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400">Group Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition cursor-pointer"
                  >
                    <option value="GROUP_FORMING">GROUP FORMING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-xs text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer disabled:opacity-60"
                >
                  {formSubmitting ? "Saving changes..." : editingGroup ? "Save Changes" : "Launch Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && groupToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsDeleteOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-50 text-center animate-reveal-up border border-slate-100">
            <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="font-display text-lg font-black text-slate-800">
              Delete Group Campaign?
            </h3>
            <p className="text-xs text-slate-400 mt-2 px-2">
              Are you sure you want to delete <span className="font-bold text-slate-700">"{groupToDelete.name}"</span>?
              This action cannot be undone and will disband the current group buying campaign.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-xs text-slate-500 hover:bg-slate-50 transition cursor-pointer"
              >
                Keep Campaign
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
