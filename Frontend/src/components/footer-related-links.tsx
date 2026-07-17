import Link from "next/link";
import { footerRelatedLinks } from "@/lib/content";

export function FooterRelatedLinks() {
  return (
    <section className="border-t border-white/10 bg-[#1a1a1a] text-white">
      <div className="container-shell py-12 md:py-14">
        <h2 className="mb-8 font-display text-2xl font-black text-white md:text-3xl">
          Related to your search
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {footerRelatedLinks.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-black leading-snug text-white">{column.title}</h3>
              <ul className="grid gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition hover:text-[#e34b32]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
