"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const defaultVideo = "https://videos.pexels.com/video-files/7578544/7578544-hd_1920_1080_30fps.mp4";
const defaultPoster = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80";

export function VideoModal({ open, onClose, title = "Simple Buy Steps", videoSrc = defaultVideo }: { open: boolean; onClose: () => void; title?: string; videoSrc?: string }) {
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    setPlaying(true);
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play().catch(() => setPlaying(false));
  }, [open]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="w-full max-w-5xl overflow-hidden rounded-[2rem] bg-[#111111] shadow-[0_30px_100px_rgba(0,0,0,.45)]" initial={{ opacity: 0, y: 40, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.96 }} transition={{ type: "spring", stiffness: 190, damping: 22 }}>
            <div className="relative overflow-hidden bg-[#050505]">
              <video
                ref={videoRef}
                className="aspect-video w-full bg-black object-cover"
                src={videoSrc}
                poster={defaultPoster}
                controls
                autoPlay
                muted
                playsInline
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/75 to-transparent" />
              <div className="pointer-events-none absolute left-5 top-5 rounded-2xl bg-black/40 px-4 py-3 text-white backdrop-blur">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-100">GroupBuying Video</p>
                <h3 className="mt-1 font-display text-xl font-black">{title}</h3>
              </div>
              <button onClick={onClose} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-[#e34b32]" aria-label="Close video modal"><X /></button>
              <button onClick={togglePlay} className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#e34b32] shadow-2xl transition hover:scale-105" aria-label="Toggle video play">
                {playing ? <Pause size={28} /> : <Play size={28} fill="currentColor" />}
              </button>
            </div>

            <div className="grid gap-4 bg-white p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#e34b32]">Now Playing</p>
                <h2 className="mt-1 font-display text-2xl font-black text-[#111111]">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Use the video controls for play, pause, volume, seek and fullscreen.</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {["Play Controls", "Fullscreen", "Simple Steps"].map((item) => <span key={item} className="rounded-2xl bg-[#fff3ef] px-3 py-3 text-xs font-black text-[#b43b2a]">{item}</span>)}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
