import { ArrowRight, BadgeCheck, Building2, CalendarDays, CheckCircle2, Gift, MapPin, Play, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { AnimatedCounter } from "@/components/animated-counter";
import { HighlightedHeading } from "@/components/highlighted-heading";
import { ButtonLink } from "@/components/button";
import { CalculatorShowcase } from "@/components/calculator-showcase";
import { ContactForm } from "@/components/contact-form";
import { FAQAccordion } from "@/components/faq-accordion";
// import { PropertyCard } from "@/components/property-card";
import { PropertyCarousel } from "@/components/property-carousel";
import { PartnerLogoGrid } from "@/components/partner-logo-grid";
import { ReviewStrip } from "@/components/review-strip";
import { Section } from "@/components/section";
import { StepTimeline } from "@/components/step-timeline";
import { VideoShowcase } from "@/components/video-showcase";
import { articles, faqs, stats, steps, testimonials, valueCards } from "@/lib/content";
import { getFeaturedProperties, getHeroSlides, getHomeSectionProperties, getBlogs, getPartnerDevelopers, getShowcaseVideos } from "@/lib/api";
import { HeroImageCarousel } from "@/components/hero-image-carousel";
import { HeroToolCards } from "@/components/hero-tool-cards";

export default async function HomePage() {
  const [fastSelling, preLaunch, featured, promising, partnerDevelopers, heroSlides, blogs, showcaseVideos] = await Promise.all([
    getHomeSectionProperties("isFastSelling"),
    getHomeSectionProperties("isPreLaunch"),
    getFeaturedProperties(),
    getHomeSectionProperties("isPromising"),
    getPartnerDevelopers(),
    getHeroSlides(),
    getBlogs(),
    getShowcaseVideos(),
  ]);
  const propertyGroups = [
    { title: "Fast Selling Properties", text: "High-demand projects with live buyer activity.", items: fastSelling },
    { title: "Pre Launch Properties", text: "Early access projects with stronger saving potential.", items: preLaunch },
    { title: "Featured Properties", text: "Curated premium inventory for group negotiation.", items: featured },
    { title: "Promising Plots / Villas", text: "Handpicked plot and villa projects with strong appreciation potential.", items: promising },
  ].filter((group) => group.items.length > 0);

  return (
    <main>
      <section className="bg-gradient-to-b from-orange-50/80 via-amber-50/40 to-transparent relative overflow-hidden pb-10 pt-8 sm:pb-14 sm:pt-10 md:pb-16 md:pt-12 lg:pb-20 lg:pt-14">
        <div
          className={`container-shell grid min-w-0 grid-cols-1 items-center gap-6 sm:gap-8${heroSlides.length > 0 ? " lg:grid-cols-[1.15fr_0.85fr] xl:grid-cols-[1.2fr_0.8fr]" : ""
            }`}
        >
          <div className="reveal-up w-full min-w-0 text-center sm:text-left">
            <div className="mb-4 flex justify-center sm:justify-start">
              <div className="animate-badge-highlight inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-xs font-black text-[#df432c] shadow-sm sm:text-base md:text-base">
                Looking to buy your Dream Property?
              </div>
            </div>
            <h1 className="mx-auto max-w-full font-display text-[clamp(2rem,7vw,2.75rem)] font-black leading-[1.15] tracking-tight text-balance sm:mx-0 sm:text-[clamp(2.25rem,5vw,3.25rem)] md:text-[clamp(2.5rem,4.2vw,3.5rem)] lg:text-[clamp(2.5rem,3.2vw,3.5rem)] lg:leading-[1.1] xl:text-[clamp(3rem,3.5vw,4.25rem)]">
              <span className="shimmer-text">Together we Bargain</span>{" "}
              <span className="gradient-text">Better</span>
            </h1>
            <p className="mt-4 font-display text-2xl font-black text-[#df432c] sm:text-3xl md:text-2xl">
              Group Up & Save More!
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:mx-0 sm:text-lg  md:leading-7">
              Get Group Buying Discount + 100% Broker Commission Cashback</p>
            <p className="mx-auto mt-1 max-w-2xl text-base leading-2 text-slate-600 sm:mx-0 sm:text-lg md:leading-7">
              Join 3-7 intrested buyers and negotiate directly with developers
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-start">
              <ButtonLink href="/properties" className="w-full !px-6 !py-3.5 !text-base text-white! sm:w-auto">
                Explore Properties <ArrowRight size={20} />
              </ButtonLink>
              <ButtonLink href="/how-it-works" variant="secondary" className="w-full !px-6 !py-3.5 !text-base sm:w-auto">
                <Play size={18} /> How it works ?
              </ButtonLink>
            </div>
            <div className="mx-auto mt-6 grid w-full max-w-2xl grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:mx-0">
              {["5-15% Extra Discount", "3-10% Cashback", "Lifetime Membership"].map((item) => (
                <div
                  key={item}
                  className="soft-card tilt-card flex items-center gap-3 rounded-2xl p-4 text-sm font-black leading-tight text-[#111111] min-[420px]:block sm:p-5 sm:text-base"
                >
                  <CheckCircle2 className="shrink-0 text-[#e34b32] min-[420px]:mb-2" size={22} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {heroSlides.length > 0 && (
            <div className="reveal-up mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-3 lg:mx-0 lg:max-w-none">
              <div className="flex justify-center lg:justify-start">
                <div className="shine-badge inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-[10px] font-black text-[#df432c] shadow-sm whitespace-nowrap min-[375px]:text-xs sm:text-sm md:text-base">
                  India's 1st AI Powered Group Buying Real Estate Platform!
                </div>
              </div>
              <HeroImageCarousel slides={heroSlides} />
            </div>
          )}
        </div>
      </section>

      <HeroToolCards />

      <Section className="pt-12 sm:pt-14 lg:pt-16" eyebrow="Shared dreams. Smart ownership." title="Buyers on GroupBuying save 10-15% more" description="We negotiate directly with developers as a group, unlock prices usually reserved for institutions, and pass back broker commission as extra savings.">
        <div className="grid gap-4 md:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="stagger-card magnetic-card hover-lift rounded-[1.75rem] bg-white p-6 text-center premium-border"><p className="font-display text-4xl font-black text-[#df432c]"><AnimatedCounter value={stat.value} /></p><p className="mt-2 text-sm font-bold text-slate-500">{stat.label}</p></div>)}</div>
      </Section>

      {propertyGroups.map((group) => (
        <Section key={group.title} eyebrow={group.title} title={group.text} headingAlign="left">
          <PropertyCarousel properties={group.items} groupTitle={group.title} />
        </Section>
      ))}

      <Section className="overflow-visible bg-[#fff6f2] py-8 md:py-10 [&_.mb-8]:mb-4" eyebrow="Explore Projects Through Video" title="Explore Projects Through Video" description="Experience our handpicked real estate projects through immersive video tours.">
        <VideoShowcase videos={showcaseVideos} />
      </Section>

      <Section id="about" className="bg-[#fff6f2]" eyebrow="Why GroupBuying" title="Unlock unbeatable deals through group buying">
        <div className="grid gap-5 md:grid-cols-3">{valueCards.map((card) => <div key={card.title} className="stagger-card magnetic-card hover-lift rounded-[2rem] bg-white p-7 premium-border"><div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff3ef] text-[#e34b32]"><Gift /></div><p className="font-display text-2xl font-black text-[#111111]">{card.title}</p><p className="mt-3 text-sm leading-7 text-slate-600">{card.text}</p><p className="mt-5 rounded-full bg-[#111111] px-4 py-2 text-center text-sm font-black text-white">{card.metric}</p></div>)}</div>
      </Section>

      <Section id="calculators" className="bg-[#fff6f2]" eyebrow="Calculate Savings" title="Save more and more with GroupBuying">
        <CalculatorShowcase />
      </Section>

      <Section 
        className="py-10 md:py-14" 
        title={<HighlightedHeading before="Our" highlight="Top Developer" after="Partners" />}
      >
        <PartnerLogoGrid developers={partnerDevelopers} />
      </Section>

      <Section id="how-it-works" eyebrow="How GroupBuying Works?" title="Follow the simple 5 steps to your dream home">
        <StepTimeline steps={steps} />
      </Section>

      <Section 
        className="real-estate-story-bg text-white" 
        title="What our customers Say" 
        description="Real stories from our community members who unlocked developer-direct savings on their dream homes through GroupBuying."
      >
        <ReviewStrip testimonials={testimonials} />
      </Section>

      <Section id="faqs" eyebrow="FAQs" title="You have questions. We have answers."><FAQAccordion items={faqs} /></Section>

      <Section className="pb-18" eyebrow="Stay Informed, Save More" title="Get in touch with a GroupBuying expert">
        <div className="visit-panel-bg grid items-center gap-6 rounded-[2rem] p-5 text-white shadow-[0_24px_70px_rgba(10,120,105,.18)] md:grid-cols-[1fr_380px] md:p-7">
          <div><BadgeCheck className="mb-4" size={34} /><h2 className="font-display text-3xl font-black leading-tight">Save big, stay secure, and get expert support.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-orange-50">Tell us your preferred city, budget and project. Our RM will compare inventory and help you join the right buying group.</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-white/15 px-3 py-2 text-xs font-bold"><ShieldCheck size={15} className="mr-1 inline" /> Verified support</span><span className="rounded-full bg-white/15 px-3 py-2 text-xs font-bold"><Building2 size={15} className="mr-1 inline" /> Developer-direct</span><span className="rounded-full bg-white/15 px-3 py-2 text-xs font-bold"><MapPin size={15} className="mr-1 inline" /> NCR specialists</span></div></div>
          <ContactForm compact />
        </div>
      </Section>
    </main>
  );
}


