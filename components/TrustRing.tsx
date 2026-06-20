"use client";

import { motion } from "framer-motion";
import { PhoneCall } from "lucide-react";
import { useMemo } from "react";
import type { Scenario } from "@/lib/types";

export function TrustRing({ score, color, scenario, audioLevel }: { score: number; color: string; scenario: Scenario; audioLevel: number }) {
  const circumference = 2 * Math.PI * 116;
  const offset = circumference * (1 - score);
  const danger = score < 0.45;
  const bars = useMemo(() => Array.from({ length: 42 }, (_, i) => i), []);

  return (
    <div className="relative grid min-h-[380px] place-items-center sm:min-h-[520px]">
      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-end justify-center gap-1 opacity-40">
        {bars.map((bar) => (
          <motion.span
            key={bar}
            animate={{ height: 24 + Math.sin(bar + audioLevel * 10) * 14 + audioLevel * 84 }}
            transition={{ duration: 0.45, delay: (bar % 8) * 0.025 }}
            className="w-1 rounded-full bg-cyan/50"
          />
        ))}
      </div>

      <motion.div
        className="relative"
        animate={{ scale: danger ? [1, 1.035, 1] : [1, 1.015, 1] }}
        transition={{ duration: danger ? 0.6 : 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-8 rounded-full blur-3xl" style={{ background: color, opacity: danger ? 0.24 : 0.13 }} />
        <svg width="330" height="330" viewBox="0 0 330 330" className="relative overflow-visible sm:h-[430px] sm:w-[430px]">
          <defs>
            <filter id="ringGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="165" cy="165" r="116" stroke="rgba(255,255,255,0.08)" strokeWidth="14" fill="none" />
          <motion.circle
            cx="165"
            cy="165"
            r="116"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
            filter="url(#ringGlow)"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset, stroke: color }}
            transition={{ duration: scenario === "cloned" ? 1.8 : 0.9, ease: [0.22, 1, 0.36, 1] }}
            transform="rotate(-90 165 165)"
          />
          {danger
            ? [48, 122, 210, 288].map((angle) => (
                <motion.line
                  key={angle}
                  x1="165"
                  y1="49"
                  x2="165"
                  y2="28"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="2"
                  transform={`rotate(${angle} 165 165)`}
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 1, pathLength: 1 }}
                  transition={{ duration: 0.45 }}
                />
              ))
            : null}
        </svg>

        <div className="absolute inset-0 grid place-items-center">
          <div className="grid h-44 w-44 place-items-center rounded-full border border-white/10 bg-black/40 text-center backdrop-blur-xl sm:h-56 sm:w-56">
            <div>
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/[0.06]">
                <PhoneCall className="h-5 w-5 text-white/80" />
              </div>
              <div className="text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">{Math.round(score * 100)}%</div>
              <div className="mt-2 font-mono text-xs uppercase tracking-[0.22em] text-white/45">trust signal</div>
              <div className="mt-3 font-mono text-sm text-white/65">00:0{scenario === "idle" ? 0 : 7}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
