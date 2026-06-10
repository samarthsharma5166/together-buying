"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
  deletePropertyImage,
  togglePropertyFeatured,
  clearFormError,
  clearError
} from "@/store/slices/propertySlice";
import { fetchDevelopers } from "@/store/slices/developerSlice";
import { Property, Developer, PropertyImage } from "@/lib/api";
import {
  Plus,
  Search,
  Building2,
  Trash2,
  Edit3,
  Calendar,
  AlertTriangle,
  Upload,
  ChevronLeft,
  ChevronRight,
  Info,
  MapPin,
  Tag,
  Images,
  FolderOpen,
  DollarSign,
  Grid
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const LIMIT = 6;

const PROPERTY_TYPES = ["RESIDENTIAL", "COMMERCIAL"];
const POSSESSION_STATUSES = ["PRE_LAUNCH", "UNDER_CONSTRUCTION", "READY_TO_MOVE"];
const PROPERTY_STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "SOLD_OUT", "ARCHIVED"];

const UNIT_TYPES = [
  "BHK_1",
  "BHK_2",
  "BHK_3",
  "BHK_4",
  "BHK_5",
  "VILLA",
  "PLOT",
  "OFFICE",
  "SHOP"
];

const IMAGE_TYPES = [
  "EXTERIOR",
  "AMENITY",
  "LOCATION_MAP",
  "CONSTRUCTION_UPDATE",
  "MASTER_PLAN"
];

