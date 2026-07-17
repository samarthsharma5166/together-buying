"use client";

import { useEffect, useRef, useState } from "react";
import { PropertyCard } from "./property-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Property } from "@/lib/api";
import { cn } from "@/lib/utils";

type Props = {
  properties: Property[];
  groupTitle: string;
};

export function PropertyCarousel({ properties, groupTitle }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Drag-to-scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragMoved, setDragMoved] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const scrollAmount = container.clientWidth;
      const targetLeft = direction === "left" 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({ left: targetLeft, behavior: "smooth" });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDragMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeaveDrag = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    if (Math.abs(x - startX) > 5) {
      setDragMoved(true);
    }
    const walk = (x - startX) * 2; // scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Infinite auto-swipe animation
  useEffect(() => {
    // Disable auto-play while dragging or hovering
    if (properties.length <= 3 || isHovered || isDragging) return;

    const timer = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
        }
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [properties.length, isHovered, isDragging]);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveDrag}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClickCapture={(e) => {
          if (dragMoved) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className={cn(
          "flex gap-6 overflow-x-auto pb-4 pt-2 [&::-webkit-scrollbar]:hidden",
          isDragging ? "cursor-grabbing snap-none select-none" : "cursor-grab snap-x snap-mandatory"
        )}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {properties.map((property, index) => (
          <div 
            key={`${groupTitle}-${property.id}-${index}`} 
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
