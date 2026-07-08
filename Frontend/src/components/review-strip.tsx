"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function ReviewStrip({ testimonials }: { testimonials: { name: string; text: string; saved: string }[] }) {
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
          scrollRef.current.scrollBy({ left: 350, behavior: "smooth" }); 
        }
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div 
      className="-mx-4 md:mx-0 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div 
        ref={scrollRef} 
        className="flex gap-4 md:gap-6 overflow-x-auto pb-4 pt-2 px-4 md:px-0 [&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-smooth"
      >
        {testimonials.map((item, index) => (
          <motion.article
            key={`${item.name}-${index}`}
            className="group relative flex-none w-[85vw] md:w-[350px] snap-center rounded-[1.35rem] border border-white/15 bg-white/12 p-5 backdrop-blur"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.5) }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex gap-1">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={15} className="fill-[#f3b64a] text-[#f3b64a]" />)}</div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#e34b32]">{item.saved}</span>
            </div>
            <p className="line-clamp-4 text-sm leading-6 text-white/90">“{item.text}”</p>
            <p className="mt-4 font-display text-base font-black text-white">{item.name}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
