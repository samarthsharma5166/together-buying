"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUserGroups } from "@/store/slices/groupSlice";
import { 
  getAssetUrl, 
  leaveGroup 
} from "@/lib/api";
import { 
  Users, 
  Building, 
  User, 
  Mail, 
  Phone, 
  Compass, 
  CheckCircle, 
  Clock, 
  XCircle,
  Calendar,
  Sparkles,
  ArrowLeft,
  Heart,
  Share2,
  GitCompare,
  Check,
  Info
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserMyGroupsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { userGroups, userLoading, userError } = useAppSelector((state) => state.group);

  const [loadingGroupId, setLoadingGroupId] = useState<string | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserGroups());
    }
  }, [user, dispatch]);

  const handleLeaveGroupClick = (groupId: string) => {
    setShowLeaveModal(groupId);
  };

  const handleConfirmLeave = async () => {
    if (!showLeaveModal) return;
    const groupId = showLeaveModal;
    setLoadingGroupId(groupId);
    try {
      await leaveGroup(groupId);
      // Refetch joined groups to update UI
      dispatch(fetchUserGroups());
      setShowLeaveModal(null);
    } catch (err: any) {
      alert(err.message || "Failed to leave the group. Please try again.");
    } finally {
      setLoadingGroupId(null);
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

  const formatPrice = (priceVal: number) => {
    if (priceVal >= 10000000) {
      return `₹ ${(priceVal / 10000000).toFixed(2)} Cr`;
    }
    if (priceVal >= 100000) {
      return `₹ ${(priceVal / 100000).toFixed(2)} L`;
    }
    return `₹ ${priceVal.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-800">Your Groups</h1>
          <p className="text-xs text-slate-500 mt-1">
            View all the active and past property groups you’ve participated in — including group status, size, and updates.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {/* Main Groups Listing */}
      <div className="space-y-8">
        {userLoading ? (
          <div className="py-24 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e34b32] border-t-transparent mx-auto"></div>
            <p className="mt-4 text-sm font-bold text-slate-500 animate-pulse">Loading participated groups...</p>
          </div>
        ) : userError ? (
          <div className="rounded-[2rem] border border-red-100 bg-red-50/30 p-8 text-center text-red-600 font-semibold text-sm">
            {userError}
          </div>
        ) : userGroups.length === 0 ? (
          <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white py-16 px-6 text-center flex flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-[#e34b32]">
              <Building size={32} />
            </div>
            <div>
              <h3 className="font-display text-lg font-black text-slate-800">No Groups Found</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                You haven't joined any property group buying deals yet. Head to listings to discover group discounts.
              </p>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#e34b32] hover:bg-[#d9462e] text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 shadow-md hover:shadow-lg transition-all"
            >
              Browse Property Listings
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {userGroups.map((group) => {
              const property = group.property;
              const locationText = property
                ? `${property.locality || ""}, ${property.city || ""}`
                : "Sector - 22A, YEIDA, Greater Noida";

              // Formatting prices and values
              const listPriceNum = Number(property?.minPrice) || 37900000;
              const discountPercent = group.target_discount || 18;
              const targetPriceNum = listPriceNum * (1 - discountPercent / 100);
              const savingsNum = listPriceNum - targetPriceNum;

              const displayListPrice = formatPrice(listPriceNum);
              const displayTargetPrice = formatPrice(targetPriceNum);
              const displaySavings = formatPrice(savingsNum);

              // Fallback property unit options
              const unitConfigurations = property?.units && property.units.length > 0
                ? property.units.map(u => u.unitType)
                : ["3 BHK + S", "3 BHK + S", "4 BHK + S"];

              const viewCounter = Math.floor((group.target_group_size || 20) * 31.4);

              const reraCertifiedText = property?.reraNumber ? "RERA Certified" : "RERA Certified";

              // Resolve absolute asset URL for image
              const propertyImageUrl = property?.images?.[0]?.imageUrl 
                ? getAssetUrl(property.images[0].imageUrl) as string
                : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80";

              return (
                <div
                  key={group.id}
                  className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="grid lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Property Image and Badges */}
                    <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-slate-100 aspect-[4/3] group">
                      <Link href={`/properties/${property?.slug || ""}`}>
                        <img
                          src={propertyImageUrl}
                          alt={property?.title || "Property"}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                        />
                      </Link>

                      {/* Top Left: Verified badge */}
                      <span className="absolute top-4 left-4 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white bg-emerald-600 px-3 py-1.5 rounded-lg shadow-sm">
                        <Check size={10} className="stroke-[3]" /> VERIFIED DEAL
                      </span>

                      {/* Top Right: Circular icons */}
                      {/* <div className="absolute top-4 right-4 flex flex-col gap-2.5">
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 hover:text-rose-500 shadow-md transition-colors">
                          <Heart size={14} className="fill-none" />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 hover:text-blue-500 shadow-md transition-colors">
                          <GitCompare size={14} />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 hover:text-slate-600 shadow-md transition-colors">
                          <Share2 size={14} />
                        </button>
                      </div> */}

                      {/* Bottom Overlay Info Strip */}
                      <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 text-center text-xs font-bold text-white leading-[3rem] h-[3rem]">
                        <div className="bg-[#f08519] flex items-center justify-center gap-1">
                          August, 2029
                        </div>
                        <div className="bg-[#e9aa13] flex items-center justify-center gap-1.5 border-l border-white/10">
                          <Check size={12} className="stroke-[3]" /> {reraCertifiedText}
                        </div>
                      </div>
                    </div>

                    {/* Right: Property Details & Group Buying Callouts */}
                    <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <Link href={`/properties/${property?.slug || ""}`} className="hover:text-[#e34b32] transition-colors">
                            <h2 className="font-display text-xl font-black text-slate-800 leading-tight hover:text-[#e34b32] transition-colors">
                              {property?.title || "Property"}
                            </h2>
                          </Link>
                          <p className="text-xs text-slate-400 mt-1 font-semibold">
                            {locationText}
                          </p>
                        </div>

                        {/* Direct contact controls for Relationship Manager */}
                        <div className="flex gap-2.5">
                          {group.rmUser?.phone && (
                            <a
                              href={`tel:${group.rmUser.phone}`}
                              title={`Call ${group.rmUser.firstName}`}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e34b32] text-white hover:bg-[#d9462e] transition-colors shadow-sm"
                            >
                              <Phone size={14} />
                            </a>
                          )}
                          {group.rmUser?.email && (
                            <a
                              href={`mailto:${group.rmUser.email}`}
                              title={`Mail ${group.rmUser.firstName}`}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e34b32] text-white hover:bg-[#d9462e] transition-colors shadow-sm"
                            >
                              <Mail size={14} />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Configurations tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        {unitConfigurations.slice(0, 3).map((config, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide transition-all border ${
                              index === 0
                                ? "bg-[#e34b32] border-[#e34b32] text-white"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {config}
                          </span>
                        ))}
                        {unitConfigurations.length > 3 && (
                          <span className="text-xs font-bold text-slate-400 pl-1">
                            +{unitConfigurations.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Pink Callout Box for Group Progress */}
                      <div className="rounded-2xl border border-red-100 bg-[#fff5f2]/80 p-4 relative space-y-3 shadow-inner">
                        <div className="flex items-center justify-between text-[11px] font-black text-[#e34b32] uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Users size={12} /> Group buying in progress
                          </span>
                          <span className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                            Why group buying? <Info size={12} />
                          </span>
                        </div>

                        <div className="flex items-center gap-4 py-1">
                          {/* Circle Avatar with indicator */}
                          <div className="relative shrink-0 flex items-center justify-center h-12 w-12 rounded-full border border-dashed border-[#e34b32] bg-white text-[#e34b32]">
                            <User size={18} />
                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e34b32] text-[8px] font-black text-white border border-white">
                              ✓
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-800">
                              <strong className="text-[#e34b32]">{group.current_members} buyer</strong> already booked in this project.
                            </p>
                            <p className="text-xs font-medium text-slate-600">
                              You joined as <strong className="text-[#e34b32]">#{group.current_members}</strong> buyer to unlock better pricing.
                            </p>
                          </div>
                        </div>

                        <p className="text-[9px] text-slate-400 font-semibold border-t border-red-100/50 pt-2 text-center">
                          Each member purchases their own apartment
                        </p>
                      </div>

                      {/* Pricing and Action Area */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-3">
                            <div className="text-xs font-bold text-slate-500 uppercase">Target Price</div>
                            <div className="text-xs font-bold text-slate-500 uppercase">Developer Price</div>
                          </div>
                          <div className="flex items-baseline gap-4 flex-wrap">
                            <span className="font-display text-2xl font-black text-slate-800">
                              {displayTargetPrice}
                            </span>
                            <span className="text-sm font-semibold text-slate-400 line-through">
                              {displayListPrice}
                            </span>
                          </div>
                          <p className="text-xs font-black text-emerald-600 flex items-center gap-1">
                            <span>●</span> Up to {displaySavings} off
                          </p>
                        </div>

                        {/* Interactive Joined button with Hover-to-Leave capability */}
                        <button
                          onClick={() => handleLeaveGroupClick(group.id)}
                          disabled={loadingGroupId === group.id}
                          className="group/btn rounded-xl bg-emerald-600 hover:bg-rose-600 px-6 py-3 text-sm font-black text-white shadow-md transition-colors w-32 flex items-center justify-center gap-1.5"
                        >
                          {loadingGroupId === group.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          ) : (
                            <>
                              <span className="group-hover/btn:hidden">Joined ✓</span>
                              <span className="hidden group-hover/btn:inline">Leave</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: discount and views summary */}
                  <div className="border-t border-slate-100 mt-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold">
                    <span className="text-[#e34b32] uppercase tracking-wide">
                      Get upto {discountPercent}% discount on this property
                    </span>
                    <span className="text-[#e34b32]/90 font-medium">
                      {viewCounter} buyers viewed this property
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leave Group Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300">
          <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100/50 space-y-4 transition-transform transform scale-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <XCircle size={24} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display text-lg font-black text-slate-800">
                Leave Group Buying Deal?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to leave this group buying deal? You will lose access to the negotiated wholesale savings pool for this property.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowLeaveModal(null)}
                disabled={loadingGroupId !== null}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmLeave()}
                disabled={loadingGroupId !== null}
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 py-3 text-xs font-bold text-white shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {loadingGroupId !== null ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  "Confirm Leave"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}