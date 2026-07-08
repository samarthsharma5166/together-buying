"use client";

import { useRef } from "react";
import { PropertyCard } from "./property-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Property } from "@/lib/api";

type Props = {
  properties: Property[];
  groupTitle: string;
};

export function PropertyCarousel({ properties, groupTitle }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth > 1024 ? scrollRef.current.clientWidth / 3 : window.innerWidth > 768 ? scrollRef.current.clientWidth / 2 : scrollRef.current.clientWidth * 0.85;
      scrollRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group">
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-2 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {properties.map((property, index) => (
          <div 
            key={`${groupTitle}-${property.id}-${index}`} 
            className="w-[85vw] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 snap-start"
          >
            <PropertyCard property={property} />
          </div>
        ))}
      </div>
      
      {properties.length > 3 && (
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 z-10 hidden md:flex h-12 w-12 -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_4px_14px_rgba(0,0,0,0.1)] border border-slate-100 transition hover:bg-slate-50 opacity-0 group-hover:opacity-100 md:-left-5 lg:-left-6"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 z-10 hidden md:flex h-12 w-12 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_4px_14px_rgba(0,0,0,0.1)] border border-slate-100 transition hover:bg-slate-50 opacity-0 group-hover:opacity-100 md:-right-5 lg:-right-6"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
}
