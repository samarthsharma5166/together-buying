import type { HTMLAttributes, ReactNode } from "react";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

type SectionProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
};

export function Section({ eyebrow, title, children, className, description, ...props }: SectionProps) {
  return (
    <section className={cn("py-12 md:py-18", className)} {...props}>
      <div className="container-shell">
        {(eyebrow || title || description) && (
          <Reveal className="mx-auto mb-8 max-w-3xl text-center">
            {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#e34b32]">{eyebrow}</p>}
            {title && <h2 className="font-display text-3xl font-extrabold tracking-tight text-current md:text-4xl">{title}</h2>}
            {description && <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">{description}</p>}
          </Reveal>
        )}
        <Reveal delay={0.08}>{children}</Reveal>
      </div>
    </section>
  );
}


