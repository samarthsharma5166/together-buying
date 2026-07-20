"use client";

import { useEffect, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ShareButtonProps = {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
  label?: string;
};

export function ShareButton({
  title,
  text,
  url,
  className,
  label = "Share this story",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleShare = async () => {
    const shareUrl =
      url || (typeof window !== "undefined" ? window.location.href : "");
    if (!shareUrl) return;

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: title || document.title,
          text: text || title || "",
          url: shareUrl,
        });
        return;
      }
    } catch (err: any) {
      // User cancelled native share — don't treat as failure
      if (err?.name === "AbortError") return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-[#e34b32]/40 hover:bg-[#fff7f3] hover:text-[#e34b32]",
        className
      )}
      aria-label={copied ? "Link copied" : label}
    >
      {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
      {copied ? "Link copied" : label}
    </button>
  );
}
