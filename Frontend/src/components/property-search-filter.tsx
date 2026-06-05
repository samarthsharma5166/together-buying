"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Building2, ChevronDown, MapPin, Mic, Search } from "lucide-react";

type FilterValues = {
  city?: string;
  search?: string;
  propertyType?: string;
  maxPrice?: string;
};

type PropertySearchFilterProps = {
  defaults?: FilterValues;
  compact?: boolean;
  className?: string;
};

const locations = ["Dwarka Expressway", "Golf Course Road", "Central Gurgaon", "Golf Course Extension", "SPR", "Sohna", "Gwal Pahari", "New Gurgaon", "Manesar"];
const developers = ["M3M", "MRG Group India", "Vatika Group", "ATS HomeKraft", "Krisumi Corporation", "SS Group", "Pyramid Infratech", "Max Estates", "Experion"];
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

export function PropertySearchFilter({ defaults, compact = false, className = "" }: PropertySearchFilterProps) {
  const [city, setCity] = useState(defaults?.city || "Gurugram");
  const [search, setSearch] = useState(defaults?.search || "");
  const [propertyType, setPropertyType] = useState(defaults?.propertyType || "");
  const [maxPrice, setMaxPrice] = useState(defaults?.maxPrice || "");
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);

  const selectedBudget = useMemo(() => budgets.find((item) => item.value === maxPrice)?.label || "Select Filter", [maxPrice]);

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
    setSearch(value);
    if (type === "location") setCity("Gurugram");
    if (type === "configuration") setPropertyType("Apartment");
  }

  return (
    <div className={`relative ${className}`}>
      <form action="/properties" className={`relative z-20 grid overflow-hidden rounded-full border border-slate-200 bg-white text-[#111111] shadow-[0_14px_45px_rgba(17,17,17,.10)] ${compact ? "h-14 grid-cols-[150px_1fr_170px_132px]" : "grid-cols-1 md:h-16 md:grid-cols-[180px_1fr_210px_170px]"}`}>
        <label className="flex min-w-0 items-center gap-3 border-b border-slate-100 px-5 py-3 md:border-b-0 md:border-r">
          <MapPin size={18} className="shrink-0 text-[#e34b32]" />
          <span className="min-w-0">
            <span className="block text-[10px] font-bold text-slate-500">City</span>
            <select name="city" value={city} onChange={(event) => setCity(event.target.value)} className="w-full bg-transparent text-sm font-black outline-none">
              <option>Gurugram</option>
              <option>Noida</option>
              <option>Delhi</option>
            </select>
          </span>
        </label>

        <label className="flex min-w-0 flex-col justify-center border-b border-slate-100 px-5 py-3 md:border-b-0 md:border-r">
          <span className="text-[10px] font-bold text-slate-500">Find Your Dream Home</span>
          <input name="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for developers, location, projects" className="w-full bg-transparent text-sm font-semibold placeholder:text-slate-400 outline-none" />
        </label>

        <button type="button" onClick={() => setOpen((value) => !value)} className="flex min-w-0 items-center justify-between border-b border-slate-100 px-5 py-3 text-left md:border-b-0 md:border-r">
          <span className="min-w-0">
            <span className="block text-[10px] font-bold text-slate-500">Inventory | Budget</span>
            <span className="block truncate text-sm font-semibold text-slate-500">{propertyType || selectedBudget}</span>
          </span>
          <ChevronDown size={17} className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
        </button>

        <div className="grid grid-cols-[1fr_54px] bg-linear-to-r from-[#df432c] to-[#ff704f] text-white">
          <button className="shine flex items-center justify-center gap-2 px-5 text-sm font-black">
            Search <Search size={18} />
          </button>
          <button type="button" aria-label="Voice search" onClick={startVoiceSearch} className={`flex items-center justify-center border-l border-white/35 transition ${listening ? "bg-white/25" : ""}`}>
            <Mic size={18} />
          </button>
        </div>

        <input type="hidden" name="propertyType" value={propertyType} />
        <input type="hidden" name="maxPrice" value={maxPrice} />
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 rounded-4xl border border-slate-100 bg-white p-6 text-[#111111] shadow-[0_24px_80px_rgba(17,17,17,.16)]">
          <div className="grid gap-6 md:grid-cols-[.8fr_1.25fr]">
            <div className="space-y-5">
              <ChipGroup icon={<MapPin size={19} />} title="Locations In Gurugram" items={locations} onPick={(item) => applyChip(item, "location")} />
              <ChipGroup icon={<Building2 size={19} />} title="Developer In Gurugram" items={developers} onPick={(item) => applyChip(item, "developer")} />
            </div>
            <div className="space-y-6 md:border-l md:border-slate-100 md:pl-7">
              <div>
                <h3 className="mb-3 font-display text-xl font-black">Property Types</h3>
                <div className="flex flex-wrap gap-2">
                  {["Residential", "Commercial"].map((item) => (
                    <button key={item} type="button" onClick={() => setPropertyType(item === "Commercial" ? "Commercial" : "Apartment")} className={`rounded-full px-5 py-2 text-sm font-bold transition ${propertyType === (item === "Commercial" ? "Commercial" : "Apartment") ? "bg-[#e34b32] text-white" : "bg-slate-100 hover:bg-[#fff3ef]"}`}>{item}</button>
                  ))}
                </div>
              </div>

              <ChipGroup title="Configuration" items={configurations} onPick={(item) => applyChip(item, "configuration")} />

              <div className="border-t border-slate-100 pt-5">
                <h3 className="mb-3 font-display text-xl font-black">Budget</h3>
                <div className="flex flex-wrap gap-2">
                  {budgets.map((item) => (
                    <button key={item.value} type="button" onClick={() => setMaxPrice(item.value)} className={`rounded-full px-5 py-2 text-sm font-bold transition ${maxPrice === item.value ? "bg-[#e34b32] text-white" : "bg-[#fff3ef] text-[#d9462e]"}`}>{item.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => { setSearch(""); setPropertyType(""); setMaxPrice(""); }} className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black">clear all</button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-2xl bg-[#e34b32] px-6 py-3 text-sm font-black text-white">Apply Filter</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChipGroup({ icon, title, items, onPick }: { icon?: ReactNode; title: string; items: string[]; onPick: (item: string) => void }) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 font-display text-xl font-black">{icon}{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button key={item} type="button" onClick={() => onPick(item)} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold transition hover:bg-[#fff3ef] hover:text-[#d9462e]">{item}</button>
        ))}
      </div>
    </div>
  );
}
