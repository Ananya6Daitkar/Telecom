"use client";

import { motion } from "framer-motion";
import { AlertOctagon, AudioLines, UserRound } from "lucide-react";
import { ceoDeepfakeAlert } from "@/lib/diarization";
import { useAegisStore } from "@/lib/store";
import { ImplementationBadge } from "./ImplementationBadge";

export function DiarizationView() {
  const speakers = useAegisStore((s) => s.speakers);

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl px-4 pb-32 pt-24">
      <div className="rounded-xl border border-red-400/30 bg-red-950/30 p-4 text-red-50 shadow-glow">
        <div className="flex items-center gap-3"><AlertOctagon className="h-5 w-5" /><span className="font-medium">Do not authorize wire transfer</span><span className="text-red-100/65">{ceoDeepfakeAlert}</span></div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/45">AI Forensics Lab</div>
          <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">CEO deepfake intervention workflow.</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/58">A simulated enterprise forensics view showing how participant risk would be presented before a wire transfer leaves approval.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ImplementationBadge level="simulated" detail="Speaker rows are seeded for the CEO-deepfake demo." />
            <ImplementationBadge level="heuristic" detail="Trust values are scenario-driven, not live diarization." />
          </div>
        </div>

        <div className="space-y-4">
          {speakers.map((speaker, index) => (
            <motion.div
              key={speaker.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.14 }}
              className={`rounded-xl border p-5 backdrop-blur-xl ${speaker.isSynthetic ? "border-red-400/40 bg-red-500/10 shadow-glow" : "border-white/10 bg-white/[0.035]"}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className={`grid h-14 w-14 place-items-center rounded-lg border ${speaker.isSynthetic ? "border-red-300/30 bg-red-500/15" : "border-cyan/20 bg-cyan/10"}`}>
                    <UserRound className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{speaker.label}</div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-white/45"><AudioLines className="h-4 w-4" /> {speaker.speakingTime}s speaking time</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md border border-white/10 bg-black/20 p-3"><div className="font-semibold">{Math.round(speaker.trustScore * 100)}%</div><div className="text-[11px] text-white/45">trust</div></div>
                  <div className="rounded-md border border-white/10 bg-black/20 p-3"><div className="font-semibold">{Math.round(speaker.voiceAuthScore * 100)}%</div><div className="text-[11px] text-white/45">voice</div></div>
                  <div className={`rounded-md border p-3 ${speaker.isSynthetic ? "border-red-300/25 bg-red-500/15 text-red-100" : "border-mint/20 bg-mint/10 text-mint"}`}><div className="font-semibold">{speaker.isSynthetic ? "Synthetic" : "Human"}</div><div className="text-[11px] opacity-65">status</div></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
