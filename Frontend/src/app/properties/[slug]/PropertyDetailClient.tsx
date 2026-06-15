"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  CalendarDays, 
  Users, 
  Share2, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Phone, 
  MessageSquare, 
  Compass, 
  CheckCircle2, 
  Plus, 
  ChevronRightSquare,
  BadgePercent,
  Check,
  Home,
  Info,
  Layers,
  HelpCircle,
  TrendingUp,
  Map,
  UserCheck,
  Wifi,
  Zap,
  AlertCircle
} from "lucide-react";
import { Button, ButtonLink } from "@/components/button";
import { formatPrice, initials } from "@/lib/utils";
import { getAssetUrl, adminListSubscriptionPlans, type SubscriptionPlan, type Property, type PropertyUnit, type PropertyImage } from "@/lib/api";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { fetchCurrentUser } from "@/store/slices/authSlice";
import { payWithRazorpay } from "@/lib/razorpay";


type Props = {
  property: Property;
  related: Property[];
};

const DEFAULT_REAL_ESTATE_IMAGES = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
];

// Circular progress bar constants
const CIRCLE_SIZE = 190;
const STROKE = 14;
const RADIUS = (CIRCLE_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function PropertyDetailClient({ property, related }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const isPremium = !!(user && (user.role === "BUYER_PREMIUM" || user.role === "RM" || user.role === "ADMIN" || user.role === "SUPER_ADMIN")) && !property.isLockedPlaceholder;

  // Protect detail page from unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/properties/${property.slug || property.id}`);
    }
  }, [user, loading, router, property]);

  // Automatically trigger server component refresh to fetch full details once user upgrades to premium
  useEffect(() => {
    const hasPremiumRole = !!(user && (user.role === "BUYER_PREMIUM" || user.role === "RM" || user.role === "ADMIN" || user.role === "SUPER_ADMIN"));
    if (hasPremiumRole && property.isLockedPlaceholder) {
      router.refresh();
    }
  }, [user, property.isLockedPlaceholder, router]);

  // Fetch plans if the logged-in user is not premium
  useEffect(() => {
    if (user && user.role === "USER") {
      setPlansLoading(true);
      setPayError(null);
      adminListSubscriptionPlans()
        .then((res) => {
          const sorted = (res.data || []).sort((a, b) => a.price - b.price);
          setPlans(sorted);
        })
        .catch((err) => {
          console.error("Failed to load plans", err);
          setPayError("Failed to fetch subscription options.");
        })
        .finally(() => {
          setPlansLoading(false);
        });
    }
  }, [user]);

  const handlePurchase = async (planId: string) => {
    if (!user) return;
    setPayingPlanId(planId);
    setPayError(null);
    try {
      await payWithRazorpay({
        planId,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        userPhone: user.phone || "9999999999",
        onSuccess: async () => {
          setPayingPlanId(null);
          await dispatch(fetchCurrentUser());
          router.refresh();
        },
        onFailure: (err) => {
          setPayError(err.description || err.message || "Payment transaction failed.");
          setPayingPlanId(null);
        },
        onMockSuccess: async () => {
          setPayingPlanId(null);
          await dispatch(fetchCurrentUser());
          router.refresh();
        },
      });
    } catch (err: any) {
      setPayError(err.message || "An unexpected error occurred.");
      setPayingPlanId(null);
    }
  };

  // 1. Carousel State
  const propertyImages = useMemo(() => {
    if (property.images && property.images.length > 0) {
      return property.images.map(img => getAssetUrl(img.imageUrl)).filter(Boolean) as string[];
    }
    return [];
  }, [property.images]);

  const carouselImages = useMemo(() => {
    if (propertyImages.length > 0) {
      return propertyImages;
    }
    return DEFAULT_REAL_ESTATE_IMAGES;
  }, [propertyImages]);

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  // 2. Group Buying State
  const [joinedGroup, setJoinedGroup] = useState(false);
  const mockBaseMembers = property.totalUnits ? Math.floor(property.totalUnits * 0.08) : 24;
  const membersCount = mockBaseMembers + (joinedGroup ? 1 : 0);

  // 3. Tab State
  const tabs = useMemo(() => {
    const list = [{ id: "details", label: "Property Details" }];
    
    if (property.highlights && property.highlights.length > 0) {
      list.push({ id: "highlights", label: "Highlights" });
    }
    
    const hasUnits = property.units && property.units.length > 0;
    const hasMasterPlan = property.images && property.images.some(img => img.imageType === "MASTER_PLAN");
    const hasUnitImages = property.units && property.units.some(unit => unit.images && unit.images.length > 0);
    
    if (hasUnits || hasMasterPlan || hasUnitImages) {
      list.push({ id: "layout", label: "Layout Plan" });
    }
    
    list.push({ id: "emi", label: "EMI Calculator" });
    
    if (property.amenities && property.amenities.length > 0) {
      list.push({ id: "amenities", label: "Amenities" });
    }
    
    if (property.specifications && property.specifications.length > 0) {
      list.push({ id: "specifications", label: "Specifications" });
    }
    
    list.push({ id: "location", label: "Location" });
    
    if (property.developer) {
      list.push({ id: "developer", label: "About Developer" });
    }
    
    return list;
  }, [property]);

  const [activeTab, setActiveTab] = useState("details");

  // 4. Layout plan subtabs
  const layoutSubTabs = useMemo(() => {
    const subTabs: { id: string; label: string }[] = [];
    
    const masterPlanImg = property.images?.find(img => img.imageType === "MASTER_PLAN");
    if (masterPlanImg) {
      subTabs.push({ id: "master", label: "Master Plan" });
    }
    
    if (property.units && property.units.length > 0) {
      property.units.forEach((unit, uIdx) => {
        subTabs.push({ id: `unit-${uIdx}`, label: `${unit.unitType} (${formatPrice(unit.price)})` });
      });
    }
    
    return subTabs;
  }, [property]);

  const [activeLayoutSubTab, setActiveLayoutSubTab] = useState("");

  useEffect(() => {
    if (layoutSubTabs.length > 0) {
      const exists = layoutSubTabs.some(tab => tab.id === activeLayoutSubTab);
      if (!exists) {
        setActiveLayoutSubTab(layoutSubTabs[0].id);
      }
    } else {
      setActiveLayoutSubTab("");
    }
  }, [layoutSubTabs, activeLayoutSubTab]);

  // 5. EMI Calculator State
  const minPriceNum = Number(property.minPrice) || 8000000;
  const maxPriceNum = Number(property.maxPrice) || 12000000;

  const [loanAmount, setLoanAmount] = useState(Math.round(minPriceNum * 0.8));
  const [downPayment, setDownPayment] = useState(Math.round(minPriceNum * 0.2));
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);

  useEffect(() => {
    setLoanAmount(Math.round(minPriceNum * 0.8));
    setDownPayment(Math.round(minPriceNum * 0.2));
  }, [minPriceNum]);

  const emiCalculations = useMemo(() => {
    const principal = Math.max(0, loanAmount - downPayment);
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = loanTenure * 12;

    let monthlyEmi = 0;
    if (principal > 0 && monthlyRate > 0) {
      monthlyEmi = Math.round(
        (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      );
    } else if (principal > 0 && monthlyRate === 0) {
      monthlyEmi = Math.round(principal / totalMonths);
    }

    const totalPayable = monthlyEmi * totalMonths;
    const totalInterest = Math.max(0, totalPayable - principal);

    // Circle progress representation
    const progress = Math.min(0.9, Math.max(0.1, (monthlyEmi / (minPriceNum * 0.015)) * 0.5));
    const dashOffset = CIRCUMFERENCE * (1 - progress);

    return {
      principal,
      monthlyEmi,
      totalPayable,
      totalInterest,
      progress,
      dashOffset
    };
  }, [loanAmount, downPayment, interestRate, loanTenure, minPriceNum]);

  // Derived Pricing Calculations
  const calculatedDiscount = useMemo(() => {
    const min = Number(property.minPrice) || 0;
    const max = Number(property.maxPrice) || 0;
    if (max && min && max > min) {
      const discountVal = max - min;
      const pct = Math.round((discountVal / max) * 100);
      return {
        value: discountVal,
        percentage: pct,
        hasDiscount: true
      };
    }
    return {
      value: 0,
      percentage: 0,
      hasDiscount: false
    };
  }, [property.minPrice, property.maxPrice]);

  // Handlers
  const handlePrevImage = () => {
    setActiveImgIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImgIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const rmUser = useMemo(() => {
    return property.groups?.[0]?.rmUser;
  }, [property.groups]);

  const rmName = rmUser ? `${rmUser.firstName} ${rmUser.lastName}` : "Shweta Sharma";
  const rmPhone = rmUser?.phone || "9999999999";
  const rmEmail = rmUser?.email || "shweta@togetherbuying.com";

  const firstUnit = property.units?.[0];

  const superAreaText = useMemo(() => {
    if (!property.units || property.units.length === 0) return "On Request";
    const areas = property.units.map(u => u.superAreaSqft || u.carpetAreaSqft).filter(Boolean) as number[];
    if (areas.length === 0) return "On Request";
    const minArea = Math.min(...areas);
    const maxArea = Math.max(...areas);
    return minArea === maxArea ? `${minArea} sq.ft.` : `${minArea} - ${maxArea} sq.ft.`;
  }, [property.units]);

  const configurations = useMemo(() => {
    if (!property.units || property.units.length === 0) return "N/A";
    return Array.from(new Set(property.units.map(u => u.unitType))).join(", ");
  }, [property.units]);

  const carpetAreaText = useMemo(() => {
    if (!property.units || property.units.length === 0) return "Area on request";
    const areas = property.units.map(u => u.carpetAreaSqft).filter(Boolean) as number[];
    if (areas.length === 0) return "Area on request";
    const minArea = Math.min(...areas);
    const maxArea = Math.max(...areas);
    return minArea === maxArea ? `${minArea} Sq.ft.` : `${minArea} - ${maxArea} Sq.ft.`;
  }, [property.units]);

  const possessionDateText = useMemo(() => {
    if (!property.possessionDate) return "On Request";
    try {
      return new Date(property.possessionDate).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    } catch {
      return String(property.possessionDate);
    }
  }, [property.possessionDate]);

  return (
    <main className="bg-[#fcfdfd] py-6 pb-20">
      <div className="container-shell">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-[#e34b32] transition">Home</Link>
          <ChevronRight size={12} className="text-slate-400" />
          <Link href="/properties" className="hover:text-[#e34b32] transition">Properties</Link>
          <ChevronRight size={12} className="text-slate-400" />
          {property.city && (
            <>
              <Link href={`/properties?city=${property.city}`} className="hover:text-[#e34b32] transition">
                {property.city}
              </Link>
              <ChevronRight size={12} className="text-slate-400" />
            </>
          )}
          <span className="font-bold text-slate-800 line-clamp-1">{property.title}</span>
        </nav>

        {/* Section 1: Hero Information Grid */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] items-start mb-10">
          {/* Hero Left - Project Details Header */}
          <div className="rounded-[2.5rem] bg-white p-8 premium-border shadow-sm relative overflow-hidden flex flex-col h-full justify-between">
            {/* Subtle architectural background pattern */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-full pointer-events-none opacity-50" />
            
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {firstUnit && (
                  <span className="rounded-full bg-[#e34b32] px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                    {firstUnit.unitType}
                  </span>
                )}
                {property.isPreLaunch && (
                  <span className="rounded-full bg-[#f3b64a] px-4 py-1.5 text-xs font-bold text-slate-900 shadow-sm">
                    Pre Launch
                  </span>
                )}
                {property.isFeatured && (
                  <span className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                    Featured
                  </span>
                )}
                <span className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-600">
                  {property.propertyType}
                </span>
              </div>

              <h1 className="font-display text-4xl font-black tracking-tight text-[#111111] md:text-5xl lg:text-5xl leading-tight">
                {property.title}
              </h1>

              <p className="mt-3 flex items-start gap-1.5 text-slate-600 text-sm md:text-base">
                <MapPin size={18} className="text-[#e34b32] shrink-0 mt-0.5" />
                <span>{property.address || `${property.locality ? `${property.locality}, ` : ""}${property.city || "Delhi NCR"}`}</span>
              </p>

              <p className="mt-4 text-sm font-bold text-slate-600 tracking-wide">
                Super area : <span className="text-slate-900 font-extrabold">{superAreaText}</span>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-6 items-end">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Target Price</p>
                  <p className="mt-1 font-display text-3xl font-black text-[#e34b32] tracking-tight">
                    {formatPrice(property.minPrice)}
                  </p>
                  {calculatedDiscount.hasDiscount && (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <BadgePercent size={14} /> Up to {formatPrice(calculatedDiscount.value)} off
                    </span>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Developer Price</p>
                  <p className="mt-1 font-display text-2xl font-bold text-slate-400 line-through tracking-tight">
                    {formatPrice(property.maxPrice)}
                  </p>
                  {calculatedDiscount.hasDiscount && (
                    <p className="mt-1.5 text-xs font-bold text-[#e34b32]">
                      Get upto {calculatedDiscount.percentage}% discount on this property
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right - Interactive Showcase Carousel */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2.5rem] bg-slate-900 premium-border shadow-[0_20px_50px_rgba(15,35,64,0.06)] group">
            {/* Main Active Image */}
            <Image
              src={carouselImages[activeImgIndex]}
              alt={property.title}
              fill
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            
            {/* Gradient Overlays */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

            {/* Quick Actions (Floating Right) */}
            <div className="absolute top-5 right-5 flex flex-col gap-2.5 z-10">
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition hover:scale-105 active:scale-95"
                title="Add to wishlist"
              >
                <Heart size={18} className={isLiked ? "fill-red-500 text-red-500" : "text-slate-600"} />
              </button>
              <button 
                onClick={handleShare}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition hover:scale-105 active:scale-95"
                title="Copy Page Link"
              >
                <Share2 size={18} className="text-slate-600" />
                {copied && (
                  <span className="absolute right-12 top-1.5 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-[10px] font-black text-white transition-opacity duration-300">
                    Link copied!
                  </span>
                )}
              </button>
            </div>

            {/* Carousel Controls (Overlaid) */}
            <button 
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-800 backdrop-blur-sm shadow-md transition hover:bg-white hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-800 backdrop-blur-sm shadow-md transition hover:bg-white hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>

            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {carouselImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${activeImgIndex === idx ? "w-6 bg-white" : "w-2 bg-white/50"}`}
                />
              ))}
            </div>

            {/* RERA Floating Stamp */}
            {property.reraNumber && (
              <div className="absolute bottom-4 right-4 z-10 rounded-md bg-white/90 px-2.5 py-1 text-[10px] font-black tracking-wider text-slate-800 uppercase backdrop-blur-xs shadow-xs">
                Rera Number - {property.reraNumber}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Group Buying Status & Campaign Board */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1.1fr_.9fr] mb-12">
          {/* Left Box: Active Group Buyers Count Widget */}
          <div className="rounded-[2.2rem] bg-[#f9fafb] p-6 lg:p-8 premium-border flex flex-col md:flex-row items-center gap-6 lg:gap-8 shadow-xs">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff3ef] text-[#e34b32] shadow-xs shrink-0">
                  <Users size={24} className="stroke-[2.5]" />
                </div>
                <div>
                  <p className="font-display text-2xl font-black text-[#111111]">
                    <span className="text-[#e34b32]">{membersCount} Members</span>
                  </p>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">in this group buying club</p>
                </div>
              </div>
              
              <p className="text-sm font-semibold text-slate-600 text-center md:text-left leading-relaxed max-w-[280px]">
                Join more buyers and unlock best bulk savings and direct developer negotiations.
              </p>

              <button
                onClick={() => setJoinedGroup(!joinedGroup)}
                className={`mt-2 flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-extrabold transition-all duration-300 w-full md:w-auto shadow-md ${
                  joinedGroup 
                    ? "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700" 
                    : "bg-[#e34b32] text-white shadow-orange-100 hover:bg-[#d9462e] hover:scale-[1.02]"
                }`}
              >
                {joinedGroup ? (
                  <>
                    <UserCheck size={16} />
                    <span>Joined Group ✓</span>
                  </>
                ) : (
                  <>
                    <span>Join Group</span>
                    <Plus size={16} />
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-32 bg-slate-200" />

            {/* Member status details */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              {joinedGroup ? (
                <div className="animate-fade-in">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check size={20} className="stroke-[3]" />
                  </div>
                  <h4 className="mt-3 font-display text-base font-black text-slate-900">You are in!</h4>
                  <p className="mt-1 text-xs font-bold text-slate-500 max-w-[200px] mx-auto">
                    We will notify you as soon as developer discount tiers are unlocked.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-slate-400 font-display text-sm font-bold">Group Status</p>
                  <h4 className="mt-2 font-display text-lg font-black text-slate-800">No Members Have Joined Yet</h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-[200px] mx-auto">
                    Be the first buyer to initiate group buying on this premium property.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Box: Premium Orange Banner */}
          <div className="rounded-[2.2rem] bg-gradient-to-br from-[#e34b32] via-[#e34b32] to-[#f36a4b] p-6 lg:p-8 text-white relative overflow-hidden flex items-center justify-between shadow-lg shadow-orange-500/10">
            {/* Decorative background vectors */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_50%)]" />
            
            <div className="z-10 max-w-[55%]">
              <h3 className="font-display text-xl lg:text-2xl font-black leading-tight tracking-tight">
                One step closer to your dream home
              </h3>
              
              <ul className="mt-5 space-y-3.5 text-xs font-black tracking-wide uppercase">
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                    %
                  </span>
                  <span>Cheapest deal in the market</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                    ✓
                  </span>
                  <span>100% Transparent & trustworthy</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                    ★
                  </span>
                  <span>Guaranteed best price</span>
                </li>
              </ul>
            </div>

            {/* Happy Family Graphic Card */}
            <div className="relative w-[40%] aspect-[4/5] rounded-2xl overflow-hidden shadow-md shrink-0 self-stretch my-auto">
              <Image 
                src="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80" 
                alt="Happy family hugging in their dream home" 
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Bottom Switcher Tabs Grid */}
        <div className="mb-4 overflow-x-auto scrollbar-none border-b border-slate-200">
          <div className="flex space-x-1.5 pb-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-5 py-2.5 text-xs font-black tracking-wide transition ${
                  activeTab === tab.id
                    ? "bg-[#fff3ef] text-[#e34b32] shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Detail Pane & Sidebars Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-start relative">
          
          {!isPremium && (
            <div className="absolute inset-0 z-40 bg-[#fcfdfd]/60 backdrop-blur-md flex items-center justify-center p-4 min-h-[550px] rounded-[2.5rem]">
              <div className="w-full max-w-2xl rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 md:p-10 text-white border border-slate-800 shadow-2xl relative overflow-hidden text-center">
                {/* Decorative background gradients */}
                <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-[#e34b32]/20 blur-3xl pointer-events-none" />
                <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
                
                <div className="max-w-xl mx-auto">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/10 text-[#e34b32] mb-6 shadow-md shadow-orange-950/20">
                    <Zap size={28} className="stroke-[2.5] animate-pulse" />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-black tracking-tight">
                    Premium Gated Blueprint Details
                  </h3>
                  <p className="mt-3 text-xs md:text-sm text-slate-400 leading-relaxed font-semibold">
                    Unlock detailed master layouts, exact area measurements, location coordinates, download the developer brochure, and chat directly with {rmName} (Senior RM).
                  </p>
                </div>

                {payError && (
                  <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-red-950/40 border border-red-900/60 p-3 text-red-200 text-xs text-left">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{payError}</span>
                  </div>
                )}

                <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4 text-slate-900">
                  {plansLoading ? (
                    <div className="col-span-full py-8 text-center text-slate-400">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e34b32] border-t-transparent mx-auto"></div>
                      <p className="mt-2 text-xs font-semibold">Loading membership pricing...</p>
                    </div>
                  ) : plans.length === 0 ? (
                    <div className="col-span-full py-4 text-xs font-semibold text-slate-400 text-center">
                      No active plans online. Click below to view options.
                    </div>
                  ) : (
                    plans.map((p) => {
                      const isPaying = payingPlanId === p.id;
                      return (
                        <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#e34b32]">
                              {p.type.replace("_", " ")}
                            </span>
                            <p className="mt-1 font-display text-base font-black text-slate-900">
                              {formatPrice(p.price)}
                            </p>
                          </div>
                          <button
                            onClick={() => handlePurchase(p.id)}
                            disabled={!!payingPlanId}
                            className="mt-4 w-full rounded-full bg-slate-950 hover:bg-[#e34b32] text-white py-2.5 text-[9px] font-black uppercase tracking-wider transition disabled:opacity-50"
                          >
                            {isPaying ? "Paying..." : "Unlock"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800/80 text-slate-500 text-[10px] font-semibold">
                  Secured payment checkouts powered by Razorpay. Direct account role upgrade to Buyer Premium.
                </div>
              </div>
            </div>
          )}

          {/* TAB DETAILED PANELS (LEFT) */}
          <div className="space-y-8 min-h-[420px]">
            
            {/* 3.1 PROPERTY DETAILS TAB */}
            {activeTab === "details" && (
              <div className="rounded-[2rem] bg-white p-7 premium-border shadow-xs animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                  <div>
                    <h2 className="font-display text-2xl font-black text-[#111111]">Property Details</h2>
                    <p className="text-xs font-bold text-slate-500 mt-1">Detailed specifications and registration metadata</p>
                  </div>
                  <button className="flex items-center gap-1.5 self-start sm:self-center rounded-full bg-[#e34b32] text-white px-5 py-2.5 text-xs font-extrabold hover:bg-[#d9462e] transition shadow-xs">
                    <Download size={14} /> Download Brochure
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm mb-8">
                  <div className="p-3.5 bg-slate-50/50 rounded-xl">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Units</span>
                    <strong className="block text-slate-800 text-sm mt-1">
                      {property.totalUnits !== null && property.totalUnits !== undefined ? `${property.totalUnits} Units` : "On Request"}
                    </strong>
                  </div>
                  
                  <div className="p-3.5 bg-slate-50/50 rounded-xl">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Configuration</span>
                    <strong className="block text-slate-800 text-sm mt-1">{configurations}</strong>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Possession Status</span>
                    <strong className="block text-slate-800 text-sm mt-1 capitalize">
                      {property.possessionStatus?.toLowerCase().replace(/_/g, " ") || "On Request"}
                    </strong>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Carpet Area</span>
                    <strong className="block text-slate-800 text-sm mt-1">
                      {carpetAreaText}
                    </strong>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">RERA ID</span>
                    <strong className="block text-slate-800 text-sm mt-1 truncate" title={property.reraNumber || "N/A"}>
                      {property.reraNumber || "On Request"}
                    </strong>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Possession Date</span>
                    <strong className="block text-slate-800 text-sm mt-1">
                      {possessionDateText}
                    </strong>
                  </div>

                  {property.developer && (
                    <div className="p-3.5 bg-slate-50/50 rounded-xl">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Developer</span>
                      <strong className="block text-[#e34b32] text-sm mt-1 truncate hover:underline">
                        <Link href={property.developer.slug ? `/developers/${property.developer.slug}` : "#"}>
                          {property.developer.companyName}
                        </Link>
                      </strong>
                    </div>
                  )}

                  <div className="p-3.5 bg-slate-50/50 rounded-xl">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Launch Date</span>
                    <strong className="block text-slate-800 text-sm mt-1">
                      {property.createdAt ? new Date(property.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "N/A"}
                    </strong>
                  </div>
                </div>

                {property.description && (
                  <div className="border-t border-slate-100 pt-6">
                    <h3 className="font-display text-lg font-black text-slate-900 mb-3">Overview</h3>
                    <p className="text-slate-600 text-sm leading-7 whitespace-pre-line">
                      {property.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 3.2 HIGHLIGHTS TAB */}
            {activeTab === "highlights" && property.highlights && property.highlights.length > 0 && (
              <div className="rounded-[2rem] bg-white p-7 premium-border shadow-xs animate-fade-in">
                <h2 className="font-display text-2xl font-black text-[#111111] mb-6">Highlights</h2>
                
                <div className="space-y-4">
                  {property.highlights.map((item, index) => (
                    <div key={index} className="flex items-center gap-3.5 p-4 bg-slate-50/80 rounded-2xl hover:bg-slate-100/50 transition">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fff3ef] text-[#e34b32]">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3.3 LAYOUT PLAN TAB */}
            {activeTab === "layout" && (
              <div className="rounded-[2rem] bg-white p-7 premium-border shadow-xs animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                  <div>
                    <h2 className="font-display text-2xl font-black text-[#111111]">Layout Plan</h2>
                    <p className="text-xs font-bold text-slate-500 mt-1">Master plan and floor layout dimensions</p>
                  </div>
                  <button className="flex items-center gap-1.5 self-start sm:self-center rounded-full bg-[#e34b32] text-white px-5 py-2.5 text-xs font-extrabold hover:bg-[#d9462e] transition shadow-xs">
                    <Download size={14} /> Download Floor Plans
                  </button>
                </div>

                {/* Subtabs inside Layout Plan */}
                {layoutSubTabs.length > 0 && (
                  <div className="flex space-x-1.5 mb-6 p-1 bg-slate-100/70 rounded-full w-fit">
                    {layoutSubTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveLayoutSubTab(tab.id)}
                        className={`rounded-full px-4.5 py-2 text-xs font-extrabold transition ${
                          activeLayoutSubTab === tab.id
                            ? "bg-white text-[#e34b32] shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Interactive Diagram / Sketch Screen */}
                <div className="relative w-full aspect-[16/10] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center p-4">
                  {activeLayoutSubTab === "master" ? (
                    (() => {
                      const masterPlanImg = property.images?.find(img => img.imageType === "MASTER_PLAN");
                      if (masterPlanImg?.imageUrl) {
                        return (
                          <div className="relative w-full h-full">
                            <Image 
                              src={getAssetUrl(masterPlanImg.imageUrl) || ""} 
                              alt="Master Site Layout"
                              fill
                              className="object-contain"
                            />
                            {masterPlanImg.caption && (
                              <div className="absolute top-3 left-3 bg-slate-900/80 text-white rounded px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
                                {masterPlanImg.caption}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return <div className="text-slate-400 text-sm font-semibold">No Master Plan image uploaded.</div>;
                    })()
                  ) : activeLayoutSubTab.startsWith("unit-") ? (
                    (() => {
                      const uIdx = parseInt(activeLayoutSubTab.replace("unit-", ""), 10);
                      const unit = property.units?.[uIdx];
                      if (!unit) return <div className="text-slate-400 text-sm font-semibold">Unit configuration not found.</div>;
                      
                      const unitImg = unit.images?.[0];
                      if (unitImg?.imageUrl) {
                        return (
                          <div className="relative w-full h-full flex flex-col md:flex-row gap-6 items-center">
                            <div className="relative flex-1 w-full h-full min-h-[200px]">
                              <Image 
                                src={getAssetUrl(unitImg.imageUrl) || ""} 
                                alt={unitImg.caption || `${unit.unitType} Floor Plan`}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <div className="w-full md:w-56 text-xs text-slate-600 space-y-2 border-l border-slate-100 pl-4 shrink-0">
                              <h4 className="font-display text-sm font-black text-slate-800">{unit.unitType} Specifications</h4>
                              <div className="flex justify-between border-b border-slate-100 py-1.5">
                                <span>Carpet Area</span>
                                <span className="font-bold text-slate-800">{unit.carpetAreaSqft ? `${unit.carpetAreaSqft} Sq.ft.` : "N/A"}</span>
                              </div>
                              {unit.superAreaSqft && (
                                <div className="flex justify-between border-b border-slate-100 py-1.5">
                                  <span>Super Area</span>
                                  <span className="font-bold text-slate-800">{unit.superAreaSqft} Sq.ft.</span>
                                </div>
                              )}
                              <div className="flex justify-between border-b border-slate-100 py-1.5">
                                <span>Price</span>
                                <span className="font-bold text-slate-800">{formatPrice(unit.price)}</span>
                              </div>
                              {unit.availableUnits !== null && unit.availableUnits !== undefined && (
                                <div className="flex justify-between border-b border-slate-100 py-1.5">
                                  <span>Available Units</span>
                                  <span className="font-bold text-slate-800">{unit.availableUnits}</span>
                                </div>
                              )}
                              {unitImg.caption && (
                                <div className="pt-2 text-[10px] text-slate-400 font-semibold italic">
                                  Note: {unitImg.caption}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="w-full max-w-md text-center p-6 bg-white rounded-2xl shadow-xs border border-slate-100">
                          <h4 className="font-display text-lg font-black text-slate-800 mb-2">{unit.unitType}</h4>
                          <div className="text-xs text-slate-600 space-y-2 max-w-xs mx-auto mb-4">
                            <div className="flex justify-between border-b border-slate-100 py-1.5">
                              <span>Carpet Area</span>
                              <span className="font-bold text-slate-800">{unit.carpetAreaSqft ? `${unit.carpetAreaSqft} Sq.ft.` : "N/A"}</span>
                            </div>
                            {unit.superAreaSqft && (
                              <div className="flex justify-between border-b border-slate-100 py-1.5">
                                <span>Super Area</span>
                                <span className="font-bold text-slate-800">{unit.superAreaSqft} Sq.ft.</span>
                              </div>
                            )}
                            <div className="flex justify-between border-b border-slate-100 py-1.5">
                              <span>Price</span>
                              <span className="font-bold text-slate-800">{formatPrice(unit.price)}</span>
                            </div>
                          </div>
                          <div className="text-slate-400 text-xs font-semibold">No floor plan image uploaded for this unit layout.</div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-slate-400 text-sm font-semibold">Please select a layout plan sub-tab.</div>
                  )}
                </div>
              </div>
            )}

            {/* 3.4 EMI CALCULATOR TAB */}
            {activeTab === "emi" && (
              <div className="rounded-[2rem] bg-white p-6 md:p-8 premium-border shadow-xs animate-fade-in">
                <div className="mb-6 text-center md:text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#e34b32]">EMI Calculator</p>
                  <h2 className="font-display text-2xl font-black text-[#111111] mt-1">Your Monthly Home EMI</h2>
                </div>
                
                <div className="grid items-center gap-8 lg:grid-cols-[1fr_220px]">
                  {/* Sliders Form */}
                  <div className="grid gap-5">
                    <div className="grid gap-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Loan Amount</span>
                        <span className="font-black text-[#111111]">{formatPrice(loanAmount)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="500000" 
                        max={Math.max(200000000, maxPriceNum * 1.5)} 
                        step="250000" 
                        value={loanAmount} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setLoanAmount(val);
                          // Auto adjust downpayment if loanAmount drops below downpayment
                          if (val <= downPayment) {
                            setDownPayment(Math.round(val * 0.2));
                          }
                        }} 
                        className="accent-[#e34b32] h-1.5 bg-slate-100 rounded-lg cursor-pointer" 
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                        <span>5 Lacs</span>
                        <span>20 Crores</span>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Down Payment</span>
                        <span className="font-black text-[#111111]">{formatPrice(downPayment)} ({Math.round((downPayment / loanAmount) * 100) || 0}%)</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max={Math.round(loanAmount * 0.9)} 
                        step="100000" 
                        value={downPayment} 
                        onChange={(e) => setDownPayment(Number(e.target.value))} 
                        className="accent-[#e34b32] h-1.5 bg-slate-100 rounded-lg cursor-pointer" 
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                        <span>0 Lacs</span>
                        <span>90% of Loan ({formatPrice(loanAmount * 0.9)})</span>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Interest Rate (% P.A.)</span>
                        <span className="font-black text-[#111111]">{interestRate}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max="18" 
                        step="0.05" 
                        value={interestRate} 
                        onChange={(e) => setInterestRate(Number(e.target.value))} 
                        className="accent-[#e34b32] h-1.5 bg-slate-100 rounded-lg cursor-pointer" 
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                        <span>5%</span>
                        <span>18%</span>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Loan Tenure</span>
                        <span className="font-black text-[#111111]">{loanTenure} Years</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="30" 
                        value={loanTenure} 
                        onChange={(e) => setLoanTenure(Number(e.target.value))} 
                        className="accent-[#e34b32] h-1.5 bg-slate-100 rounded-lg cursor-pointer" 
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                        <span>1 Year</span>
                        <span>30 Years</span>
                      </div>
                    </div>
                  </div>

                  {/* Semicircular progress gauge */}
                  <div className="relative mx-auto flex h-[210px] w-[210px] items-center justify-center shrink-0">
                    <svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`} className="-rotate-90">
                      <circle cx={CIRCLE_SIZE / 2} cy={CIRCLE_SIZE / 2} r={RADIUS} fill="none" stroke="#eef2f6" strokeWidth={STROKE} />
                      <circle 
                        cx={CIRCLE_SIZE / 2} 
                        cy={CIRCLE_SIZE / 2} 
                        r={RADIUS} 
                        fill="none" 
                        stroke="#e34b32" 
                        strokeWidth={STROKE} 
                        strokeLinecap="round" 
                        strokeDasharray={CIRCUMFERENCE} 
                        strokeDashoffset={emiCalculations.dashOffset} 
                        className="transition-[stroke-dashoffset] duration-700 ease-out" 
                      />
                    </svg>
                    <div className="absolute text-center px-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Monthly EMI</p>
                      <p className="font-display text-2xl font-black text-[#111111] mt-1 line-clamp-1">
                        {formatPrice(emiCalculations.monthlyEmi)}
                      </p>
                      <p className="mt-1.5 text-[9px] font-black uppercase tracking-widest text-[#e34b32] bg-[#fff3ef] px-2 py-0.5 rounded-full inline-block">
                        {Math.round(emiCalculations.progress * 100)}% load
                      </p>
                    </div>
                  </div>
                </div>

                {/* Calculations Breakdowns Box */}
                <div className="mt-6 grid gap-4 rounded-[1.5rem] bg-[#fff8f6] p-5 text-[#111111] sm:grid-cols-3">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Interest Amount</span>
                    <strong className="block text-slate-800 text-sm mt-1">{formatPrice(emiCalculations.totalInterest)}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Principal Amount</span>
                    <strong className="block text-slate-800 text-sm mt-1">{formatPrice(emiCalculations.principal)}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Payable Amount</span>
                    <strong className="block text-[#e34b32] text-sm mt-1">{formatPrice(emiCalculations.totalPayable)}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* 3.5 AMENITIES TAB */}
            {activeTab === "amenities" && property.amenities && property.amenities.length > 0 && (
              <div className="rounded-[2rem] bg-white p-7 premium-border shadow-xs animate-fade-in">
                <h2 className="font-display text-2xl font-black text-[#111111] mb-6">Amenities</h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {property.amenities.map((item, idx) => (
                    <div key={idx} className="flex flex-col p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:shadow-xs transition">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff3ef] text-[#e34b32] mb-3">
                        {item.toLowerCase().includes("wifi") ? <Wifi size={18} /> : 
                         item.toLowerCase().includes("water") ? <Compass size={18} /> : 
                         item.toLowerCase().includes("electricity") ? <Zap size={18} /> : 
                         <CheckCircle2 size={18} />}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3.6 SPECIFICATIONS TAB */}
            {activeTab === "specifications" && property.specifications && property.specifications.length > 0 && (
              <div className="rounded-[2rem] bg-white p-7 premium-border shadow-xs animate-fade-in">
                <h2 className="font-display text-2xl font-black text-[#111111] mb-6">Specifications</h2>
                
                <div className="space-y-4">
                  {property.specifications.map((item, idx) => {
                    const parts = item.split(":");
                    const title = parts[0]?.trim();
                    const desc = parts.slice(1).join(":")?.trim() || "Premium design selection as standard fitment";
                    return (
                      <div key={idx} className="grid grid-cols-[120px_1fr] gap-4 p-4 border-b border-slate-100 last:border-b-0 items-start">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400 pt-0.5">{title}</span>
                        <span className="text-sm font-bold text-slate-700">{desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3.7 LOCATION TAB */}
            {activeTab === "location" && (
              <div className="rounded-[2rem] bg-white p-7 premium-border shadow-xs animate-fade-in">
                <h2 className="font-display text-2xl font-black text-[#111111] mb-2">Location</h2>
                <p className="text-sm font-semibold text-slate-600 mb-6">
                  {property.address || `${property.locality ? `${property.locality}, ` : ""}${property.city || ""}`}
                </p>

                {/* Mock Map View Card */}
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08)_1.5px,transparent_1.5px)] bg-[length:16px_16px]" />
                  <div className="z-10 text-center p-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff3ef] text-[#e34b32] mb-3 shadow-md">
                      <Map size={24} />
                    </div>
                    <h4 className="text-sm font-black text-slate-800">Map View Location</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Coordinates: {property.latitude && property.longitude ? `Latitude ${Number(property.latitude).toFixed(4)}, Longitude ${Number(property.longitude).toFixed(4)}` : "Coordinates on request"}
                    </p>
                    <button className="mt-4 rounded-full bg-[#e34b32] text-white px-5 py-2.5 text-xs font-extrabold shadow-xs hover:bg-[#d9462e] transition">
                      Get Directions
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3.8 DEVELOPER TAB */}
            {activeTab === "developer" && property.developer && (
              <div className="rounded-[2rem] bg-white p-7 premium-border shadow-xs animate-fade-in">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-6">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff3ef] font-black text-2xl text-[#df432c] border border-orange-100 shrink-0">
                    {initials(property.developer.companyName)}
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-black text-[#111111]">
                      {property.developer.companyName}
                    </h2>
                    <p className="text-xs font-bold text-slate-500 mt-1">Partnership status: Active Developer Club Member</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <p className="text-slate-600 leading-relaxed">
                    {property.developer.description || "This premium property builder is audited, registered, and verified directly under state real estate authorities (RERA). Collaborations guarantee direct price bidding channels for Together Buying club users."}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Headquarters</span>
                      <strong className="block text-slate-700 text-xs mt-1">{property.developer.headquartersCity || "N/A"}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Established Year</span>
                      <strong className="block text-slate-700 text-xs mt-1">{property.developer.establishedYear || "N/A"}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">RERA Certified</span>
                      <strong className={`block text-xs mt-1 ${property.developer.reraRegistered ? "text-emerald-600" : "text-slate-500"}`}>
                        {property.developer.reraRegistered ? "Yes, Registered" : "No / On Request"}
                      </strong>
                    </div>
                  </div>

                  {property.developer.slug && (
                    <div className="pt-4 text-center">
                      <ButtonLink href={`/developers/${property.developer.slug}`} variant="secondary" className="w-full md:w-auto">
                        View Developer Profile
                      </ButtonLink>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* PERSISTENT SIDEBAR INFO (RIGHT) */}
          <aside className="space-y-6">
            
            {/* CARD 1: VIEW LIVE TOUR */}
            <div className="rounded-[2.2rem] bg-[#fff8f6] p-5.5 premium-border shadow-xs relative overflow-hidden flex flex-col">
              {/* Blinking Live Indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full z-10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="text-[9px] font-black tracking-widest text-red-600 uppercase">Live</span>
              </div>

              <h3 className="font-display text-lg font-black text-slate-900 leading-snug">
                View this Property Live
              </h3>
              
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden mt-4 shadow-sm group border border-orange-100">
                <Image 
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80" 
                  alt="Modern premium living room showcase" 
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>

              <button className="mt-5 w-full shine bg-[#e34b32] text-white hover:bg-[#d9462e] rounded-full py-3.5 text-xs font-black uppercase tracking-wider transition shadow-md shadow-orange-500/10">
                Take a Live Tour
              </button>
            </div>

            {/* CARD 2: RELATIONSHIP MANAGER / HELP CHAT */}
            <div className="rounded-[2.2rem] bg-white p-5.5 premium-border shadow-xs flex flex-col">
              <h3 className="font-display text-lg font-black text-slate-900 leading-snug text-center">
                Hi, I am here to Answer all your queries.
              </h3>
 
              {/* RM Profile Portrait */}
              <div className="flex items-center gap-3.5 mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200">
                  <Image
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
                    alt="Senior Relationship Manager face profile"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800">{rmName}</h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Senior Relationship Manager</p>
                </div>
              </div>
 
              {/* Contact Call to actions */}
              <div className="grid gap-2.5 mt-5">
                <a 
                  href={`https://wa.me/91${rmPhone.replace(/[^0-9]/g, "")}?text=Hi,%20I'm%20interested%20in%20${encodeURIComponent(property.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full border border-[#e34b32]/20 text-[#e34b32] bg-[#fff3ef]/40 hover:bg-[#fff3ef] py-3 text-xs font-black uppercase tracking-wider transition text-center"
                >
                  <MessageSquare size={14} className="stroke-[2.5]" />
                  <span>Chat on WhatsApp</span>
                </a>
                
                <a 
                  href={`tel:+91${rmPhone.replace(/[^0-9]/g, "")}`}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#111111] text-white hover:bg-slate-900 py-3 text-xs font-black uppercase tracking-wider transition text-center"
                >
                  <Phone size={14} />
                  <span>Call back request</span>
                </a>
              </div>
            </div>

          </aside>
        </div>

        {/* RELATED PROPERTIES GRID */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200">
            <h3 className="font-display text-2xl font-black text-[#111111] mb-6">Explore related projects</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <div key={item.id} className="premium-border rounded-[2.2rem] bg-white overflow-hidden hover-lift shadow-xs">
                  <div className="relative aspect-video w-full">
                    <Image
                      src={item.images?.[0]?.imageUrl ? getAssetUrl(item.images[0].imageUrl) as string : DEFAULT_REAL_ESTATE_IMAGES[0]}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#e34b32]">{item.propertyType}</p>
                    <h4 className="font-display text-lg font-black text-[#111111] mt-1 line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin size={12} /> {item.city || "NCR NCR"}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
                      <span className="text-xs font-bold text-slate-400">Target price</span>
                      <strong className="text-sm font-black text-[#e34b32]">{formatPrice(item.minPrice)}</strong>
                    </div>
                    <ButtonLink href={`/properties/${item.slug || item.id}`} className="mt-4 w-full py-2.5 text-xs">
                      View Project Details
                    </ButtonLink>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
