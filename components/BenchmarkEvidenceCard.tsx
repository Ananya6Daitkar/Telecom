"use client";

import { BarChart3, Database, Gauge, GitBranch } from "lucide-react";
import benchmark from "@/public/benchmark/audio-deepfake-subset.json";

function pct(value: number) {
  return `${Math.round(value * 1000) / 10}%`;
}

export function BenchmarkEvidenceCard() {
  const metrics = benchmark.metrics;

  return (
    <div className="rounded-xl border border-mint/20 bg-mint/10 p-5 backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-mint">
            <Database className="h-4 w-4" />
            Real Subset Evaluation
          </div>
          <h3 className="mt-2 text-2xl font-semibold">Audio Deepfake Detection dataset</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/62">
            Local held-out benchmark on your provided archive: {benchmark.subset.bonafide} bonafide and {benchmark.subset.spoof} spoof samples from real_samples plus generated-voice folders. This is a lightweight acoustic-feature baseline, not a trained AASIST/RawNet checkpoint.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/55">
          {benchmark.metrics.evaluation}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-black/25 p-4">
          <div className="flex items-center gap-2 text-xs text-white/45"><Gauge className="h-4 w-4" /> Accuracy</div>
          <div className="mt-2 text-3xl font-semibold">{pct(metrics.accuracy)}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/25 p-4">
          <div className="flex items-center gap-2 text-xs text-white/45"><BarChart3 className="h-4 w-4" /> EER</div>
          <div className="mt-2 text-3xl font-semibold">{pct(metrics.eer)}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/25 p-4">
          <div className="flex items-center gap-2 text-xs text-white/45"><GitBranch className="h-4 w-4" /> Confusion</div>
          <div className="mt-2 text-sm text-white/75">TP {metrics.confusion.trueSpoof} / TN {metrics.confusion.trueBonafide}</div>
          <div className="mt-1 text-sm text-white/45">FP {metrics.confusion.falseSpoof} / FN {metrics.confusion.falseBonafide}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/25 p-4">
          <div className="text-xs text-white/45">Subset split</div>
          <div className="mt-2 text-sm text-white/75">Train {benchmark.subset.train} / Test {benchmark.subset.test}</div>
          <div className="mt-1 text-sm text-white/45">Skipped {benchmark.subset.skipped} unsupported WAVs</div>
        </div>
      </div>
    </div>
  );
}
