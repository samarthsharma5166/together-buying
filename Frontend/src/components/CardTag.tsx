import { Flame, Hammer, Key, Rocket, ShieldCheck, Sparkles, Zap } from "lucide-react";
import type { Property } from "@/lib/api";

export type PropertyTagType =
  | "NEW_LAUNCH"
  | "PRE_LAUNCH"
  | "UNDER_CONSTRUCTION"
  | "READY_TO_MOVE"
  | "FAST_SELLING"
  | "FEATURED"
  | "DEFAULT";

const TAG_STYLES: Record<
  PropertyTagType,
  { label: string; gradient: string; shadow: string; ring: string; Icon: typeof ShieldCheck }
> = {
  NEW_LAUNCH: {
    label: "New Launch",
    gradient: "from-[#e34b32] via-[#f05a40] to-[#ff7a5c]",
    shadow: "shadow-[#e34b32]/40",
    ring: "ring-[#e34b32]/30",
    Icon: Flame,
  },
  PRE_LAUNCH: {
    label: "Pre Launch",
    gradient: "from-violet-600 via-purple-500 to-fuchsia-500",
    shadow: "shadow-violet-900/40",
    ring: "ring-violet-400/30",
    Icon: Rocket,
  },
  UNDER_CONSTRUCTION: {
    label: "Under Construction",
    gradient: "from-amber-500 via-orange-500 to-yellow-500",
    shadow: "shadow-amber-900/40",
    ring: "ring-amber-400/30",
    Icon: Hammer,
  },
  READY_TO_MOVE: {
    label: "Ready To Move",
    gradient: "from-emerald-600 via-green-500 to-teal-500",
    shadow: "shadow-emerald-900/40",
    ring: "ring-emerald-400/30",
    Icon: Key,
  },
  FAST_SELLING: {
    label: "Fast Selling",
    gradient: "from-rose-600 via-red-500 to-orange-500",
    shadow: "shadow-rose-900/40",
    ring: "ring-rose-400/30",
    Icon: Zap,
  },
  FEATURED: {
    label: "Featured",
    gradient: "from-[#111111] via-slate-700 to-slate-600",
    shadow: "shadow-slate-900/50",
    ring: "ring-slate-400/30",
    Icon: Sparkles,
  },
  DEFAULT: {
    label: "Verified Deal",
    gradient: "from-slate-700 via-slate-600 to-slate-500",
    shadow: "shadow-slate-900/40",
    ring: "ring-slate-400/20",
    Icon: ShieldCheck,
  },
};

export function resolvePropertyTag(property: Pick<Property, "possessionStatus" | "isPreLaunch" | "isFastSelling" | "isFeatured">): PropertyTagType {
  if (property.isFastSelling) return "FAST_SELLING";
  if (property.isPreLaunch) return "PRE_LAUNCH";
  if (property.isFeatured) return "FEATURED";

  const status = (property.possessionStatus || "").toUpperCase().replace(/[\s-]+/g, "_");

  if (status.includes("PRE") && status.includes("LAUNCH")) return "PRE_LAUNCH";
  if (status.includes("NEW") && status.includes("LAUNCH")) return "NEW_LAUNCH";
  if (status.includes("READY")) return "READY_TO_MOVE";
  if (status.includes("UNDER") || status.includes("CONSTRUCTION")) return "UNDER_CONSTRUCTION";
  if (status === "PRE_LAUNCH") return "PRE_LAUNCH";
  if (status === "NEW_LAUNCH") return "NEW_LAUNCH";
  if (status === "READY_TO_MOVE") return "READY_TO_MOVE";
  if (status === "UNDER_CONSTRUCTION") return "UNDER_CONSTRUCTION";

  return "DEFAULT";
}

export default function CardTag({ property }: { property: Pick<Property, "possessionStatus" | "isPreLaunch" | "isFastSelling" | "isFeatured"> }) {
  const tagType = resolvePropertyTag(property);
  const { label, gradient, shadow, ring, Icon } = TAG_STYLES[tagType];

  return (
    <div className="absolute left-0 top-4 z-10">
      <div
        className={`flex items-center gap-1.5 py-1.5 pl-3.5 pr-6 text-[10.5px] font-black uppercase tracking-wider text-white shadow-lg ring-1 ${ring} ${shadow} bg-gradient-to-r ${gradient}`}
        style={{ clipPath: "polygon(0 0, 100% 0, 90% 50%, 100% 100%, 0 100%)" }}
      >
        <Icon size={13} className="shrink-0 text-white/95" strokeWidth={2.5} />
        {label}
      </div>
    </div>
  );
}
