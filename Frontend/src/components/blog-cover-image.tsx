"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  overlayClassName?: string;
};

export function BlogCoverImage({ src, alt, className, overlayClassName }: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className={cn("relative overflow-hidden bg-[#1a1a1a]", className)}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={() => setFailed(true)}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a211c] via-[#3d2a24] to-[#e34b32]/70">
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <BookOpen className="text-white" size={40} />
          </div>
        </div>
      )}
      {overlayClassName && <div className={cn("absolute inset-0", overlayClassName)} />}
    </div>
  );
}
