"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function MetricPill({ label, value, tone = "neutral", icon }: { label: string; value: string; tone?: "safe" | "danger" | "warn" | "violet" | "neutral"; icon?: ReactNode }) {
  const tones = {
    safe: "border-mint/30 bg-mint/10 text-mint",
    danger: "border-red-400/30 bg-red-500/10 text-red-200",
    warn: "border-amber/30 bg-amber/10 text-amber",
    violet: "border-violet/30 bg-violet/10 text-violet-200",
    neutral: "border-white/10 bg-white/[0.04] text-white"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border px-4 py-3 ${tones[tone]}`}
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold tracking-[-0.01em] text-white">{value}</div>
    </motion.div>
  );
}
