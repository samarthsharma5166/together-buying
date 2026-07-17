"use client";

import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { VideoModal } from "@/components/video-modal";

import { usePathname } from "next/navigation";

export function SimpleBuyWidget() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), 10000);
    return () => window.clearTimeout(id);
  }, []);

  if (pathname.startsWith("/admin") || pathname.startsWith("/rm") || pathname.startsWith("/user")) {
    return null;
  }

  if (!visible) return null;

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="simple-buy-tab fixed left-0 top-1/2 z-[65] flex -translate-y-1/2 flex-col items-center gap-3 rounded-r-2xl bg-[#e34b32] px-2 py-4 text-white shadow-[0_18px_55px_rgba(227,75,50,.35)]"
        initial={{ x: -54, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        whileHover={{ x: 6, scale: 1.03 }}
      >
        <span className="simple-buy-icon pulse-ring flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#e34b32]"><Play size={18} fill="currentColor" /></span>
        <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-xs font-black uppercase tracking-[0.18em]">Simple Buy Steps</span>
        <Sparkles className="simple-buy-spark absolute -right-2 -top-2 rounded-full bg-white p-1 text-[#e34b32]" size={24} />
      </motion.button>
      <VideoModal open={open} onClose={() => setOpen(false)} title="Simple Buy Steps" />
    </>
  );
}
