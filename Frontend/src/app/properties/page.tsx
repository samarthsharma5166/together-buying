import { BadgeCheck, Filter, SlidersHorizontal, Sparkles } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PropertyCard } from "@/components/property-card";
import { PropertySearchFilter } from "@/components/property-search-filter";
import { Section } from "@/components/section";
import { getProperties } from "@/lib/api";
import { PropertiesClientWrapper } from "@/components/PropertiesClientWrapper";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const item = params[key];
  return Array.isArray(item) ? item[0] : item;
}

export default async function PropertiesPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = {
    city: value(params, "city"),
    locality: value(params, "locality"),
    propertyType: value(params, "propertyType"),
    minPrice: value(params, "minPrice"),
    maxPrice: value(params, "maxPrice"),
    search: value(params, "search"),
    page: value(params, "page") || 1,
    limit: 12,
  };
  const { properties, meta } = await getProperties(query);
  return (
    <PropertiesClientWrapper>
      <main>
        <section className="mesh-bg relative overflow-hidden py-16">
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#e34b32]/20 blur-3xl" />
          <div className="container-shell">
            <div className="max-w-3xl"><p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-[#df432c] shadow-sm"><Sparkles size={16} /> Properties</p><h1 className="font-display text-5xl font-black text-[#111111] md:text-6xl">Find your dream home with group buying savings</h1><p className="mt-5 text-lg leading-8 text-slate-600">Search active inventory, compare price ranges and join project-specific buyer groups.</p></div>
            <PropertySearchFilter defaults={query} className="mt-10" />
          </div>
        </section>

        <Section title="Exclusive Properties" description="Live projects from the existing backend when available, with curated GroupBuying fallbacks for empty states.">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-white p-4 premium-border"><p className="font-bold text-slate-700"><Filter className="mr-2 inline text-[#e34b32]" size={18} /> {meta?.total || properties.length} properties found</p><p className="rounded-full bg-[#fff3ef] px-4 py-2 text-sm font-black text-[#d9462e]"><SlidersHorizontal className="mr-2 inline" size={16} /> Group buying eligible</p></div>
          {properties.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{properties.map((property) => <PropertyCard key={property.id} property={property} />)}</div> : <div className="rounded-[2rem] bg-white p-10 text-center premium-border"><h2 className="font-display text-2xl font-black">No properties found</h2><p className="mt-3 text-slate-600">Try a different city, budget or project search.</p></div>}
        </Section>

        <Section className="bg-[#fff6f2]" title="Need help shortlisting?" description="Share your budget and preferred city. Our RM will help you compare projects and join the right group.">
          <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-[1fr_420px]"><div className="rounded-[2rem] bg-white p-8 premium-border"><BadgeCheck className="mb-5 text-[#e34b32]" size={40} /><h2 className="font-display text-3xl font-black text-[#111111]">Verified inventory, better negotiation, full support.</h2><p className="mt-4 text-slate-600">GroupBuying helps you shortlist top projects, join the right group, and unlock offers usually reserved for bulk buyers.</p></div><ContactForm /></div>
        </Section>
      </main>
    </PropertiesClientWrapper>
  );
}