export default function AdminPropertiesPage() {
  const dispatch = useAppDispatch();

  // Redux Selectors
  const properties = useAppSelector((state) => state.property.properties);
  const total = useAppSelector((state) => state.property.total);
  const loading = useAppSelector((state) => state.property.loading);
  const error = useAppSelector((state) => state.property.error);
  const formSubmitting = useAppSelector((state) => state.property.formSubmitting);
  const formError = useAppSelector((state) => state.property.formError);

  const developers = useAppSelector((state) => state.developer.developers);

  // Pagination & Filtering States
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [possessionFilter, setPossessionFilter] = useState("");

  // Modal / Drawer States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Media Gallery Modal State
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaProperty, setMediaProperty] = useState<Property | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [mediaType, setMediaType] = useState("EXTERIOR");
  const [mediaCaption, setMediaCaption] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [developerId, setDeveloperId] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("RESIDENTIAL");
  const [status, setStatus] = useState("DRAFT");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [address, setAddress] = useState("");
  const [reraNumber, setReraNumber] = useState("");
  const [reraState, setReraState] = useState("");
  const [possessionStatus, setPossessionStatus] = useState("UNDER_CONSTRUCTION");
  const [possessionDate, setPossessionDate] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [totalUnits, setTotalUnits] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPreLaunch, setIsPreLaunch] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Primitive List form states
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [specifications, setSpecifications] = useState<string[]>([]);
  const [newSpecification, setNewSpecification] = useState("");

  // Nested Property Units Form State
  const [units, setUnits] = useState<
    Array<{
      unitType: string;
      carpetAreaSqft: string;
      superAreaSqft: string;
      price: string;
      availableUnits: string;
    }>
  >([]);

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load Data function
  const loadData = (currentPage: number) => {
    dispatch(
      fetchProperties({
        page: currentPage,
        limit: LIMIT,
        search,
        status: statusFilter,
        propertyType: typeFilter,
        possessionStatus: possessionFilter
      })
    );
  };

  // Load properties and active developers on mount
  useEffect(() => {
    loadData(page);
    dispatch(fetchDevelopers({ page: 1, limit: 100, search: "", status: "ACTIVE" }));
  }, [page]);

  // Handle Search and Filter changes
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "status") setStatusFilter(value);
    if (key === "type") setTypeFilter(value);
    if (key === "possession") setPossessionFilter(value);
    setPage(1);
    dispatch(
      fetchProperties({
        page: 1,
        limit: LIMIT,
        search,
        status: key === "status" ? value : statusFilter,
        propertyType: key === "type" ? value : typeFilter,
        possessionStatus: key === "possession" ? value : possessionFilter
      })
    );
  };

  const getAssetUrl = (filename?: string | null) => {
    if (!filename) return null;
    if (filename.startsWith("http://") || filename.startsWith("https://")) return filename;
    const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api").replace(/\/api$/, "");
    return `${baseUrl}/uploads/${filename}`;
  };

  // Add dynamic unit field
  const handleAddUnitField = () => {
    setUnits([
      ...units,
      {
        unitType: "BHK_2",
        carpetAreaSqft: "",
        superAreaSqft: "",
        price: "",
        availableUnits: ""
      }
    ]);
  };

  // Remove dynamic unit field
  const handleRemoveUnitField = (idx: number) => {
    setUnits(units.filter((_, i) => i !== idx));
  };

  // Update dynamic unit fields
  const handleUnitFieldChange = (idx: number, key: string, value: string) => {
    setUnits(
      units.map((unit, i) => (i === idx ? { ...unit, [key]: value } : unit))
    );
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingProperty(null);
    setTitle("");
    setDeveloperId("");
    setDescription("");
    setPropertyType("RESIDENTIAL");
    setStatus("DRAFT");
    setCity("");
    setLocality("");
    setAddress("");
    setReraNumber("");
    setReraState("");
    setPossessionStatus("UNDER_CONSTRUCTION");
    setPossessionDate("");
    setMinPrice("");
    setMaxPrice("");
    setTotalUnits("");
    setIsFeatured(false);
    setIsPreLaunch(false);
    setLatitude("");
    setLongitude("");
    setMetaTitle("");
    setMetaDescription("");
    setUnits([]);
    setHighlights([]);
    setNewHighlight("");
    setAmenities([]);
    setNewAmenity("");
    setSpecifications([]);
    setNewSpecification("");
    dispatch(clearFormError());
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (prop: Property) => {
    setEditingProperty(prop);
    setTitle(prop.title || "");
    setDeveloperId(prop.developer?.id || "");
    setDescription(prop.description || "");
    setPropertyType(prop.propertyType || "RESIDENTIAL");
    setStatus(prop.status || "DRAFT");
    setCity(prop.city || "");
    setLocality(prop.locality || "");
    setAddress(prop.address || "");
    setReraNumber(prop.reraNumber || "");
    setReraState(prop.reraState || "");
    setPossessionStatus(prop.possessionStatus || "UNDER_CONSTRUCTION");
    setPossessionDate(prop.possessionDate ? String(prop.possessionDate).split("T")[0] : "");
    setMinPrice(prop.minPrice ? String(prop.minPrice) : "");
    setMaxPrice(prop.maxPrice ? String(prop.maxPrice) : "");
    setTotalUnits(prop.totalUnits ? String(prop.totalUnits) : "");
    setIsFeatured(prop.isFeatured || false);
    setIsPreLaunch(prop.isPreLaunch || false);
    setLatitude(prop.latitude ? String(prop.latitude) : "");
    setLongitude(prop.longitude ? String(prop.longitude) : "");
    setMetaTitle(prop.metaTitle || "");
    setMetaDescription(prop.metaDescription || "");
    setUnits([]);
    setHighlights(prop.highlights || []);
    setNewHighlight("");
    setAmenities(prop.amenities || []);
    setNewAmenity("");
    setSpecifications(prop.specifications || []);
    setNewSpecification("");
    dispatch(clearFormError());
    setModalOpen(true);
  };

  // Open Media Modal
  const openMediaModal = (prop: Property) => {
    setMediaProperty(prop);
    setMediaCaption("");
    setMediaType("EXTERIOR");
    dispatch(clearFormError());
    setMediaModalOpen(true);
  };

  // Form Submit (Create or Update Property)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearFormError());

    // Format body
    const formattedUnits = units.map((u) => ({
      unitType: u.unitType,
      carpetAreaSqft: Number(u.carpetAreaSqft),
      superAreaSqft: u.superAreaSqft ? Number(u.superAreaSqft) : null,
      price: String(u.price),
      availableUnits: u.availableUnits ? Number(u.availableUnits) : null
    }));

    const body: Record<string, any> = {
      title,
      developerId,
      description,
      propertyType,
      status,
      city,
      locality,
      address: address || "Address not provided",
      reraNumber: reraNumber || "RERA-PENDING",
      reraState: reraState || "Haryana",
      possessionStatus,
      minPrice: String(minPrice),
      maxPrice: String(maxPrice),
      isFeatured,
      isPreLaunch,
      units: formattedUnits,
      highlights,
      amenities,
      specifications
    };

    if (possessionDate) body.possessionDate = new Date(possessionDate).toISOString();
    if (totalUnits) body.totalUnits = Number(totalUnits);
    if (latitude) body.latitude = Number(latitude);
    if (longitude) body.longitude = Number(longitude);
    if (metaTitle) body.metaTitle = metaTitle;
    if (metaDescription) body.metaDescription = metaDescription;

    try {
      if (editingProperty) {
        // Exclude units from update as backend ignores nested unit updates in update endpoint
        const { units: omitted, ...updateBody } = body;
        await dispatch(updateProperty({ id: editingProperty.id, body: updateBody })).unwrap();
      } else {
        await dispatch(createProperty(body)).unwrap();
      }
      setModalOpen(false);
      loadData(page);
    } catch (err) {
      // Handled in Redux slice formError
    }
  };

  // Deletion Trigger
  const handleDeleteTrigger = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await dispatch(deleteProperty(deleteConfirmId)).unwrap();
      setDeleteConfirmId(null);
      loadData(page);
    } catch (err) {
      // Handled in Redux slice error
    }
  };

  // Toggle Featured Switch
  const handleToggleFeatured = async (id: string, currentVal: boolean) => {
    try {
      await dispatch(togglePropertyFeatured({ id, isFeatured: !currentVal })).unwrap();
    } catch (err) {
      alert("Failed to toggle featured status: " + err);
    }
  };

  // Upload Images submit
  const handleUploadImages = async () => {
    if (!mediaProperty || !mediaInputRef.current?.files?.length) return;
    dispatch(clearFormError());

    const files = mediaInputRef.current.files;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }
    if (mediaCaption) formData.append("caption", mediaCaption);
    formData.append("imageType", mediaType);

    try {
      const result = await dispatch(
        uploadPropertyImages({ propertyId: mediaProperty.id, formData })
      ).unwrap();
      
      // Update local state mediaProperty images representation
      const updatedImages = result.images;
      setMediaProperty({
        ...mediaProperty,
        images: [...(mediaProperty.images || []), ...updatedImages]
      });

      // Clear input
      if (mediaInputRef.current) mediaInputRef.current.value = "";
      setMediaCaption("");
    } catch (err) {
      // Handled in Redux formError
    }
  };

  // Delete Image
  const handleDeleteImage = async (imageId: string) => {
    if (!mediaProperty) return;
    try {
      await dispatch(deletePropertyImage({ propertyId: mediaProperty.id, imageId })).unwrap();
      // Update local state representation
      setMediaProperty({
        ...mediaProperty,
        images: (mediaProperty.images || []).filter((img) => img.id !== imageId)
      });
    } catch (err) {
      alert("Failed to delete image: " + err);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#e34b32]">Properties Inventory</p>
          <h1 className="font-display text-3xl font-black text-slate-800 mt-1">Properties Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage listings, specify floor plans/pricing ranges, and upload gallery media.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#e34b32] to-[#f06e54] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus size={18} /> New Property
        </button>
      </div>

      {/* Filters, Search and Status tabs */}
      <div className="flex flex-col gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="w-full lg:max-w-md flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search properties, localities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none transition focus:bg-white focus:border-[#e34b32]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-100 font-bold text-sm text-slate-600 hover:bg-slate-200 transition"
            >
              Search
            </button>
          </form>

          {/* Quick Selects */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-600 outline-none cursor-pointer"
            >
              <option value="">All Types</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={possessionFilter}
              onChange={(e) => handleFilterChange("possession", e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-600 outline-none cursor-pointer"
            >
              <option value="">All Possessions</option>
              {POSSESSION_STATUSES.map((pos) => (
                <option key={pos} value={pos}>{pos.replace("_", " ")}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Tab buttons */}
        <div className="h-px bg-slate-100" />
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "All Statuses", value: "" },
            { label: "Draft", value: "DRAFT" },
            { label: "Active", value: "ACTIVE" },
            { label: "Paused", value: "PAUSED" },
            { label: "Sold Out", value: "SOLD_OUT" },
            { label: "Archived", value: "ARCHIVED" }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleFilterChange("status", tab.value)}
              className={cn(
                "px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer",
                statusFilter === tab.value
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200/30"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        /* Loading skeleton list */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: LIMIT }).map((_, idx) => (
            <div key={idx} className="rounded-3xl border border-slate-100 bg-white p-6 space-y-4 animate-pulse">
              <div className="h-40 bg-slate-100 rounded-2xl" />
              <div className="h-4 w-2/3 bg-slate-100 rounded" />
              <div className="h-3 w-1/3 bg-slate-100 rounded" />
              <div className="h-10 bg-slate-50 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-red-200 bg-red-50/20 text-red-600">
          <AlertTriangle size={32} className="mx-auto text-red-500 mb-3" />
          <p className="font-bold">{error}</p>
          <button onClick={() => loadData(page)} className="mt-4 px-4 py-2 text-xs font-bold border border-red-200 bg-white rounded-xl hover:bg-red-50">
            Retry
          </button>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-500">
          <FolderOpen size={36} className="mx-auto text-slate-300 mb-3" />
          <p className="font-bold text-sm">No properties found</p>
          <p className="text-xs text-slate-400 mt-1">Add a new property to populate this workspace.</p>
        </div>
      ) : (
        /* Listing Grid */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((prop) => {
            const hasCoverImage = prop.images && prop.images.length > 0;
            const coverImage = hasCoverImage ? getAssetUrl(prop.images?.[0].imageUrl) : null;
            const statusColors = {
              DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
              ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
              PAUSED: "bg-amber-50 text-amber-700 border-amber-100",
              SOLD_OUT: "bg-rose-50 text-rose-700 border-rose-100",
              ARCHIVED: "bg-slate-50 text-slate-400 border-slate-200"
            };

            return (
              <div key={prop.id} className="group flex flex-col justify-between rounded-3xl border border-slate-100 bg-white shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden">
                {/* Header Image Area */}
                <div className="relative h-44 w-full bg-slate-50 overflow-hidden">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={prop.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300 bg-slate-50">
                      <Grid size={40} />
                    </div>
                  )}
                  {/* Status Badge */}
                  <span className={cn(
                    "absolute top-4 left-4 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.75 rounded-full border shadow-sm",
                    statusColors[(prop.status as keyof typeof statusColors) || "DRAFT"]
                  )}>
                    {prop.status}
                  </span>
                  {/* Property Type Badge */}
                  <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.75 bg-slate-900/60 backdrop-blur-xs text-white rounded-full">
                    {prop.propertyType}
                  </span>
                </div>

                {/* Body Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#e34b32]">
                      <Building2 size={12} />
                      <span className="truncate">{prop.developer?.companyName || "No Developer Brand"}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 leading-snug mt-2 truncate group-hover:text-[#e34b32] transition">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <MapPin size={12} className="shrink-0" />
                      <span>{prop.locality}, {prop.city}</span>
                    </p>

                    {/* Meta stats details */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-50 text-xs">
                      <div>
                        <p className="text-slate-400 font-semibold">Possession</p>
                        <p className="text-slate-700 font-bold mt-0.5">{prop.possessionStatus?.replace("_", " ")}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-semibold">Pricing</p>
                        <p className="text-[#e34b32] font-black mt-0.5">
                          {prop.minPrice ? `₹${(Number(prop.minPrice) / 10000000).toFixed(2)}Cr+` : "Call"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions area */}
                  <div className="mt-6 pt-4 border-t border-slate-100/80 flex items-center justify-between">
                    {/* Toggle Featured */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`featured-${prop.id}`}
                        checked={prop.isFeatured || false}
                        onChange={() => handleToggleFeatured(prop.id, prop.isFeatured || false)}
                        className="h-4 w-4 text-[#e34b32] border-slate-300 rounded focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor={`featured-${prop.id}`} className="text-[10px] font-bold uppercase text-slate-400 cursor-pointer">
                        Featured
                      </label>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openMediaModal(prop)}
                        title="Manage Images"
                        className="p-2 text-slate-400 hover:text-[#e34b32] hover:bg-slate-50 rounded-xl transition"
                      >
                        <Images size={16} />
                      </button>
                      <button
                        onClick={() => openEditModal(prop)}
                        title="Edit Details"
                        className="p-2 text-slate-400 hover:text-[#e34b32] hover:bg-slate-50 rounded-xl transition"
                      >
                        <Edit3 size={16} />
                      </button>
                      {prop.status !== "ARCHIVED" && (
                        <button
                          onClick={() => handleDeleteTrigger(prop.id)}
                          title="Archive Listing"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination component */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <p className="text-xs font-semibold text-slate-400">
            Showing <span className="font-bold text-slate-700">{(page - 1) * LIMIT + 1}</span> to{" "}
            <span className="font-bold text-slate-700">{Math.min(page * LIMIT, total)}</span> of{" "}
            <span className="font-bold text-slate-700">{total}</span> listings
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

      {/* Slide-out Drawer Form for creation & updates */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setModalOpen(false)} />
          <div className="relative flex flex-col w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-100 z-50 animate-reveal-up">
            
            {/* Header */}
            <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-100 px-6 md:px-8">
              <div>
                <h2 className="font-display text-lg font-black text-slate-800">
                  {editingProperty ? "Edit Property Listing" : "New Property Listing"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Define specifications, prices, developer, and nested floor plans.</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-6">
              {formError && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 flex gap-2.5 text-xs text-rose-600 font-bold leading-tight">
                  <AlertTriangle size={15} className="shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title & Developer select */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400">Property Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DLF Privana West"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400">Developer Partner *</label>
                  <select
                    required
                    value={developerId}
                    onChange={(e) => setDeveloperId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition cursor-pointer"
                  >
                    <option value="">Select Developer Partner</option>
                    {developers.map((dev) => (
                      <option key={dev.id} value={dev.id}>{dev.companyName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-400">Description</label>
                <textarea
                  placeholder="Premium residences with group buying benefits..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                />
              </div>

              {/* Locations details */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Location Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gurugram"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400">Locality *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sector 76"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400">Detailed Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Golf Course Extension Road, Sector 76, Gurugram"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                  />
                </div>
              </div>

              {/* Status and Possession */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Listing Status & Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400">Property Type</label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition cursor-pointer"
                    >
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400">Possession Status</label>
                    <select
                      value={possessionStatus}
                      onChange={(e) => setPossessionStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition cursor-pointer"
                    >
                      {POSSESSION_STATUSES.map((pos) => (
                        <option key={pos} value={pos}>{pos.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400">Listing Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition cursor-pointer"
                    >
                      {PROPERTY_STATUSES.map((stat) => (
                        <option key={stat} value={stat}>{stat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400">RERA Number</label>
                    <input
                      type="text"
                      placeholder="e.g. RC/REP/HARERA/2024/05"
                      value={reraNumber}
                      onChange={(e) => setReraNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400">RERA State</label>
                    <input
                      type="text"
                      placeholder="e.g. Haryana"
                      value={reraState}
                      onChange={(e) => setReraState(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                    />
                  </div>
                </div>
              </div>

              {/* Prices, coordinates and fields */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Coordinates & Budgets</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400">Min Price (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 52500000"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400">Max Price (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 90000000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400">Total Units</label>
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={totalUnits}
                      onChange={(e) => setTotalUnits(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="28.4595"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="77.0266"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                    />
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="prelaunch"
                      checked={isPreLaunch}
                      onChange={(e) => setIsPreLaunch(e.target.checked)}
                      className="h-4.5 w-4.5 text-[#e34b32] border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="prelaunch" className="text-xs font-black uppercase text-slate-600 cursor-pointer">
                      Pre Launch Status
                    </label>
                  </div>
                </div>
              </div>

              {/* Primitive Lists: Highlights, Amenities, Specifications */}
              <div className="border-t border-slate-100 pt-5 space-y-6">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Highlights, Amenities & Specifications</h3>

                {/* Highlights list input */}
                <div className="space-y-2.5">
                  <label className="text-xs font-black uppercase text-slate-400">Highlights</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 5 Mins to Metro Station"
                      value={newHighlight}
                      onChange={(e) => setNewHighlight(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newHighlight.trim()) {
                          setHighlights([...highlights, newHighlight.trim()]);
                          setNewHighlight("");
                        }
                      }}
                      className="px-4 py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {highlights.map((h, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200/60 px-3 py-1 rounded-xl text-xs text-slate-600">
                        {h}
                        <button
                          type="button"
                          onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))}
                          className="text-slate-400 hover:text-red-500 font-bold transition ml-0.5"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    {highlights.length === 0 && <p className="text-[11px] text-slate-400 italic">No highlights added yet.</p>}
                  </div>
                </div>

                {/* Amenities list input */}
                <div className="space-y-2.5">
                  <label className="text-xs font-black uppercase text-slate-400">Amenities</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Swimming Pool"
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newAmenity.trim()) {
                          setAmenities([...amenities, newAmenity.trim()]);
                          setNewAmenity("");
                        }
                      }}
                      className="px-4 py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {amenities.map((a, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200/60 px-3 py-1 rounded-xl text-xs text-slate-600">
                        {a}
                        <button
                          type="button"
                          onClick={() => setAmenities(amenities.filter((_, idx) => idx !== i))}
                          className="text-slate-400 hover:text-red-500 font-bold transition ml-0.5"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    {amenities.length === 0 && <p className="text-[11px] text-slate-400 italic">No amenities added yet.</p>}
                  </div>
                </div>

                {/* Specifications list input */}
                <div className="space-y-2.5">
                  <label className="text-xs font-black uppercase text-slate-400">Specifications</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Italian Marble Flooring"
                      value={newSpecification}
                      onChange={(e) => setNewSpecification(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm outline-none focus:bg-white focus:border-[#e34b32] transition"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newSpecification.trim()) {
                          setSpecifications([...specifications, newSpecification.trim()]);
                          setNewSpecification("");
                        }
                      }}
                      className="px-4 py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {specifications.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200/60 px-3 py-1 rounded-xl text-xs text-slate-600">
                        {s}
                        <button
                          type="button"
                          onClick={() => setSpecifications(specifications.filter((_, idx) => idx !== i))}
                          className="text-slate-400 hover:text-red-500 font-bold transition ml-0.5"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    {specifications.length === 0 && <p className="text-[11px] text-slate-400 italic">No specifications added yet.</p>}
                  </div>
                </div>
              </div>

              {/* Dynamic Nested Units creation (Only during initial property creation) */}
              {!editingProperty && (
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Property Floor Plans</h3>
                    <button
                      type="button"
                      onClick={handleAddUnitField}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Plus size={13} /> Add Unit Plan
                    </button>
                  </div>

                  {units.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No specific unit plans defined. You can add them dynamically above.</p>
                  ) : (
                    <div className="space-y-4">
                      {units.map((unit, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => handleRemoveUnitField(idx)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                          
                          <p className="text-xs font-bold text-slate-600">Unit Plan #{idx + 1}</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-slate-400">Unit Type</label>
                              <select
                                value={unit.unitType}
                                onChange={(e) => handleUnitFieldChange(idx, "unitType", e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none cursor-pointer"
                              >
                                {UNIT_TYPES.map((ut) => (
                                  <option key={ut} value={ut}>{ut.replace("_", " ")}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-slate-400">Carpet Area (sqft) *</label>
                              <input
                                type="number"
                                required
                                placeholder="e.g. 1500"
                                value={unit.carpetAreaSqft}
                                onChange={(e) => handleUnitFieldChange(idx, "carpetAreaSqft", e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-slate-400">Price (₹) *</label>
                              <input
                                type="number"
                                required
                                placeholder="e.g. 24000000"
                                value={unit.price}
                                onChange={(e) => handleUnitFieldChange(idx, "price", e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-slate-400">Available Units</label>
                              <input
                                type="number"
                                placeholder="e.g. 10"
                                value={unit.availableUnits}
                                onChange={(e) => handleUnitFieldChange(idx, "availableUnits", e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Footer Buttons */}
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
                  {formSubmitting ? "Saving changes..." : editingProperty ? "Save Details" : "Create Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Management Overlay Modal */}
      {mediaModalOpen && mediaProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMediaModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-2xl z-50 flex flex-col max-h-[85vh] overflow-hidden animate-reveal-up">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
              <div>
                <h3 className="font-display text-lg font-black text-slate-800">Media Gallery: {mediaProperty.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Upload images and tag them by category.</p>
              </div>
              <button
                onClick={() => setMediaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                Close
              </button>
            </div>

            {/* Scrollable Gallery list & uploads */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              
              {/* Existing Images */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Existing Gallery Images</h4>
                {!mediaProperty.images || mediaProperty.images.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-dashed text-center">No images currently uploaded for this property.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {mediaProperty.images.map((img) => {
                      const url = getAssetUrl(img.imageUrl);
                      return (
                        <div key={img.id} className="relative group/img aspect-video rounded-xl bg-slate-50 overflow-hidden border border-slate-100">
                          {url && <img src={url} alt={img.caption || ""} className="w-full h-full object-cover" />}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleDeleteImage(img.id!)}
                              className="p-1.5 bg-red-600 rounded-lg text-white hover:bg-red-700 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <span className="absolute bottom-2 left-2 bg-slate-900/60 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                            {img.imageType}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Upload Form Area */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Upload New Media</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">Image Category</label>
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none cursor-pointer"
                    >
                      {IMAGE_TYPES.map((t) => (
                        <option key={t} value={t}>{t.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">Caption / Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Master Bedroom View"
                      value={mediaCaption}
                      onChange={(e) => setMediaCaption(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Choose Image File(s)</label>
                  <input
                    type="file"
                    ref={mediaInputRef}
                    accept="image/*"
                    multiple
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 file:cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleUploadImages}
                  disabled={formSubmitting}
                  className="w-full py-2.5 rounded-xl bg-[#e34b32] text-white font-bold text-xs hover:bg-[#d9462e] transition shadow-md disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload size={14} /> {formSubmitting ? "Uploading file..." : "Upload & Save to Gallery"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Popup for deletion */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-sm rounded-[2rem] border border-slate-100 bg-white p-6 md:p-8 shadow-2xl z-50 text-center animate-reveal-up">
            <Trash2 size={36} className="mx-auto text-red-500 mb-3" />
            <h3 className="font-display text-lg font-black text-slate-800">Archive Property Listing?</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This action will set the listing status to **ARCHIVED**. It will immediately be hidden from consumer search directories.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 border border-slate-200 bg-white rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 rounded-xl font-bold text-xs text-white hover:bg-red-700 shadow-sm cursor-pointer"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}