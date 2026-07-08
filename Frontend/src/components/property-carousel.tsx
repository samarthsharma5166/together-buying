"use client";

import { useEffect, useRef, useState } from "react";
import { PropertyCard } from "./property-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Property } from "@/lib/api";

type Props = {
  properties: Property[];
  groupTitle: string;
};

export function PropertyCarousel({ properties, groupTitle }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      // Scroll by exactly the container's client width to swipe all visible cards at once
      const scrollAmount = container.clientWidth;
      const targetLeft = direction === "left" 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({ left: targetLeft, behavior: "smooth" });
    }
  };

  // Infinite auto-swipe animation
  useEffect(() => {
    if (properties.length <= 3 || isHovered) return;

    const timer = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        // If we reached the end (with a small 10px buffer for sub-pixel rounding)
        if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 10) {
          // Loop back to the start
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Swipe to the next set of cards
          scrollRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
        }
      }
    }, 4000); // Swipe every 4 seconds

    return () => clearInterval(timer);
  }, [properties.length, isHovered]);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        ref={scrollRef}
        // Removed outer negative margins to ensure the flex container exactly matches the grid bounds,
        // making the 3 cards perfectly fill 100% of the width with zero bleed for a 4th card.
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-2 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {properties.map((property, index) => (
          <div 
            key={`${groupTitle}-${property.id}-${index}`} 
            // w-full on mobile (1 card), 50% minus gap on md (2 cards), 33.333% minus gaps on lg (3 cards)
            className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 snap-start"
          >
            <PropertyCard property={property} />
          </div>
        ))}
      </div>
      
      {properties.length > 3 && (
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 z-10 hidden md:flex h-12 w-12 -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_4px_14px_rgba(0,0,0,0.1)] border border-slate-100 transition hover:bg-slate-50 md:-left-5 lg:-left-6"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 z-10 hidden md:flex h-12 w-12 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_4px_14px_rgba(0,0,0,0.1)] border border-slate-100 transition hover:bg-slate-50 md:-right-5 lg:-right-6"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
}
