"use client";

import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { VideoModal } from "@/components/video-modal";

const videoSources = [
  "https://videos.pexels.com/video-files/7578544/7578544-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/7578544/7578544-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/7578544/7578544-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/7578544/7578544-hd_1920_1080_30fps.mp4",
];

export function VideoShowcase({ videos }: { videos: string[] }) {
  const [active, setActive] = useState(0);
  const [openVideo, setOpenVideo] = useState<{ title: string; src: string } | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setActive((value) => (value + 1) % videos.length), 2200);
    return () => window.clearInterval(id);
  }, [videos.length]);

  return (
    <>
      <div className="grid gap-5 md:grid-cols-4">
        {videos.map((item, index) => {
        const isActive = active === index;
        return (
          <motion.article
            key={item}
            onMouseEnter={() => setActive(index)}
            onClick={() => setOpenVideo({ title: item, src: videoSources[index % videoSources.length] })}
            className="video-card group relative overflow-hidden rounded-[1.2rem] bg-[#111111] premium-border"
            animate={{ y: isActive ? -12 : 0, scale: isActive ? 1.035 : 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
          >
            <div className="relative h-[350px] overflow-hidden">
              <video
                className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
                src={videoSources[index % videoSources.length]}
                autoPlay
                muted
                loop
                playsInline
              />
              <motion.div
                className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(227,75,50,.48),transparent_28%),linear-gradient(135deg,rgba(227,75,50,.42),rgba(17,17,17,.52)_52%,rgba(5,5,5,.78))]"
                animate={{ scale: isActive ? 1.12 : 1, rotate: isActive ? 1 : 0 }}
                transition={{ duration: 1.2 }}
              />
              <div className="video-scan absolute inset-0 opacity-60" />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/18 px-3 py-1 text-xs font-black text-white backdrop-blur"><Sparkles size={13} /> saved {index % 2 ? "50" : "40"} lakhs</div>
              <motion.div className="absolute inset-0 flex items-center justify-center" animate={{ scale: isActive ? 1.08 : 1 }}>
                <span className="pulse-ring flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#e34b32] shadow-2xl"><Play size={26} fill="currentColor" /></span>
              </motion.div>
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/70 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="font-display text-xl font-black text-white">{item}</p>
                <motion.div className="mt-3 h-1 overflow-hidden rounded-full bg-white/20" initial={false}>
                  <motion.div className="h-full rounded-full bg-[#e34b32]" animate={{ width: isActive ? "100%" : "28%" }} transition={{ duration: isActive ? 2.1 : 0.35 }} />
                </motion.div>
              </div>
            </div>
          </motion.article>
        );
        })}
      </div>
      <VideoModal open={Boolean(openVideo)} onClose={() => setOpenVideo(null)} title={openVideo?.title || "Project Video"} videoSrc={openVideo?.src} />
    </>
  );
}
