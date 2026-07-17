import React from "react";
import { cn } from "@/lib/utils";

export function HighlightedHeading({
  before,
  highlight,
  after,
  className,
}: {
  before?: string;
  highlight: string;
  after?: string;
  className?: string;
}) {
  return (
    <span className={cn("font-display font-extrabold tracking-tight", className)}>
      {before && `${before} `}
      <span className="text-[#e34b32]">{highlight}</span>
      {after && ` ${after}`}
    </span>
  );
}
