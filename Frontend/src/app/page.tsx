import { ArrowRight, BadgeCheck, BarChart3, Building2, CalendarDays, CheckCircle2, Gift, MapPin, Play, Radar, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import { ButtonLink } from "@/components/button";
import { CalculatorShowcase } from "@/components/calculator-showcase";
import { ContactForm } from "@/components/contact-form";
import { FAQAccordion } from "@/components/faq-accordion";
import { PropertyCard } from "@/components/property-card";
import { PartnerLogoGrid } from "@/components/partner-logo-grid";
import { PropertySearchFilter } from "@/components/property-search-filter";
import { ReviewStrip } from "@/components/review-strip";
import { Section } from "@/components/section";
import { StepTimeline } from "@/components/step-timeline";
import { VideoShowcase } from "@/components/video-showcase";
import { articles, faqs, partnerNames, stats, steps, testimonials, valueCards } from "@/lib/content";
import { getDevelopers, getFeaturedProperties } from "@/lib/api";

export default async function HomePage() {
  const [featured, developers] = await Promise.all([getFeaturedProperties(), getDevelopers()]);
  const partners = developers.length ? developers.map((item) => item.companyName) : partnerNames;
  const videoCards = ["Luxury project walkthrough", "Live virtual site visit", "Buyer savings story", "Inventory comparison"];
  const propertyGroups = [
    { title: "Fast Selling Properties", text: "High-demand projects with live buyer activity.", items: featured.slice(0, 3) },
    { title: "Featured Properties", text: "Curated premium inventory for group negotiation.", items: featured.slice(0, 3) },
    { title: "Pre Launch Properties", text: "Early access projects with stronger saving potential.", items: featured.filter((item) => item.isPreLaunch).concat(featured).slice(0, 3) },
  ];

  return (
    <main>
      <section className="hero-premium-bg relative overflow-hidden pb-12 pt-8 md:pb-18 md:pt-12">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#e34b32]/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#111111]/10 blur-3xl" />
        <div className="glow-blob green left-1/3 top-24" />
        <div className="glow-blob blue right-20 top-56" />
        <div className="glow-blob gold bottom-24 left-16" />
        <div className="container-shell grid items-center gap-12 lg:grid-cols-[1.03fr_.97fr]">
          <div className="reveal-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-black text-[#df432c] shadow-sm">
              <Sparkles size={17} /> India's First Group Buying Real Estate Platform
            </div>
            <h1 className="font-display shimmer-text text-5xl font-black leading-[1.02] tracking-tight md:text-6xl">
              Looking to buy your <span className="gradient-text">Dream Home?</span>
            </h1>
            <p className="mt-4 font-display text-2xl font-extrabold text-[#df432c] md:text-3xl">Pay Less Together</p>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">Get group buying discounts plus 100% broker commission cashback. Join 3-7 serious buyers and negotiate directly with developers.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/properties">Explore Properties <ArrowRight size={18} /></ButtonLink><ButtonLink href="/how-it-works" variant="secondary"><Play size={18} /> How it works</ButtonLink></div>
            <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
              {["5-10% Extra Discount", "3-5% Cashback", "Lifetime Membership"].map((item) => <div key={item} className="soft-card tilt-card rounded-[1.4rem] p-4 text-sm font-black text-[#111111]"><CheckCircle2 className="mb-2 text-[#e34b32]" size={20} />{item}</div>)}
            </div>
          </div>

          <div className="relative min-h-[460px]">
            <div className="floating absolute left-0 top-8 z-30 rounded-[1.5rem] bg-white p-4 shadow-2xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">We've saved</p><p className="font-display text-3xl font-black text-[#df432c]">₹25Cr+</p><p className="text-xs font-bold text-slate-500">for 150+ families</p></div>
            <div className="animated-border absolute left-8 right-8 top-10 overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#e34b32] via-[#111111] to-[#111111] p-4 shadow-[0_35px_100px_rgba(7,31,53,.28)] md:left-12 md:right-10">
              <div className="relative min-h-[390px] overflow-hidden rounded-[2.4rem] bg-white/10 p-5 text-white backdrop-blur">
                <div className="absolute inset-x-10 top-10 h-40 rounded-[2rem] bg-white/12 blur-2xl" />
                <div className="absolute inset-0">
                  <div className="hero-3d-building absolute left-6 right-6 top-8 z-10 h-72 overflow-hidden rounded-[2.4rem] border border-white/35 bg-cover bg-center shadow-[0_38px_105px_rgba(0,0,0,.42)] md:left-10 md:right-4 md:h-80" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1300&q=92)" }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-transparent to-[#111111]/38" />
                  </div>
                  <div className="absolute -bottom-8 left-4 h-32 w-52 rounded-[2rem] bg-cover bg-center opacity-80 shadow-[0_22px_55px_rgba(0,0,0,.24)] blur-[.4px]" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=88)" }} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#111111]/12 via-white/8 to-[#e34b32]/18" />
              </div>
            </div>
          </div>
        </div>

        <div className="container-shell -mb-24 mt-8 relative z-20">
          <PropertySearchFilter />
        </div>
      </section>

      <section className="relative -mt-10 z-30 pb-8">
        <div className="container-shell">
          <div className="animated-border grid gap-4 rounded-[2.2rem] p-1 md:grid-cols-3">
            {[
              { icon: Radar, title: "Live Group Signals", text: "Track buyer interest, project demand and best entry timing." },
              { icon: BarChart3, title: "Savings Intelligence", text: "Compare market quote, group offer and cashback upside." },
              { icon: Zap, title: "Instant RM Action", text: "Shortlist, site visit and negotiation support without delay." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="stagger-card rounded-[2rem] bg-white/95 p-6 shadow-sm backdrop-blur">
                <Icon className="mb-4 text-[#e34b32]" size={32} />
                <h3 className="font-display text-xl font-black text-[#111111]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section className="pt-32" eyebrow="Shared dreams. Smart ownership." title="Buyers on GroupBuying save 10-15% more" description="We negotiate directly with developers as a group, unlock prices usually reserved for institutions, and pass back broker commission as extra savings.">
        <div className="grid gap-4 md:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="stagger-card magnetic-card hover-lift rounded-[1.75rem] bg-white p-6 text-center premium-border"><p className="font-display text-4xl font-black text-[#df432c]"><AnimatedCounter value={stat.value} /></p><p className="mt-2 text-sm font-bold text-slate-500">{stat.label}</p></div>)}</div>
      </Section>

      <Section eyebrow="Explore Projects Through Video" title="Explore Projects Through Video" description="Experience our handpicked real estate projects through immersive video tours.">
        <VideoShowcase videos={videoCards} />
      </Section>

      <Section id="about" className="bg-[#fff6f2]" eyebrow="Why GroupBuying" title="Unlock unbeatable deals through group buying">
        <div className="grid gap-5 md:grid-cols-3">{valueCards.map((card) => <div key={card.title} className="stagger-card magnetic-card hover-lift rounded-[2rem] bg-white p-7 premium-border"><div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff3ef] text-[#e34b32]"><Gift /></div><p className="font-display text-2xl font-black text-[#111111]">{card.title}</p><p className="mt-3 text-sm leading-7 text-slate-600">{card.text}</p><p className="mt-5 rounded-full bg-[#111111] px-4 py-2 text-center text-sm font-black text-white">{card.metric}</p></div>)}</div>
      </Section>

      {propertyGroups.map((group) => (
        <Section key={group.title} eyebrow={group.title} title={group.text}>
          <div className="mb-6 flex justify-end"><ButtonLink href="/properties" variant="secondary">view all <ArrowRight size={18} /></ButtonLink></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{group.items.map((property, index) => <PropertyCard key={`${group.title}-${property.id}-${index}`} property={property} />)}</div>
        </Section>
      ))}

      <Section className="bg-[#fff6f2]" eyebrow="Calculate Savings" title="Save more and more with GroupBuying">
        <CalculatorShowcase />
      </Section>

      <Section className="py-10 md:py-14" eyebrow="Our Top Developer Partners" title="Our Top Developer Partners">
        <PartnerLogoGrid partners={partners.concat(partnerNames)} />
      </Section>

      <Section id="how-it-works" eyebrow="How Does GroupBuying Work?" title="Follow the simple 5 steps to your dream home">
        <StepTimeline steps={steps} />
      </Section>

      <Section className="real-estate-story-bg text-white" eyebrow="Case Studies" title="Real estate success stories: transforming spaces">
        <ReviewStrip testimonials={testimonials} />
        <div className="mt-8 grid gap-4 md:grid-cols-3">{articles.map((article) => <div key={article} className="rounded-[1.5rem] bg-white p-5 text-[#111111]"><p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#df432c]">Read More</p><h3 className="font-display text-lg font-black">{article}</h3><p className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500"><CalendarDays size={15} /> Updated case study</p></div>)}</div>
      </Section>

      <Section id="faqs" eyebrow="FAQs" title="You have questions. We have answers."><FAQAccordion items={faqs} /></Section>

      <Section className="pb-18" eyebrow="Stay Informed, Save More" title="Plan your visit with a GroupBuying expert">
        <div className="visit-panel-bg grid items-center gap-6 rounded-[2rem] p-5 text-white shadow-[0_24px_70px_rgba(10,120,105,.18)] md:grid-cols-[1fr_380px] md:p-7">
          <div><BadgeCheck className="mb-4" size={34} /><h2 className="font-display text-3xl font-black leading-tight">Save big, stay secure, and get expert support.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-orange-50">Tell us your preferred city, budget and project. Our RM will compare inventory and help you join the right buying group.</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-white/15 px-3 py-2 text-xs font-bold"><ShieldCheck size={15} className="mr-1 inline" /> Verified support</span><span className="rounded-full bg-white/15 px-3 py-2 text-xs font-bold"><Building2 size={15} className="mr-1 inline" /> Developer-direct</span><span className="rounded-full bg-white/15 px-3 py-2 text-xs font-bold"><MapPin size={15} className="mr-1 inline" /> NCR specialists</span></div></div>
          <ContactForm compact />
        </div>
      </Section>
    </main>
  );
}


