import type { HTMLAttributes, ReactNode } from "react";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

type SectionProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  headingAlign?: "left" | "center";
  headingSize?: "default" | "property" | "featured";
  children: ReactNode;
};

export function Section({
  eyebrow,
  title,
  children,
  className,
  description,
  headingAlign = "center",
  headingSize = "default",
  ...props
}: SectionProps) {
  const mainHeading = title || eyebrow;
  const subHeading = eyebrow && title && eyebrow !== title ? eyebrow : undefined;
  const isLeft = headingAlign === "left";
  const isProperty = headingSize === "property";
  const isFeatured = headingSize === "featured";

  return (
    <section className={cn("py-8 md:py-10", className)} {...props}>
      <div className="container-shell">
        {(mainHeading || description) && (
          <Reveal className={cn("mb-8 max-w-5xl", isLeft ? "text-left" : "mx-auto text-center")}>
            {mainHeading && (
              <h2
                className={cn(
                  "font-display font-extrabold tracking-tight text-current",
                  isProperty
                    ? "text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]"
                    : isFeatured
                      ? "text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-tight"
                      : "text-3xl md:text-4xl lg:text-[2.5rem] lg:leading-tight"
                )}
              >
                {mainHeading}
              </h2>
            )}
            {subHeading && (
              <p
                className={cn(
                  "mt-2 font-medium leading-6 text-current/70",
                  isProperty
                    ? "text-xs sm:text-sm"
                    : "text-sm sm:text-base lg:whitespace-nowrap"
                )}
              >
                {subHeading}
              </p>
            )}
            {description && (
              <p className={cn("mt-3 max-w-3xl text-sm leading-7 text-current/65 md:text-base", !isLeft && "mx-auto")}>
                {description}
              </p>
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
