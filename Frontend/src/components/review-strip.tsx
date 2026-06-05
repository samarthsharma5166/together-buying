"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

export function ReviewStrip({ testimonials }: { testimonials: { name: string; text: string; saved: string }[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {testimonials.map((item, index) => (
        <motion.article
          key={item.name}
          className="group rounded-[1.35rem] border border-white/15 bg-white/12 p-5 backdrop-blur"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, delay: index * 0.08 }}
          whileHover={{ y: -7, scale: 1.02 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex gap-1">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={15} className="fill-[#f3b64a] text-[#f3b64a]" />)}</div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#e34b32]">{item.saved}</span>
          </div>
          <p className="line-clamp-3 text-sm leading-6 text-white/90">“{item.text}”</p>
          <p className="mt-4 font-display text-base font-black text-white">{item.name}</p>
        </motion.article>
      ))}
    </div>
  );
}
