import type { HTMLAttributes, ReactNode } from "react";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

type SectionProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  headingAlign?: "left" | "center";
  children: ReactNode;
};

export function Section({ eyebrow, title, children, className, description, headingAlign = "center", ...props }: SectionProps) {
  const mainHeading = title || eyebrow;
  const subHeading = eyebrow && title && eyebrow !== title ? eyebrow : undefined;
  const isLeft = headingAlign === "left";

  return (
    <section className={cn("py-8 md:py-10", className)} {...props}>
      <div className="container-shell">
        {(mainHeading || description) && (
          <Reveal className={cn("mb-8 max-w-5xl", isLeft ? "text-left" : "mx-auto text-center")}>
            {mainHeading && (
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-current md:text-4xl lg:text-[2.5rem] lg:leading-tight">
                {mainHeading}
              </h2>
            )}
            {subHeading && (
              <p className="mt-2 text-sm font-medium leading-6 text-current/70 sm:text-base lg:whitespace-nowrap">
                {subHeading}
              </p>
            )}
            {description && (
              <p className={cn("mt-3 max-w-3xl text-sm leading-7 text-current/65 md:text-base", !isLeft && "mx-auto")}>{description}</p>
            )}
          </Reveal>
        )}
        <Reveal delay={0.08} className="overflow-visible">
          {children}
        </Reveal>
      </div>
    </section>
  );
}
