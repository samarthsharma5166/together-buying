"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, Phone, Repeat2, Share2, ShieldCheck, Users } from "lucide-react";
import type { Property } from "@/lib/api";
import { getPropertyCarouselImages } from "@/lib/api";
import { calculateDiscount, initials, rangePrice } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openSubscriptionModal } from "@/store/slices/subscriptionSlice";
import { cn } from "@/lib/utils";
import { RiDiscountPercentFill } from "react-icons/ri";
import CardTag from "./CardTag";
import { useRouter } from "next/navigation";

function PropertyImageCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <>
      {images.map((src, slideIndex) => (
        <div
          key={`${src}-${slideIndex}`}
          className={cn(
            "property-card-carousel-slide absolute inset-0 bg-cover bg-center",
            slideIndex === index ? "opacity-100" : "opacity-0"
          )}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          {images.map((_, dotIndex) => (
            <span
              key={dotIndex}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                dotIndex === index ? "w-4 bg-white" : "w-1.5 bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </>
  );
}

function DiscountFlipper({ amount, percent }: { amount: string | number; percent: string | number }) {
  const [showAmount, setShowAmount] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowAmount((prev) => !prev);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-5 overflow-hidden w-[180px] flex items-center">
      <AnimatePresence mode="wait">
        {showAmount ? (
          <motion.div
            key="amount"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 text-[13px] flex items-center gap-1.5 font-semibold text-emerald-600"
          >
            Upto {amount} off
          </motion.div>
        ) : (
          <motion.div
            key="percent"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 text-[13px] flex items-center gap-1.5 font-semibold text-emerald-600"
          >
            <RiDiscountPercentFill className="scale-110"/> Upto {percent}% off
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PropertyCard({ property, compact = false }: { property: Property; compact?: boolean }) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const { discountPercent, formatedDiscountAmount } = useMemo(() => {
    return calculateDiscount(Number(property.minPrice || 0), Number(property.maxPrice || 0))
  }, [property.minPrice, property.maxPrice]);

  const router = useRouter();
  const carouselImages = useMemo(() => getPropertyCarouselImages(property), [property]);
  const href = `/properties/${property.slug || property.id}`;
  const joined = property.isPreLaunch ? 4 : property.isFeatured ? 7 : 2;
  const buying = property.isPreLaunch ? 5 : property.isFeatured ? 4 : 3;
  const dealLabel = property.isPreLaunch ? "Pre Launch" : property.isFeatured ? "Exclusive Deal" : "Verified Deal";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isPremium = !!(user && (user.role === "BUYER_PREMIUM" || user.role === "RM" || user.role === "ADMIN" || user.role === "SUPER_ADMIN"));
    if (user && !isPremium) {
      e.preventDefault();
      dispatch(openSubscriptionModal());
    }
  };

  return (
    <Link href={href} onClick={handleClick} className="group magnetic-card hover-lift block overflow-hidden rounded-[1.65rem] bg-white p-3 premium-border">
      <div className="relative h-72 overflow-hidden rounded-[1.1rem] bg-gradient-to-br from-slate-700 via-slate-800 to-[#111111]">
        {carouselImages.length > 0 ? (
          <PropertyImageCarousel images={carouselImages} />
        ) : (
          <div className="absolute inset-0 hero-grid opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <CardTag dealLabel={property.possessionStatus as "PRE_LAUNCH" | "UNDER_CONSTRUCTION" | "READY_TO_MOVE"}/>
        <div className="absolute right-3 top-3 z-10 grid gap-2">
          <span className="property-action"><Heart size={17} /></span>
          <span className="property-action"><Repeat2 size={16} /></span>
          <span className="property-action"><Share2 size={16} /></span>
        </div>
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold backdrop-blur">{initials(property.developer?.companyName)}</span>
          <span className="text-sm font-semibold tracking-tight">{property.developer?.companyName || "GroupBuying Partner"}</span>
        </div>
      </div>

      <div className="px-1 pb-1 pt-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-black text-[#111111]">{property.title}</h3>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500"><MapPin size={14} /> {[property.locality, property.city].filter(Boolean).join(", ") || "Sector 90, Gurugram"}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e34b32] text-white shadow-lg"><Phone size={16} /></span>
        </div>

        <div className="rounded-[1rem] bg-[#fff3ef] p-3">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-[#b43b2a]"><span><Users className="mr-1 inline" size={14} /> Group buying in progress</span><span>Why group buying?</span></div>
          <p className="text-sm font-semibold text-emerald-700">↗ {joined} joined in the last month</p>
          <p className="mt-1 text-center text-[15px] font-bold text-[#111111]">{buying} families are purchasing apartments!</p>
          <div className="mt-3 flex items-center justify-center -space-x-2">
            {[1, 2, 3, 4].map((item) => <span key={item} className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-[#e7d0c8] to-[#6f5b52] shadow-sm" />)}
            <span className="ml-3 text-sm font-semibold text-[#b43b2a]">You? Become {buying + 1}th member</span>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div className="flex flex-col">
            <div className="flex items-start gap-4">
              <div>
                <p className="text-[13px] font-medium text-[#111111] mb-0.5">Target Price</p>
                <p className="font-display text-2xl font-bold tracking-tight leading-none text-[#111111]">{rangePrice(property.minPrice, null)}</p>
              </div>
              {property.maxPrice && (
                <div>
                  <p className="text-[13px] font-medium text-[#111111] mb-0.5">Developer price</p>
                  <p className="font-display text-[20px] font-medium text-[#848696] line-through tracking-tight leading-none">{rangePrice(property.maxPrice, null)}</p>
                </div>
              )}
            </div>
            <div className="mt-1.5">
              <DiscountFlipper amount={formatedDiscountAmount} percent={discountPercent} />
            </div>
          </div>
          <span className="rounded-xl bg-[#e34b32] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:scale-105 group-hover:bg-[#111111]">Join Group</span>
        </div>

        <div className="mt-4 pt-3 flex items-center justify-between text-[11px] font-semibold text-[#e34b32] border-t border-red-100/50">
          <span>Get upto {discountPercent}% discount on this property</span>
          <span>{property.views || 0} buyers viewed this project</span>
        </div>
      </div>
    </Link>
  );
}
