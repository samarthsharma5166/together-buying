"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils";

const CIRCLE_SIZE = 190;
const STROKE = 14;
const RADIUS = (CIRCLE_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function EmiCalculator() {
  const [loan, setLoan] = useState(8000000);
  const [rate, setRate] = useState(6.75);
  const [years, setYears] = useState(20);
  const emi = useMemo(() => {
    const monthly = rate / 12 / 100;
    const months = years * 12;
    return Math.round((loan * monthly * Math.pow(1 + monthly, months)) / (Math.pow(1 + monthly, months) - 1));
  }, [loan, rate, years]);
  const total = emi * years * 12;
  const progress = Math.min(0.9, Math.max(0.18, (emi / 120000) * 0.55 + (rate / 30) * 0.2 + (years / 30) * 0.15));
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="rounded-[1.7rem] bg-white p-5 premium-border md:p-6">
      <div className="mb-4 text-center"><p className="text-xs font-black uppercase tracking-[0.22em] text-[#e34b32]">EMI Calculator</p><h3 className="font-display text-3xl font-black text-[#111111]">Your Monthly Home EMI</h3></div>
      <div className="grid items-center gap-5 lg:grid-cols-[1fr_240px]">
        <div className="grid gap-4">
          <label className="grid gap-2 text-xs font-bold text-slate-700">Loan Amount <span className="justify-self-end font-black text-[#111111]">{formatPrice(loan)}</span><input type="range" min="100000" max="130000000" step="100000" value={loan} onChange={(event) => setLoan(Number(event.target.value))} className="accent-[#e34b32]" /></label>
          <label className="grid gap-2 text-xs font-bold text-slate-700">Interest Rate (% P.A.) <span className="justify-self-end font-black text-[#111111]">{rate}%</span><input type="range" min="1" max="30" step="0.05" value={rate} onChange={(event) => setRate(Number(event.target.value))} className="accent-[#e34b32]" /></label>
          <label className="grid gap-2 text-xs font-bold text-slate-700">Loan Tenure <span className="justify-self-end font-black text-[#111111]">{years} Years</span><input type="range" min="1" max="30" value={years} onChange={(event) => setYears(Number(event.target.value))} className="accent-[#e34b32]" /></label>
        </div>
        <div className="emi-orbit relative mx-auto flex h-[210px] w-[210px] items-center justify-center">
          <svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`} className="-rotate-90">
            <circle cx={CIRCLE_SIZE / 2} cy={CIRCLE_SIZE / 2} r={RADIUS} fill="none" stroke="#e8edf3" strokeWidth={STROKE} />
            <circle cx={CIRCLE_SIZE / 2} cy={CIRCLE_SIZE / 2} r={RADIUS} fill="none" stroke="#e34b32" strokeWidth={STROKE} strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset} className="transition-[stroke-dashoffset] duration-700 ease-out" />
          </svg>
          <div className="absolute text-center"><p className="text-xs font-bold text-slate-500">Monthly EMI</p><p className="font-display text-3xl font-black text-[#111111]">{formatPrice(emi)}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#e34b32]">{Math.round(progress * 100)}% load</p></div>
        </div>
      </div>
      <div className="mt-5 grid gap-3 rounded-[1.25rem] bg-[#fff3ef] p-4 text-[#111111] md:grid-cols-3"><p><span className="block text-xs font-bold text-slate-500">Interest Amount</span><b>{formatPrice(total - loan)}</b></p><p><span className="block text-xs font-bold text-slate-500">Principal Amount</span><b>{formatPrice(loan)}</b></p><p><span className="block text-xs font-bold text-slate-500">Total Payable</span><b>{formatPrice(total)}</b></p></div>
    </div>
  );
}
