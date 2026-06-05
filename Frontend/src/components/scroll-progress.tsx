"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.2 });
  return <motion.div className="fixed left-0 top-0 z-[70] h-1 origin-left bg-gradient-to-r from-[#e34b32] via-[#f3b64a] to-[#111111]" style={{ scaleX, width: "100%" }} />;
}


