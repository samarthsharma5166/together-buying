"use client";

import Image from "next/image";
import { useState } from "react";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export function DeveloperLogo({
  src,
  alt,
  className,
  boxClassName,
  width = 120,
  height = 48,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  boxClassName?: string;
  width?: number;
  height?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        className={`flex items-center justify-center rounded-xl bg-[#e34b32] font-black text-white shadow-md ${boxClassName || "h-11 w-11 text-xs"}`}
      >
        {initials(alt)}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      onError={() => setFailed(true)}
      className={className || "max-h-12 w-auto max-w-[88%] object-contain"}
    />
  );
}
