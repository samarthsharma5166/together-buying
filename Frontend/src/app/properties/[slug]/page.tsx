import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Building2, CalendarDays, MapPin, Ruler, Users } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { ContactForm } from "@/components/contact-form";
import { Section } from "@/components/section";
import { getAssetUrl, getProperty, getProperties } from "@/lib/api";
import { formatPrice, initials, rangePrice } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();
  const image = getAssetUrl(property.images?.[0]?.imageUrl);
  const related = (await getProperties({ city: property.city || undefined, limit: 3 })).properties.filter((item) => item.id !== property.id).slice(0, 3);
  return (
    <main>
      <section className="property-detail-bg relative overflow-hidden py-8 text-white md:py-12">
        <div className="container-shell">
          <Link href="/properties" className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-orange-100"><ArrowLeft size={16} /> Back to properties</Link>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
            <div className="relative min-h-[460px] overflow-hidden rounded-[2.7rem] bg-gradient-to-br from-[#e34b32] via-[#111111] to-[#071b2f] shadow-[0_32px_90px_rgba(7,31,53,.25)]">
              {image && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="mb-4 flex flex-wrap gap-2">{property.isFeatured && <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#df432c]">Featured</span>}{property.isPreLaunch && <span className="rounded-full bg-[#f3b64a] px-4 py-2 text-sm font-black text-[#111111]">Pre Launch</span>}</div>
                <h1 className="font-display text-4xl font-black md:text-6xl">{property.title}</h1>
                <p className="mt-3 flex items-center gap-2 text-slate-200"><MapPin size={18} /> {[property.locality, property.city].filter(Boolean).join(", ") || "Prime NCR location"}</p>
              </div>
            </div>
            <aside className="glass-panel rounded-[2.3rem] p-6 text-[#111111] md:p-8">
              <div className="mb-6 flex items-center gap-3"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff3ef] font-black text-[#df432c]">{initials(property.developer?.companyName)}</span><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Developer</p><p className="font-display text-xl font-black">{property.developer?.companyName || "GroupBuying Partner"}</p></div></div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Price Range</p><p className="mt-2 font-display text-4xl font-black text-[#df432c]">{rangePrice(property.minPrice, property.maxPrice)}</p>
              <div className="mt-6 grid gap-3 text-sm font-semibold text-slate-700"><p><Building2 className="mr-2 inline text-[#e34b32]" size={18} /> {property.propertyType || "Apartment"}</p><p><CalendarDays className="mr-2 inline text-[#e34b32]" size={18} /> {property.possessionStatus || "Possession on request"}</p><p><Users className="mr-2 inline text-[#e34b32]" size={18} /> Group buying discount available</p></div>
              <ButtonLink href="#visit" className="mt-8 w-full">Book a Visit</ButtonLink>
            </aside>
          </div>
        </div>
      </section>

      <Section title="Project Overview">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-[2rem] bg-white p-7 premium-border">
            <p className="text-lg leading-8 text-slate-600">{property.description || "This premium project is eligible for GroupBuying group negotiation, broker cashback and relationship manager support from shortlist to final purchase."}</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">{(property.units?.length ? property.units : [{ unitType: "3 BHK", superAreaSqft: 2500, price: property.minPrice }]).map((unit, index) => <div key={`${unit.unitType}-${index}`} className="hover-lift rounded-[1.5rem] bg-slate-50 p-5"><Ruler className="mb-3 text-[#e34b32]" /><p className="font-display text-xl font-black">{unit.unitType || "Unit"}</p><p className="mt-2 text-sm text-slate-500">{unit.superAreaSqft || unit.carpetAreaSqft || "Area on request"} sqft</p><p className="mt-3 font-bold text-[#df432c]">{formatPrice(unit.price)}</p></div>)}</div>
          </div>
          <div id="visit"><ContactForm /></div>
        </div>
      </Section>

      <Section className="bg-[#fff6f2]" title="GroupBuying advantage">
        <div className="grid gap-5 md:grid-cols-3">{["Developer-direct negotiation", "100% broker cashback", "Inventory and visit support"].map((item) => <div key={item} className="hover-lift rounded-[1.75rem] bg-white p-6 premium-border"><BadgeCheck className="mb-4 text-[#e34b32]" /><p className="font-display text-xl font-black text-[#111111]">{item}</p></div>)}</div>
        {related.length > 0 && <div className="mt-8 text-center"><ButtonLink href="/properties" variant="secondary">Explore related projects</ButtonLink></div>}
      </Section>
    </main>
  );
}


