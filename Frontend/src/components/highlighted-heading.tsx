import React from "react";

export function HighlightedHeading({
  before,
  highlight,
  after,
}: {
  before?: string;
  highlight: string;
  after?: string;
}) {
  return (
    <>
      {before && `${before} `}
      <span className="text-[#e34b32]">{highlight}</span>
      {after && ` ${after}`}
    </>
  );
}
