"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { VideoModal } from "@/components/video-modal";

import type { ShowcaseVideo } from "@/lib/api";

type VideoItem = {
  title: string;
  subtitle: string;
  src: string;
  poster: string;
};

const defaultVideos: VideoItem[] = [
  {
    title: "Luxury project walkthrough",
    subtitle: "Premium inventory tour",
    src: "https://videos.pexels.com/video-files/7578544/7578544-hd_1920_1080_30fps.mp4",
    poster: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Live virtual site visit",
    subtitle: "Real-time project walkthrough",
    src: "https://videos.pexels.com/video-files/5364034/5364034-hd_1920_1080_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Buyer savings story",
    subtitle: "Group buying success",
    src: "https://videos.pexels.com/video-files/7578553/7578553-hd_1920_1080_30fps.mp4",
    poster: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Inventory comparison",
    subtitle: "Side-by-side project review",
    src: "https://videos.pexels.com/video-files/3254066/3254066-hd_1920_1080_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Premium amenity tour",
    subtitle: "Clubhouse & lifestyle",
    src: "https://videos.pexels.com/video-files/7578560/7578560-hd_1920_1080_30fps.mp4",
    poster: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Group buying success",
    subtitle: "Buyer testimonial",
    src: "https://videos.pexels.com/video-files/7579576/7579576-hd_1920_1080_30fps.mp4",
    poster: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80",
  },
];

function getCardPosition(index: number, currentIndex: number, total: number) {
  const offset = (index - currentIndex + total) % total;

  if (offset === 0) return "center";
  if (offset === 1) return "right-1";
  if (offset === 2) return "right-2";
  if (offset === total - 1) return "left-1";
  if (offset === total - 2) return "left-2";
  return "hidden";
}

function VideoCarouselCard({
  item,
  position,
  onSelect,
  onPlay,
}: {
  item: VideoItem;
  position: string;
  onSelect: () => void;
  onPlay: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isCenter = position === "center";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isCenter) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [isCenter]);

  return (
    <article
      className={`video-carousel-card ${position}`}
      onClick={() => (isCenter ? onPlay() : onSelect())}
    >
      <video
        ref={videoRef}
        className="video-carousel-media"
        src={item.src}
        poster={item.poster}
        muted
        loop
        playsInline
        preload="metadata"
      />
    </article>
  );
}

export function VideoShowcase({ videos }: { videos: ShowcaseVideo[] }) {
  const items: VideoItem[] = videos.length
    ? videos.map((video) => ({
        title: video.title,
        subtitle: video.subtitle,
        src: video.videoUrl,
        poster: video.posterUrl,
      }))
    : defaultVideos;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [infoVisible, setInfoVisible] = useState(true);
  const [openVideo, setOpenVideo] = useState<VideoItem | null>(null);
  const touchStartX = useRef(0);

  const activeItem = items[currentIndex];

  const updateCarousel = useCallback(
    (newIndex: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setInfoVisible(false);
      setCurrentIndex((newIndex + items.length) % items.length);
      window.setTimeout(() => {
        setInfoVisible(true);
        setIsAnimating(false);
      }, 800);
    },
    [isAnimating, items.length],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") updateCarousel(currentIndex - 1);
      if (e.key === "ArrowRight") updateCarousel(currentIndex + 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentIndex, updateCarousel]);

  function handleSwipe(endX: number) {
    const diff = touchStartX.current - endX;
    if (Math.abs(diff) < 50) return;
    updateCarousel(diff > 0 ? currentIndex + 1 : currentIndex - 1);
  }

  return (
    <>
      <div className="video-carousel-shell">
        <h3 className="video-carousel-bg-title" aria-hidden="true">
          VIDEO TOURS
        </h3>

        <div
          className="video-carousel-container"
          onTouchStart={(e) => {
            touchStartX.current = e.changedTouches[0].screenX;
          }}
          onTouchEnd={(e) => handleSwipe(e.changedTouches[0].screenX)}
        >
          <button
            type="button"
            className="video-carousel-arrow left"
            aria-label="Previous video"
            onClick={() => updateCarousel(currentIndex - 1)}
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          <div className="video-carousel-track">
            {items.map((item, index) => (
              <VideoCarouselCard
                key={`${item.title}-${index}`}
                item={item}
                position={getCardPosition(index, currentIndex, items.length)}
                onSelect={() => updateCarousel(index)}
                onPlay={() => setOpenVideo(item)}
              />
            ))}
          </div>

          <button
            type="button"
            className="video-carousel-arrow right"
            aria-label="Next video"
            onClick={() => updateCarousel(currentIndex + 1)}
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className={`video-carousel-info${infoVisible ? "" : " is-fading"}`}>
          <h2 className="video-carousel-info-title">{activeItem.title}</h2>
          <p className="video-carousel-info-sub">{activeItem.subtitle}</p>
        </div>

        <div className="video-carousel-dots">
          {items.map((item, index) => (
            <button
              key={`dot-${item.title}-${index}`}
              type="button"
              className={`video-carousel-dot${index === currentIndex ? " active" : ""}`}
              aria-label={`Go to ${item.title}`}
              onClick={() => updateCarousel(index)}
            />
          ))}
        </div>
      </div>

      <VideoModal
        open={Boolean(openVideo)}
        onClose={() => setOpenVideo(null)}
        title={openVideo?.title || "Project Video"}
        videoSrc={openVideo?.src}
      />
    </>
  );
}
