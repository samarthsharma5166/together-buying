"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Segment =
  | { type: "text"; value: string }
  | { type: "num"; value: string; target: number };

function parseValue(value: string): Segment[] {
  const segments: Segment[] = [];
  const regex = /(\d+(?:\.\d+)?)|([^\d]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(value)) !== null) {
    if (match[1]) segments.push({ type: "num", value: match[1], target: Number(match[1]) });
    else if (match[2]) segments.push({ type: "text", value: match[2] });
  }
  return segments;
}

export function AnimatedCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const segments = useMemo(() => parseValue(value), [value]);
  const numericTargets = useMemo(
    () => segments.filter((s): s is Extract<Segment, { type: "num" }> => s.type === "num").map((s) => s.target),
    [segments]
  );
  const [animated, setAnimated] = useState<number[]>(() => numericTargets);

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
      { threshold: 0.45 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setAnimated(numericTargets);
  }, [numericTargets]);

  useEffect(() => {
    if (!visible || !numericTargets.length) return;

    let frame = 0;
    const totalFrames = 48;
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = 1 - Math.pow(1 - Math.min(frame / totalFrames, 1), 3);
      setAnimated(numericTargets.map((target) => Math.round(target * progress)));
      if (frame >= totalFrames) window.clearInterval(timer);
    }, 24);

    return () => window.clearInterval(timer);
  }, [visible, numericTargets]);

  if (!numericTargets.length) return <>{value}</>;

  let numIndex = 0;
  return (
    <span ref={ref}>
      {segments.map((segment, index) => {
        if (segment.type === "text") return <span key={`text-${index}`}>{segment.value}</span>;
        const shown = animated[numIndex] ?? segment.target;
        numIndex += 1;
        return <span key={`num-${index}`}>{shown}</span>;
      })}
    </span>
  );
}
