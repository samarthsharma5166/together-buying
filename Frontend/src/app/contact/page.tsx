import { Clock, Mail, MapPin, MessageCircle, Phone, Sparkles } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Section } from "@/components/section";

export default function ContactPage() {
  return (
    <main>
      <section className="property-detail-bg relative overflow-hidden py-16 text-white md:py-24">
        <div className="container-shell grid items-center gap-8 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-100 backdrop-blur"><Sparkles size={15} /> Contact GroupBuying</p>
            <h1 className="font-display text-5xl font-black leading-tight md:text-6xl">Talk to a property expert before your next visit.</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-orange-50">Share your location, budget and project preference. Our team will help you compare inventory and join the right buying group.</p>
          </div>
          <ContactForm />
        </div>
      </section>

      <Section eyebrow="Reach us" title="Contact details">
        <div className="grid gap-5 md:grid-cols-4">
          {[
            { icon: MapPin, title: "Office", text: "Sector MU-1, Greater Noida" },
            { icon: Phone, title: "Call Now", text: "+91 9992196879" },
            { icon: MessageCircle, title: "WhatsApp", text: "+91 9992196879" },
            { icon: Mail, title: "Email", text: "hello@groupbuying.in" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="hover-lift rounded-[1.75rem] bg-white p-6 premium-border">
              <Icon className="mb-4 text-[#e34b32]" />
              <p className="font-display text-xl font-black text-[#111111]">{title}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-[#fff6f2]" eyebrow="Visit planning" title="We respond quickly">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-7 premium-border">
          <Clock className="mb-4 text-[#e34b32]" size={34} />
          <h2 className="font-display text-3xl font-black text-[#111111]">Best time to request a callback</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Send your details any time. For site visits, our team usually confirms inventory, price range and RM availability before scheduling.</p>
        </div>
      </Section>
    </main>
  );
}
