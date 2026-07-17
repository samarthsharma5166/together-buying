"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Testimonial = {
  name: string;
  text: string;
  saved: string;
  role?: string;
};

export function ReviewStrip({ testimonials }: { testimonials: Testimonial[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;

        if (scrollLeft >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 360, behavior: "smooth" });
        }
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div
      className="-mx-4 overflow-hidden md:mx-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto px-4 pb-4 pt-2 md:px-0 [&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-smooth"
      >
        {testimonials.map((item, index) => (
          <motion.article
            key={`${item.name}-${index}`}
            className={cn(
              "group relative flex-none w-[88vw] snap-center rounded-[1.75rem] border border-white/20 bg-white/10 p-6 backdrop-blur-md",
              "shadow-[0_20px_50px_rgba(0,0,0,.15)] transition hover:border-white/35 hover:bg-white/15 md:w-[380px]"
            )}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4) }}
          >
            <Quote className="mb-3 text-white/30" size={28} />

            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={14} className="fill-[#f3b64a] text-[#f3b64a]" />
                ))}
              </div>
              <span className="shrink-0 rounded-full bg-[#e34b32] px-3 py-1 text-xs font-black text-white shadow-sm">
                {item.saved}
              </span>
            </div>

            <p className="line-clamp-4 text-sm leading-7 text-white/90">&ldquo;{item.text}&rdquo;</p>

            <div className="mt-5 flex items-center gap-3 border-t border-white/15 pt-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-sm font-black text-white">
                {getInitials(item.name)}
              </span>
              <div>
                <p className="font-display text-base font-black text-white">{item.name}</p>
                {item.role && <p className="text-xs text-white/60">{item.role}</p>}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
