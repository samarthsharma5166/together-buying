import Link from "next/link";
import { Heart, MapPin, Phone, Repeat2, Share2, Users } from "lucide-react";
import type { Property } from "@/lib/api";
import { getAssetUrl } from "@/lib/api";
import { initials, rangePrice } from "@/lib/utils";

export function PropertyCard({ property, compact = false }: { property: Property; compact?: boolean }) {
  const image = getAssetUrl(property.images?.[0]?.imageUrl);
  const href = `/properties/${property.slug || property.id}`;
  const joined = property.isPreLaunch ? 4 : property.isFeatured ? 7 : 2;
  const buying = property.isPreLaunch ? 5 : property.isFeatured ? 4 : 3;

  return (
    <Link href={href} className="group magnetic-card hover-lift block overflow-hidden rounded-[1.65rem] bg-white p-3 premium-border">
      <div className="relative h-44 overflow-hidden rounded-[1.1rem] bg-gradient-to-br from-[#e34b32] via-[#f36a4b] to-[#111111]">
        {image ? <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${image})` }} /> : <div className="absolute inset-0 hero-grid opacity-50" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <div className="absolute left-0 top-4 flex flex-wrap gap-2">
          <span className="ribbon-badge bg-[#e34b32] px-4 py-1 text-xs font-black uppercase text-white shadow-lg">{property.isPreLaunch ? "Pre Launch" : property.isFeatured ? "Exclusive Deal" : "Verified Deal"}</span>
        </div>
        <div className="absolute right-3 top-3 grid gap-2">
          <span className="property-action"><Heart size={17} /></span>
          <span className="property-action"><Repeat2 size={16} /></span>
          <span className="property-action"><Share2 size={16} /></span>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-black backdrop-blur">{initials(property.developer?.companyName)}</span>
          <span className="text-xs font-bold">{property.developer?.companyName || "GroupBuying Partner"}</span>
        </div>
      </div>

      <div className="px-1 pb-1 pt-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-black text-[#111111]">{property.title}</h3>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500"><MapPin size={14} /> {[property.locality, property.city].filter(Boolean).join(", ") || "Sector 90, Gurugram"}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e34b32] text-white shadow-lg"><Phone size={16} /></span>
        </div>

        <div className="rounded-[1rem] bg-[#fff3ef] p-3">
          <div className="mb-2 flex items-center justify-between text-[11px] font-black text-[#b43b2a]"><span><Users className="mr-1 inline" size={13} /> Group buying in progress</span><span>Why group buying?</span></div>
          <p className="text-xs font-bold text-emerald-700">↗ {joined} joined in the last month</p>
          <p className="mt-1 text-center text-sm font-black text-[#111111]">{buying} families are purchasing apartments!</p>
          <div className="mt-3 flex items-center justify-center -space-x-2">
            {[1, 2, 3, 4].map((item) => <span key={item} className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-[#e7d0c8] to-[#6f5b52] shadow-sm" />)}
            <span className="ml-3 text-xs font-bold text-[#b43b2a]">You? Become {buying + 1}th member</span>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div><p className="text-xs font-bold text-slate-500">Target Price</p><p className="font-display text-2xl font-black text-[#111111]">{rangePrice(property.minPrice, compact ? null : property.maxPrice)}</p><p className="text-xs font-bold text-emerald-600">Upto 22.8L off</p></div>
          <span className="rounded-xl bg-[#e34b32] px-4 py-3 text-xs font-black text-white shadow-lg transition group-hover:bg-[#111111]">Join Group</span>
        </div>
      </div>
    </Link>
  );
}

