"use client";

import { motion } from "framer-motion";
import { Activity, AlertTriangle, Brain, ScanLine } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { useAegisStore } from "@/lib/store";

const timelineCopy = [
  "Voice stream acquired",
  "Breathing and micro-pause pattern checked",
  "Caller identity and consent ledger compared",
  "Scam language pressure model evaluated",
  "Trust signal recalculated"
];

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function ReasoningPanel() {
  const voice = useAegisStore((s) => s.voiceAuthScore);
  const intent = useAegisStore((s) => s.scamIntentScore);
  const radar = useAegisStore((s) => s.emotionalRadar);
  const reasoning = useAegisStore((s) => s.reasoning);
  const anomaly = useAegisStore((s) => s.voiceAnomalyReport);
  const scenario = useAegisStore((s) => s.scenario);
  const setScreen = useAegisStore((s) => s.setScreen);
  const data = Object.entries(radar).map(([axis, value]) => ({ axis, value }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto grid max-w-7xl gap-5 px-4 pb-32 pt-24 lg:grid-cols-[0.9fr_1.1fr]"
    >
      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg border border-cyan/20 bg-cyan/10">
            <Brain className="h-5 w-5 text-cyan" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">AI Investigation Timeline</div>
            <h2 className="text-2xl font-semibold">Trust collapse explained</h2>
          </div>
        </div>

        <div className="mt-7 space-y-3">
          {timelineCopy.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.12 }}
              className="grid grid-cols-[64px_1fr] items-center gap-4 rounded-lg border border-white/10 bg-black/20 p-3"
            >
              <span className="font-mono text-sm text-white/45">00:0{index + 1}</span>
              <span className="text-sm text-white/82">{item}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {reasoning.slice(0, 4).map((item) => (
            <div key={item} className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3 text-sm text-white/75">
              <ScanLine className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5">
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">Scammer Genome</div>
              <h2 className="mt-1 text-2xl font-semibold">Manipulation DNA profile</h2>
            </div>
            <Activity className="h-5 w-5 text-coral" />
          </div>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data}>
                <PolarGrid stroke="rgba(255,255,255,0.12)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }} />
                <Radar dataKey="value" stroke="#FF5A66" fill="#FF5A66" fillOpacity={0.28} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-3 flex justify-between text-sm"><span className="text-white/50">Voice authenticity</span><span>{pct(voice)}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: pct(voice) }} className="h-full rounded-full bg-cyan" /></div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-3 flex justify-between text-sm"><span className="text-white/50">Scam intent</span><span>{pct(intent)}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: pct(intent) }} className="h-full rounded-full bg-coral" /></div>
          </div>
        </div>

        <div className="rounded-xl border border-amber/20 bg-amber/10 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-amber"><AlertTriangle className="h-4 w-4" /> Voice anomaly report</div>
          <div className="mt-3 grid gap-2 text-sm text-white/75">
            {(anomaly?.anomalySummary.length ? anomaly.anomalySummary : scenario === "normal" ? ["No anomaly detected. Ledger, voice, and intent agree."] : ["Synthetic indicators remain below intervention threshold."]).map((item) => (
              <div key={item} className="rounded-md border border-white/10 bg-black/20 p-3">{item}</div>
            ))}
          </div>
        </div>

        <button type="button" onClick={() => setScreen("call")} className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75 transition hover:bg-white/[0.08]">
          Return to live call
        </button>
      </div>
    </motion.section>
  );
}
