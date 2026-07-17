"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown, ChevronRight, MapPin, Mic, Search } from "lucide-react";
import {
  ALL_CITIES,
  DEFAULT_CITY,
  getCityConfig,
  LOCATION_GROUPS,
} from "@/lib/locations";
import { cn } from "@/lib/utils";

type FilterValues = {
  city?: string;
  locality?: string;
  search?: string;
  propertyType?: string;
  maxPrice?: string;
};

type PropertySearchFilterProps = {
  defaults?: FilterValues;
  compact?: boolean;
  className?: string;
};

const configurations = ["1 BHK", "2 BHK", "2.5 BHK", "3 BHK", "3 BHK + S", "3 BHK + U", "4 BHK", "4 BHK + U", "4 BHK + S", "Penthouse", "Studio"];
const budgets = [
  { label: "Under ₹3Cr", value: "30000000" },
  { label: "Under ₹6Cr", value: "60000000" },
  { label: "Under ₹10Cr", value: "100000000" },
  { label: "₹15Cr+", value: "150000000" },
];

type SpeechRecognitionConstructor = new () => {
  lang: string;
  interimResults: boolean;
  start: () => void;
  onresult: ((event: { results: { 0: { transcript: string } }[] }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function resolveCity(city?: string) {
  if (!city) return DEFAULT_CITY;
  return ALL_CITIES.includes(city) ? city : DEFAULT_CITY;
}

function resolvePropertyType(value?: string) {
  if (!value) return "";
  const upper = value.toUpperCase();
  if (upper === "COMMERCIAL") return "COMMERCIAL";
  if (upper === "RESIDENTIAL") return "RESIDENTIAL";
  return value.toLowerCase() === "commercial" ? "COMMERCIAL" : "RESIDENTIAL";
}

export function PropertySearchFilter({ defaults, compact = false, className = "" }: PropertySearchFilterProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [city, setCity] = useState(resolveCity(defaults?.city));
  const [locality, setLocality] = useState(defaults?.locality || "");
  const [search, setSearch] = useState(defaults?.search || "");
  const [propertyType, setPropertyType] = useState(resolvePropertyType(defaults?.propertyType));
  const [maxPrice, setMaxPrice] = useState(defaults?.maxPrice || "");
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);

  const cityConfig = useMemo(() => getCityConfig(city), [city]);
  const locations = cityConfig?.localities || [];
  const developers = cityConfig?.developers || [];

  const filterLabel = useMemo(() => {
    const parts: string[] = [];
    if (propertyType === "RESIDENTIAL") parts.push("Residential");
    if (propertyType === "COMMERCIAL") parts.push("Commercial");
    if (locality) parts.push(locality);
    const budget = budgets.find((item) => item.value === maxPrice)?.label;
    if (budget) parts.push(budget);
    return parts.length ? parts.join(" · ") : "Select Filter";
  }, [propertyType, locality, maxPrice]);

  function handleCityChange(nextCity: string) {
    setCity(nextCity);
    setLocality("");
  }

  function buildQuery() {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (locality) params.set("locality", locality);
    if (search.trim()) params.set("search", search.trim());
    if (propertyType) params.set("propertyType", propertyType);
    if (maxPrice) params.set("maxPrice", maxPrice);
    return params;
  }

  function submitFilters() {
    const params = buildQuery();
    setOpen(false);
    router.push(`/properties${params.size ? `?${params.toString()}` : ""}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitFilters();
  }

  function startVoiceSearch() {
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSearch("Voice search is not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    setListening(true);
    recognition.onresult = (event) => setSearch(event.results[0][0].transcript);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
  }

  function applyChip(value: string, type: "location" | "developer" | "configuration") {
    if (type === "location") {
      setLocality(value);
      return;
    }
    if (type === "developer") {
      setSearch(value);
      return;
    }
    setSearch(value);
    if (!propertyType) setPropertyType("RESIDENTIAL");
  }

  function clearAll() {
    setSearch("");
    setLocality("");
    setPropertyType("");
    setMaxPrice("");
  }

  return (
    <div className={`relative ${className}`}>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={`relative z-20 grid overflow-visible rounded-2xl border border-slate-200 bg-white text-[#111111] shadow-[0_14px_45px_rgba(17,17,17,.10)] sm:rounded-3xl md:rounded-full ${compact ? "h-14 grid-cols-[150px_1fr_170px_132px]" : "grid-cols-1 md:h-16 md:grid-cols-[180px_1fr_210px_170px]"}`}
      >
        <div className="relative z-30 flex min-w-0 items-center gap-3 overflow-visible border-b border-slate-100 px-5 py-3 md:border-b-0 md:border-r">
          <MapPin size={18} className="shrink-0 text-[#e34b32]" />
          <CityNestedDropdown city={city} onChange={handleCityChange} />
          <input type="hidden" name="city" value={city} />
        </div>

        <label className="flex min-w-0 flex-col justify-center border-b border-slate-100 px-5 py-3 md:border-b-0 md:border-r">
          <span className="text-[10px] font-bold text-slate-500">Find Your Dream Home</span>
          <input
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search for developers, location, projects"
            className="w-full bg-transparent text-sm font-semibold placeholder:text-slate-400 outline-none"
          />
        </label>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 items-center justify-between border-b border-slate-100 px-5 py-3 text-left md:border-b-0 md:border-r"
        >
          <span className="min-w-0">
            <span className="block text-[10px] font-bold text-slate-500">Inventory | Budget</span>
            <span className="block truncate text-sm font-semibold text-slate-500">{filterLabel}</span>
          </span>
          <ChevronDown size={17} className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
        </button>

        <div className="grid grid-cols-[1fr_48px] bg-linear-to-r from-[#df432c] to-[#ff704f] text-white sm:grid-cols-[1fr_54px]">
          <button type="submit" className="shine flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-black sm:px-5 md:py-0">
            Search <Search size={18} />
          </button>
          <button
            type="button"
            aria-label="Voice search"
            onClick={startVoiceSearch}
            className={`flex items-center justify-center border-l border-white/35 transition ${listening ? "bg-white/25" : ""}`}
          >
            <Mic size={18} />
          </button>
        </div>
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 max-h-[min(70vh,560px)] overflow-y-auto rounded-4xl border border-slate-100 bg-white p-6 text-[#111111] shadow-[0_24px_80px_rgba(17,17,17,.16)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#fff6f2] px-4 py-3">
            <p className="text-sm font-bold text-slate-700">
              Filtering in <span className="font-black text-[#e34b32]">{city}</span>
              {locality ? <> · <span className="text-slate-600">{locality}</span></> : null}
            </p>
            <p className="text-xs font-semibold text-slate-500">
              {getCityConfig(city) ? `${locations.length} localities · ${developers.length} developers` : "Select a city"}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-[.8fr_1.25fr]">
            <div className="space-y-5">
              <ChipGroup
                icon={<MapPin size={19} />}
                title={`Locations in ${city}`}
                items={locations}
                active={locality}
                onPick={(item) => applyChip(item, "location")}
              />
              <ChipGroup
                icon={<Building2 size={19} />}
                title={`Developers in ${city}`}
                items={developers}
                active={search}
                onPick={(item) => applyChip(item, "developer")}
              />
            </div>
            <div className="space-y-6 md:border-l md:border-slate-100 md:pl-7">
              <div>
                <h3 className="mb-3 font-display text-xl font-black">Property Types</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Residential", value: "RESIDENTIAL" },
                    { label: "Commercial", value: "COMMERCIAL" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setPropertyType(propertyType === item.value ? "" : item.value)}
                      className={`rounded-full px-5 py-2 text-sm font-bold transition ${propertyType === item.value ? "bg-[#e34b32] text-white" : "bg-slate-100 hover:bg-[#fff3ef]"}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <ChipGroup
                title="Configuration"
                items={configurations}
                active={search}
                onPick={(item) => applyChip(item, "configuration")}
              />

              <div className="border-t border-slate-100 pt-5">
                <h3 className="mb-3 font-display text-xl font-black">Budget</h3>
                <div className="flex flex-wrap gap-2">
                  {budgets.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setMaxPrice(maxPrice === item.value ? "" : item.value)}
                      className={`rounded-full px-5 py-2 text-sm font-bold transition ${maxPrice === item.value ? "bg-[#e34b32] text-white" : "bg-[#fff3ef] text-[#d9462e]"}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={clearAll} className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black">
              clear all
            </button>
            <button type="button" onClick={submitFilters} className="rounded-2xl bg-[#e34b32] px-6 py-3 text-sm font-black text-white">
              Apply Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type RegionKey = keyof typeof LOCATION_GROUPS;

function CityNestedDropdown({
  city,
  onChange,
}: {
  city: string;
  onChange: (city: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeRegion, setActiveRegion] = useState<RegionKey | null>(null);
  const [expandedRegion, setExpandedRegion] = useState<RegionKey | null>(null);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, minWidth: 210 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    function updatePosition() {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuStyle({
        top: rect.bottom + 8,
        left: rect.left,
        minWidth: Math.max(rect.width, 210),
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      setActiveRegion(null);
      setExpandedRegion(null);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function selectCity(nextCity: string) {
    onChange(nextCity);
    setOpen(false);
    setActiveRegion(null);
    setExpandedRegion(null);
  }

  function toggleRegion(region: RegionKey) {
    setExpandedRegion((prev) => (prev === region ? null : region));
    setActiveRegion(region);
  }

  const regions = Object.entries(LOCATION_GROUPS) as [RegionKey, (typeof LOCATION_GROUPS)[RegionKey]][];

  const menu = open && mounted ? (
    <div
      ref={menuRef}
      className="fixed z-[9999] rounded-2xl border border-slate-100 bg-white p-1.5 shadow-[0_18px_50px_rgba(17,17,17,.14)]"
      style={{ top: menuStyle.top, left: menuStyle.left, minWidth: menuStyle.minWidth }}
    >
      {regions.map(([regionKey, group]) => {
        const cities = Object.keys(group.cities);
        const isExpanded = expandedRegion === regionKey;
        const isHovered = activeRegion === regionKey;
        const showCities = isExpanded || isHovered;

        return (
          <div
            key={regionKey}
            className="relative"
            onMouseEnter={() => setActiveRegion(regionKey)}
            onMouseLeave={() => setActiveRegion(null)}
          >
            <button
              type="button"
              onClick={() => toggleRegion(regionKey)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold transition",
                showCities ? "bg-[#fff3ef] text-[#e34b32]" : "text-slate-800 hover:bg-slate-50"
              )}
            >
              {group.label}
              <ChevronRight size={16} className="shrink-0 text-slate-400" />
            </button>

            {showCities && (
              <div className="py-1 md:absolute md:left-full md:top-0 md:pl-1">
                <div className="max-h-52 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-1.5 shadow-[0_16px_44px_rgba(17,17,17,.12)] md:min-w-[190px] md:max-h-60">
                  {cities.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => selectCity(item)}
                      className={cn(
                        "flex w-full rounded-lg px-3.5 py-2 text-left text-sm font-semibold transition",
                        city === item
                          ? "bg-[#e34b32] text-white"
                          : "text-slate-700 hover:bg-[#fff3ef] hover:text-[#e34b32]"
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  ) : null;

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <button
        ref={triggerRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="flex w-full min-w-0 items-center justify-between gap-2 text-left"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-bold text-slate-500">City</span>
          <span className="block truncate text-sm font-black text-[#111111]">{city}</span>
        </span>
        <ChevronDown size={16} className={cn("shrink-0 text-slate-400 transition", open && "rotate-180")} />
      </button>

      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}

function ChipGroup({
  icon,
  title,
  items,
  active,
  onPick,
}: {
  icon?: ReactNode;
  title: string;
  items: string[];
  active?: string;
  onPick: (item: string) => void;
}) {
  if (!items.length) {
    return (
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-display text-xl font-black">{icon}{title}</h3>
        <p className="text-sm text-slate-500">No options available for this city.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 font-display text-xl font-black">{icon}{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPick(item)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${active === item ? "bg-[#e34b32] text-white" : "bg-slate-100 hover:bg-[#fff3ef] hover:text-[#d9462e]"}`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
