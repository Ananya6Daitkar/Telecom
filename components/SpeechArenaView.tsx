"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Cpu, GitBranch, ShieldAlert } from "lucide-react";
import { arenaConsensus } from "@/lib/deepfake-arena";
import { useAegisStore } from "@/lib/store";
import { BenchmarkEvidenceCard } from "./BenchmarkEvidenceCard";
import { ImplementationBadge } from "./ImplementationBadge";

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function SpeechArenaView() {
  const scores = useAegisStore((s) => s.arenaScores);
  const scenario = useAegisStore((s) => s.scenario);
  const consensus = arenaConsensus(scores);

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl px-4 pb-32 pt-24">
      <div className="mb-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/45">Speech Deepfake Arena</div>
          <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">Multiple detectors vote before trust collapses.</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/58">
            Arena-style visualization inspired by Speech DF Arena model families. Below it now includes a real held-out subset evaluation from your provided Audio Deepfake Detection dataset.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ImplementationBadge level="simulated" detail="Model-family scores are deterministic demo outputs, not checkpoint inference." />
            <ImplementationBadge level="heuristic" detail="Consensus uses local math over active scenario risk." />
          </div>
        </div>

        <div className="rounded-xl border border-red-400/25 bg-red-500/10 p-5 shadow-glow backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-red-100/60">Arena Consensus</div>
              <div className="mt-2 text-3xl font-semibold capitalize">{consensus.label}</div>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-lg border border-red-300/25 bg-red-500/15">
              <ShieldAlert className="h-7 w-7 text-red-100" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="text-2xl font-semibold">{consensus.spoofVotes}/8</div>
              <div className="text-xs text-white/45">spoof votes</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="text-2xl font-semibold">{pct(consensus.averageSpoof)}</div>
              <div className="text-xs text-white/45">avg spoof</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="text-2xl font-semibold">{scenario.replace("_", " ")}</div>
              <div className="text-xs text-white/45">scenario</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {scores.map((score, index) => (
          <motion.div
            key={score.model}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-lg border border-cyan/20 bg-cyan/10">
                  {score.family === "self-supervised" ? <BrainCircuit className="h-5 w-5 text-cyan" /> : score.family === "graph attention" ? <GitBranch className="h-5 w-5 text-cyan" /> : <Cpu className="h-5 w-5 text-cyan" />}
                </div>
                <div>
                  <div className="text-lg font-semibold">{score.model}</div>
                  <div className="text-sm text-white/45">{score.family}</div>
                </div>
              </div>
              <div className={`rounded-full border px-3 py-1 text-xs capitalize ${score.verdict === "spoof" ? "border-red-400/30 bg-red-500/10 text-red-100" : score.verdict === "review" ? "border-amber/30 bg-amber/10 text-amber" : "border-mint/25 bg-mint/10 text-mint"}`}>
                {score.verdict}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm"><span className="text-white/50">Spoof probability</span><span>{pct(score.spoofProbability)}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div initial={{ width: 0 }} animate={{ width: pct(score.spoofProbability) }} className="h-full rounded-full bg-coral" />
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm"><span className="text-white/50">Confidence</span><span>{pct(score.confidence)}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div initial={{ width: 0 }} animate={{ width: pct(score.confidence) }} className="h-full rounded-full bg-cyan" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-5">
        <BenchmarkEvidenceCard />
      </div>
    </motion.section>
  );
}
