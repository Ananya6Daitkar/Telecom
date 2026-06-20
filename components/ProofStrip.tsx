"use client";

import { Download, LockKeyhole, ShieldAlert, Volume2, Wifi } from "lucide-react";
import benchmark from "@/public/benchmark/audio-deepfake-subset.json";
import type { HoneypotProvider } from "@/lib/types";

const tone = "rounded-lg border border-white/10 bg-black/25 p-3";

export function ProofStrip({ honeypotProvider, onOpenProof }: { honeypotProvider: HoneypotProvider; onOpenProof: () => void }) {
  return (
    <section className="mt-5 rounded-xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl" aria-label="Judge proof summary">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-white/45">Judge-visible proof</div>
          <div className="mt-1 text-sm text-white/60">Live features are labeled separately from heuristic, simulated, and seeded demo paths.</div>
        </div>
        <button type="button" onClick={onOpenProof} className="shrink-0 rounded-lg border border-cyan/25 bg-cyan/10 px-3 py-2 text-sm text-cyan transition hover:bg-cyan/15">
          Proof
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <div className={tone}>
          <div className="flex items-center gap-2 text-xs text-mint"><Volume2 className="h-4 w-4" /> Live</div>
          <div className="mt-1 text-sm font-medium">Guardian TTS intervention</div>
        </div>
        <div className={tone}>
          <div className="flex items-center gap-2 text-xs text-mint"><Wifi className="h-4 w-4" /> {honeypotProvider === "groq" ? "Groq live" : "Labeled"}</div>
          <div className="mt-1 text-sm font-medium">Honeypot provider: {honeypotProvider}</div>
        </div>
        <div className={tone}>
          <div className="flex items-center gap-2 text-xs text-cyan"><LockKeyhole className="h-4 w-4" /> Live</div>
          <div className="mt-1 text-sm font-medium">Privacy + compliance gates</div>
        </div>
        <div className={tone}>
          <div className="flex items-center gap-2 text-xs text-cyan"><Download className="h-4 w-4" /> Live</div>
          <div className="mt-1 text-sm font-medium">Exportable PDF audit</div>
        </div>
        <div className={tone}>
          <div className="flex items-center gap-2 text-xs text-mint"><ShieldAlert className="h-4 w-4" /> Real subset</div>
          <div className="mt-1 text-sm font-medium">{Math.round(benchmark.metrics.accuracy * 1000) / 10}% accuracy / {Math.round(benchmark.metrics.eer * 1000) / 10}% EER</div>
        </div>
      </div>
    </section>
  );
}
