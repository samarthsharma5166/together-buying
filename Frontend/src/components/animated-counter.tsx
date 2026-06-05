"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export function AnimatedCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const parts = useMemo(() => value.split(/(\d+(?:\.\d+)?)/g), [value]);
  const targets = useMemo(() => parts.map((part) => Number(part)).filter(Number.isFinite), [parts]);
  const maxTarget = Math.max(...targets, 0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !maxTarget) return;
    let frame = 0;
    const totalFrames = 48;
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = 1 - Math.pow(1 - Math.min(frame / totalFrames, 1), 3);
      setCurrent(maxTarget * progress);
      if (frame >= totalFrames) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [maxTarget, visible]);

  if (!targets.length) return <>{value}</>;

  let numberIndex = 0;
  return (
    <span ref={ref}>
      {parts.map((part, index) => {
        const target = Number(part);
        if (!Number.isFinite(target)) return <span key={`${part}-${index}`}>{part}</span>;
        numberIndex += 1;
        const ratio = maxTarget ? target / maxTarget : 1;
        const shown = visible ? Math.round(current * ratio) : 0;
        return <span key={`${part}-${index}-${numberIndex}`}>{shown}</span>;
      })}
    </span>
  );
}


