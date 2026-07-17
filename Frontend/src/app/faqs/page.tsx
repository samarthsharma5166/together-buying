import { HelpCircle, MessageCircle, ShieldQuestion, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { FAQAccordion } from "@/components/faq-accordion";
import { Section } from "@/components/section";
import { faqs } from "@/lib/content";

export default function FAQsPage() {
  return (
    <main>
      <section className="hero-premium-bg relative overflow-hidden py-16 md:py-24">
        <div className="container-shell text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#e34b32] shadow-sm"><HelpCircle size={15} /> FAQs</p>
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-black leading-tight text-[#111111] md:text-6xl">Answers before you make a property decision.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">Understand group buying, cashback, negotiation support and buyer safety before you join an active project group.</p>
        </div>
      </section>

      <Section eyebrow="Common questions" title="Everything buyers usually ask">
        <FAQAccordion items={faqs.concat([
          { question: "Do I have to buy the same unit as the group?", answer: "No. The group improves negotiation power. Each buyer still books their preferred unit independently." },
          { question: "When do I speak with an expert?", answer: "You can request a call after shortlisting a project. Our RM helps compare price, inventory and visit timing." },
          { question: "Is GroupBuying a broker?", answer: "GroupBuying is a buyer-first coordination and savings platform. The goal is transparent developer-direct negotiation and cashback clarity." },
        ])} />
      </Section>

      <Section className="bg-[#fff6f2]" eyebrow="Still need help?" title="Ask our team directly">
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
          {[{ icon: MessageCircle, title: "WhatsApp support" }, { icon: ShieldQuestion, title: "Savings clarity" }, { icon: Sparkles, title: "Project guidance" }].map(({ icon: Icon, title }) => (
            <div key={title} className="hover-lift rounded-[1.75rem] bg-white p-6 text-center premium-border">
              <Icon className="mx-auto mb-4 text-[#e34b32]" />
              <p className="font-display text-xl font-black text-[#111111]">{title}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/contact">Contact team</ButtonLink>
        </div>
      </Section>
    </main>
  );
}
