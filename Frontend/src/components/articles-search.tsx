"use client";

import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

export const ARTICLE_CATEGORIES = [
  "All",
  "Success Stories",
  "Market Insights",
  "Buyer's Guide",
  "Tips & Guides",
  "NRI Corner",
  "General",
] as const;

type Props = {
  initialQuery?: string;
  initialCategory?: string;
  className?: string;
};

export function ArticlesSearch({
  initialQuery = "",
  initialCategory = "",
  className,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query, 400);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const currentQ = searchParams.get("q") || "";
    const nextQ = debouncedQuery.trim();
    if (currentQ === nextQ) return;

    const params = new URLSearchParams(searchParams.toString());
    if (nextQ) params.set("q", nextQ);
    else params.delete("q");
    params.delete("page");

    startTransition(() => {
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }, [debouncedQuery, pathname, router, searchParams]);

  const updateCategory = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category && category !== "All") params.set("category", category);
    else params.delete("category");
    params.delete("page");
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const clearSearch = () => {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  return (
    <div className={cn("space-y-0", className)}>
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles"
          aria-label="Search articles"
          className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-semibold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#e34b32] focus:ring-2 focus:ring-[#e34b32]/15"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-slate-200 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ARTICLE_CATEGORIES.map((category) => {
          const active =
            category === "All" ? !initialCategory : initialCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => updateCategory(category)}
              className={cn(
                "-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-bold transition",
                active
                  ? "border-[#e34b32] text-[#111111]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
