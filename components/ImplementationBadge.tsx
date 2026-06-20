"use client";

import type { ImplementationLevel } from "@/lib/types";

const tone: Record<ImplementationLevel, string> = {
  live: "border-mint/25 bg-mint/10 text-mint",
  heuristic: "border-cyan/25 bg-cyan/10 text-cyan",
  simulated: "border-amber/30 bg-amber/10 text-amber",
  seeded: "border-violet/30 bg-violet/10 text-violet-200"
};

const label: Record<ImplementationLevel, string> = {
  live: "Live",
  heuristic: "Heuristic",
  simulated: "Simulated",
  seeded: "Seeded demo"
};

export function ImplementationBadge({ level, detail }: { level: ImplementationLevel; detail?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${tone[level]}`} title={detail}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label[level]}
    </span>
  );
}
