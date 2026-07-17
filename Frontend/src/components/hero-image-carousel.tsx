"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const DEFAULT_TAG = {
  tagLabel: "We've saved",
  tagAmount: "₹25Cr+",
  tagSubtext: "for 150+ families",
};

const AUTO_PLAY_MS = 4000;

export type HeroSlideItem = {
  id: string;
  imageUrl: string;
  caption?: string | null;
  tagLabel?: string | null;
  tagAmount?: string | null;
  tagSubtext?: string | null;
};

type Props = {
  slides: HeroSlideItem[];
};

export function HeroImageCarousel({ slides }: Props) {
  if (!slides.length) return null;

  const items = slides;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => setActiveIndex(((index % items.length) + items.length) % items.length),
    [items.length]
  );

  useEffect(() => {
    if (items.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [items.length, isPaused]);

  const activeSlide = items[activeIndex];
  const tagLabel = activeSlide?.tagLabel || DEFAULT_TAG.tagLabel;
  const tagAmount = activeSlide?.tagAmount || DEFAULT_TAG.tagAmount;
  const tagSubtext = activeSlide?.tagSubtext || DEFAULT_TAG.tagSubtext;

  return (
    <div className="relative mx-auto w-full min-w-0 max-w-2xl overflow-hidden lg:mx-0 lg:max-w-none">
      <div
        key={`${activeSlide?.id}-tag`}
        className="pointer-events-none absolute left-3 top-3 z-20 max-w-[calc(100%-1.5rem)] rounded-xl border border-slate-100/80 bg-white/95 px-3 py-2.5 shadow-[0_10px_28px_rgba(15,35,64,0.12)] backdrop-blur-sm transition-opacity duration-500 sm:left-4 sm:top-5 sm:rounded-2xl sm:px-4 sm:py-3 md:left-6 md:top-7 md:px-5 md:py-4"
      >
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 sm:text-[10px] sm:tracking-[0.22em]">
          {tagLabel}
        </p>
        <p className="font-display text-2xl font-black text-[#df432c] sm:text-3xl md:text-4xl">{tagAmount}</p>
        <p className="text-xs font-bold text-slate-500 sm:text-sm">{tagSubtext}</p>
      </div>

      <div
        className="group relative h-full overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_16px_48px_rgba(15,35,64,0.12)] sm:rounded-[1.75rem] md:rounded-[2.25rem] lg:rounded-[2.75rem] xl:rounded-[3rem] xl:shadow-[0_28px_80px_rgba(15,35,64,0.16)]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/11] lg:aspect-[6/5] xl:aspect-[5/4]">
          <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {items.map((slide, index) => (
              <div key={slide.id || `${slide.imageUrl}-${index}`} className="relative h-full min-w-full shrink-0">
                <Image
                  src={slide.imageUrl}
                  alt={`Hero slide ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 58vw"
                  className="object-cover"
                  unoptimized={slide.imageUrl.startsWith("http://localhost")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
              </div>
            ))}
          </div>
        </div>

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-lg text-slate-700 shadow-md transition hover:bg-white sm:left-3 sm:h-10 sm:w-10 md:left-4 md:opacity-0 md:group-hover:opacity-100"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-lg text-slate-700 shadow-md transition hover:bg-white sm:right-3 sm:h-10 sm:w-10 md:right-4 md:opacity-0 md:group-hover:opacity-100"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-5 sm:gap-2.5 md:bottom-6">
              {items.map((slide, index) => (
                <button
                  key={slide.id || index}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300 sm:h-2.5",
                    index === activeIndex ? "w-7 bg-[#e34b32] shadow-sm sm:w-8" : "w-2 bg-white/85 hover:bg-white sm:w-2.5"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
