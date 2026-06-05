"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Calculator, IndianRupee, TrendingDown, Users } from "lucide-react";
import { EmiCalculator } from "@/components/emi-calculator";
import { SavingsCalculator } from "@/components/savings-calculator";

const highlights = [
  { label: "Group Discount", value: "5-10%", icon: Users },
  { label: "Broker Cashback", value: "100%", icon: IndianRupee },
  { label: "EMI Intelligence", value: "Live", icon: Calculator },
  { label: "Better Quote", value: "10-15%", icon: TrendingDown },
];

export function CalculatorShowcase() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setActive((value) => (value + 1) % highlights.length), 1800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[2.2rem] bg-[#fff8f5] p-3 shadow-[0_24px_70px_rgba(227,75,50,.12)] md:p-5">
      <div className="calculator-ambient absolute inset-0" />
      <div className="relative mb-4 grid gap-3 md:grid-cols-4">
        {highlights.map(({ label, value, icon: Icon }, index) => (
          <motion.div
            key={label}
            animate={{ y: active === index ? -4 : 0, scale: active === index ? 1.025 : 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className={`rounded-[1.2rem] border bg-white p-3 shadow-sm transition ${active === index ? "border-[#e34b32]" : "border-white"}`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff3ef] text-[#e34b32]"><Icon size={17} /></span>
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Auto</span>
            </div>
            <p className="font-display text-xl font-black text-[#111111]">{value}</p>
            <p className="text-xs font-bold text-slate-500">{label}</p>
          </motion.div>
        ))}
      </div>
      <div className="relative grid gap-5 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.65 }} className="calculator-card-shell">
          <SavingsCalculator />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.65, delay: 0.08 }} className="calculator-card-shell">
          <EmiCalculator />
        </motion.div>
      </div>
    </div>
  );
}
