"use client";

import { useMemo } from "react";
import type { Developer } from "@/lib/api";
import { getAssetUrl } from "@/lib/api";
import { DeveloperLogo } from "@/components/developer-logo";

const ROW_COUNT = 4;
const MIN_LOGOS_PER_ROW = 8;

function partnerKey(developer: Developer, index: number, suffix = "") {
  return `${developer.id || developer.companyName}-${index}${suffix}`;
}

function fillRow(source: Developer[], minCount: number): Developer[] {
  if (!source.length) return [];
  const filled = [...source];
  while (filled.length < minCount) {
    filled.push(...source);
  }
  return filled;
}

function LogoCard({ developer }: { developer: Developer }) {
  const logo = getAssetUrl(developer.logoUrl);

  return (
    <div
      className="flex h-[72px] w-[140px] shrink-0 items-center justify-center rounded-2xl bg-white p-3 shadow-[0_4px_20px_rgba(17,17,17,0.08)] sm:h-20 sm:w-[160px] sm:p-4"
      title={developer.companyName}
    >
      <DeveloperLogo
        src={logo}
        alt={developer.companyName}
        className="max-h-12 w-auto max-w-[85%] object-contain sm:max-h-14"
        boxClassName="h-12 w-12 text-xs sm:h-14 sm:w-14 sm:text-sm"
        width={56}
        height={56}
      />
    </div>
  );
}

function MarqueeRow({
  partners,
  direction,
  rowIndex,
}: {
  partners: Developer[];
  direction: "left" | "right";
  rowIndex: number;
}) {
  const items = fillRow(partners, MIN_LOGOS_PER_ROW);
  if (!items.length) return null;

  return (
    <div className="partner-marquee-mask overflow-hidden">
      <div className={`partner-marquee-track partner-marquee-${direction}`}>
        {[0, 1].map((copy) => (
          <div key={`row-${rowIndex}-copy-${copy}`} className="partner-marquee-group" aria-hidden={copy === 1}>
            {items.map((developer, index) => (
              <LogoCard key={partnerKey(developer, index, `-r${rowIndex}-c${copy}`)} developer={developer} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PartnerLogoGrid({ developers }: { developers: Developer[] }) {
  const partners = useMemo(() => {
    const seen = new Set<string>();
    return developers
      .filter((item) => item.companyName?.trim() && item.logoUrl)
      .filter((item) => {
        const key = item.id || item.companyName.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [developers]);

  const rows = useMemo(() => {
    const buckets: Developer[][] = Array.from({ length: ROW_COUNT }, () => []);
    if (!partners.length) return buckets;

    partners.forEach((partner, index) => {
      buckets[index % ROW_COUNT].push(partner);
    });

    // Keep all 4 rows filled even when partner count is small
    return buckets.map((row) => (row.length > 0 ? row : partners));
  }, [partners]);

  if (!partners.length) return null;

  return (
    <div className="rounded-3xl bg-[#f5f5f5] p-4 sm:p-6 md:p-8">
      <div className="flex flex-col gap-3 sm:gap-4">
        {rows.map((rowPartners, rowIndex) => (
          <MarqueeRow
            key={`partner-row-${rowIndex}`}
            partners={rowPartners}
            direction={rowIndex % 2 === 0 ? "right" : "left"}
            rowIndex={rowIndex}
          />
        ))}
      </div>
    </div>
  );
}
