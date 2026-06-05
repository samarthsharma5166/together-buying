"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FAQAccordion({ items }: { items: { question: string; answer: string }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-3 premium-border">
      {items.map((item, index) => (
        <div key={item.question} className="border-b border-slate-100 last:border-0">
          <button onClick={() => setActive(active === index ? -1 : index)} className="flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-5 text-left font-display text-lg font-bold text-[#111111] hover:bg-slate-50">
            {item.question}<ChevronDown className={cn("shrink-0 transition", active === index && "rotate-180 text-[#e34b32]")} />
          </button>
          {active === index && <p className="px-5 pb-5 text-sm leading-7 text-slate-600">{item.answer}</p>}
        </div>
      ))}
    </div>
  );
}


