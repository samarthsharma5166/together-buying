"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Building2, Crown, ExternalLink, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { Developer } from "@/lib/api";
import { getAssetUrl } from "@/lib/api";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function partnerKey(developer: Developer, index: number) {
  return developer.id || `${developer.companyName}-${index}`;
}

export function PartnerLogoGrid({ developers }: { developers: Developer[] }) {
  const partners = useMemo(() => {
    const seen = new Set<string>();
    return developers
      .filter((item) => item.companyName?.trim())
      .filter((item) => {
        const key = item.id || item.companyName.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 20);
  }, [developers]);

  const [activeId, setActiveId] = useState(partners[0]?.id || partners[0]?.companyName || "");

  const active = partners.find((item) => (item.id || item.companyName) === activeId) || partners[0];
  const activeLogo = getAssetUrl(active?.logoUrl);
  const activeBanner = getAssetUrl(active?.bannerImageUrl);
  const projectCount = active?._count?.properties || 0;

  if (!partners.length) return null;

  return (
    <div className="partner-premium-shell grid gap-5 rounded-4xl border border-white/80 p-4 shadow-[0_22px_70px_rgba(17,17,17,.1)] md:p-5 lg:grid-cols-[1fr_290px]">
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {["Verified Developers", "Live Inventory", "Direct Negotiation"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3 py-2 text-xs font-black text-[#111111] shadow-sm backdrop-blur"
              >
                <ShieldCheck size={14} className="text-[#e34b32]" /> {item}
              </span>
            ))}
          </div>
          <span className="rounded-full bg-[#111111] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
            {Math.max(partners.length, 30)}+ partners
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-4xl border border-white/70 bg-white/45 p-3 backdrop-blur-xl md:grid-cols-4 lg:grid-cols-5">
          {partners.map((developer, index) => {
            const key = partnerKey(developer, index);
            const logo = getAssetUrl(developer.logoUrl);
            const isActive = (developer.id || developer.companyName) === (active?.id || active?.companyName);

            return (
              <motion.button
                type="button"
                key={key}
                onMouseEnter={() => setActiveId(developer.id || developer.companyName)}
                onFocus={() => setActiveId(developer.id || developer.companyName)}
                className={`partner-logo-tile group relative flex h-20 items-center justify-center overflow-hidden rounded-2xl bg-white/92 p-3 text-center shadow-[0_10px_24px_rgba(17,17,17,.07)] outline-none backdrop-blur transition ${
                  isActive ? "ring-2 ring-[#e34b32]/35" : ""
                }`}
                whileHover={{ y: -5, scale: 1.025 }}
                transition={{ type: "spring", stiffness: 240, damping: 18 }}
              >
                <span className="absolute inset-px rounded-2xl bg-white transition duration-300 group-hover:bg-[#fff7f4]" />
                <span className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-[#e34b32]/10 transition group-hover:scale-150" />
                <span className="relative flex h-full w-full items-center justify-center">
                  {logo ? (
                    <Image
                      src={logo}
                      alt={developer.companyName}
                      width={120}
                      height={48}
                      unoptimized
                      className="max-h-12 w-auto max-w-[88%] object-contain"
                    />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e34b32] text-xs font-black text-white shadow-md">
                      {initials(developer.companyName)}
                    </span>
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {active && (
        <motion.div
          key={active.id || active.companyName}
          initial={{ opacity: 0, x: 24, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="sticky top-24 hidden h-fit overflow-hidden rounded-4xl bg-[#111111] p-4 text-white shadow-[0_20px_58px_rgba(17,17,17,.22)] lg:block"
        >
          <div className="brand-preview relative mb-3 flex h-40 items-center justify-center overflow-hidden rounded-3xl bg-[#fff3ef]">
            {activeBanner ? (
              <Image src={activeBanner} alt="" fill unoptimized className="object-cover opacity-35" />
            ) : null}
            <div className="relative rounded-[1.4rem] bg-white p-5 text-center text-[#111111] shadow-2xl">
              <Crown className="absolute -right-3 -top-3 rounded-full bg-[#f3b64a] p-2 text-[#111111]" size={34} />
              {activeLogo ? (
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-white p-2 shadow-[0_16px_32px_rgba(227,75,50,.18)]">
                  <Image
                    src={activeLogo}
                    alt={active.companyName}
                    width={56}
                    height={56}
                    unoptimized
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e34b32] font-display text-xl font-black text-white shadow-[0_16px_32px_rgba(227,75,50,.28)]">
                  {initials(active.companyName)}
                </div>
              )}
              <p className="font-display text-xl font-black">{active.companyName}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-[#e34b32]">Premium Developer Partner</p>
            </div>
          </div>

          <div className="mb-3 space-y-2 text-xs text-white/78">
            {active.headquartersCity ? (
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-[#f3b64a]" />
                {active.headquartersCity}
              </p>
            ) : null}
            {active.description ? (
              <p className="line-clamp-3 leading-5">{active.description}</p>
            ) : null}
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <span className="rounded-2xl bg-white/10 p-3 text-xs font-black">
              <Building2 className="mb-1 text-[#f3b64a]" size={16} />
              {projectCount} active projects
            </span>
            <span className="rounded-2xl bg-white/10 p-3 text-xs font-black">
              <Sparkles className="mb-1 text-[#f3b64a]" size={16} />
              Group offers
            </span>
          </div>

          {active.websiteUrl ? (
            <a
              href={active.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#f3b64a] hover:text-white"
            >
              Visit website <ExternalLink size={12} />
            </a>
          ) : null}

          <p className="text-xs leading-5 text-white/72">Hover any partner logo to preview developer details and active projects.</p>
        </motion.div>
      )}
    </div>
  );
}
