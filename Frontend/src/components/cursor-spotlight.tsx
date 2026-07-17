"use client";

import { useEffect, useState } from "react";

export function CursorSpotlight() {
  const [point, setPoint] = useState({ x: -400, y: -400 });

  useEffect(() => {
    const move = (event: PointerEvent) => setPoint({ x: event.clientX, y: event.clientY });
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[1] hidden h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e34b32]/10 blur-3xl transition-transform duration-75 lg:block"
      style={{ left: point.x, top: point.y }}
    />
  );
}
