"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function TypingText({ text, active }: { text: string; active: boolean }) {
  const [shown, setShown] = useState(active ? "" : text);

  useEffect(() => {
    if (!active) {
      setShown(text);
      return;
    }
    setShown("");
    let index = 0;
    const id = window.setInterval(() => {
      index += 1;
      setShown(text.slice(0, index));
      if (index >= text.length) window.clearInterval(id);
    }, 18);
    return () => window.clearInterval(id);
  }, [active, text]);

  return <>{shown}{active && shown.length < text.length ? <span className="typing-cursor">|</span> : null}</>;
}

export function StepTimeline({ steps }: { steps: string[][] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setActiveIndex((value) => (value + 1) % steps.length), 2600);
    return () => window.clearInterval(id);
  }, [steps.length]);

  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="absolute left-1/2 top-7 hidden h-[84%] w-px -translate-x-1/2 border-l border-dashed border-[#111111]/25 lg:block" />
      <div className="grid gap-5">
        {steps.map(([num, title, text], index) => {
          const active = activeIndex === index;
          return (
            <motion.div
              key={num}
              className={`relative flex ${index % 2 ? "lg:justify-end" : "lg:justify-start"}`}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.45 }}
              transition={{ duration: 0.72, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className={`step-open hover-lift relative w-full rounded-[1.6rem] p-4 text-white shadow-[0_14px_34px_rgba(227,75,50,.18)] lg:w-[46%] ${active ? "bg-[#e34b32]" : "bg-[#111111]"}`}
                animate={{ scale: active ? 1.02 : 1, x: active ? (index % 2 ? -5 : 5) : 0 }}
                whileHover={{ scale: 1.025 }}
              >
                <div className={`absolute top-1/2 hidden h-5 w-5 -translate-y-1/2 rotate-45 lg:block ${index % 2 ? "-left-2" : "-right-2"} ${active ? "bg-[#e34b32]" : "bg-[#111111]"}`} />
                <div className="flex items-center gap-4">
                  <motion.div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-center font-display text-2xl font-black ${active ? "text-[#e34b32]" : "text-[#111111]"}`}
                    animate={{ rotate: active ? [0, -4, 4, 0] : 0, scale: active ? 1.05 : 1 }}
                    transition={{ duration: 0.7 }}
                  >
                    <span><span className="block text-[10px]">STEP</span>{num}</span>
                  </motion.div>
                  <div>
                    <h3 className="font-display text-lg font-black"><TypingText text={title} active={active} /></h3>
                    <p className="mt-1 text-xs leading-5 text-white/90"><TypingText text={text} active={active} /></p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
