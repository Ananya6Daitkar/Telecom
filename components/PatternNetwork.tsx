"use client";

import { motion } from "framer-motion";
import { Building, DatabaseZap, Globe2, Share2 } from "lucide-react";
import { useAegisStore } from "@/lib/store";
import { ImplementationBadge } from "./ImplementationBadge";
import { MetricPill } from "./MetricPill";

const nodes = [
  { x: 20, y: 45, label: "Bank" },
  { x: 42, y: 25, label: "Carrier" },
  { x: 68, y: 42, label: "VoxHalo" },
  { x: 52, y: 68, label: "Gov CERT" },
  { x: 82, y: 66, label: "Enterprise" }
];

export function PatternNetwork() {
  const economics = useAegisStore((s) => s.economics);
  const db = useAegisStore((s) => s.fingerprintDB);

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl px-4 pb-32 pt-24">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.24em] text-white/45">Global Threat Network</div>
        <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">Seeded threat intelligence network.</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <ImplementationBadge level="seeded" detail="Operator fingerprints are local seeded demo data." />
          <ImplementationBadge level="simulated" detail="Economics counters are an impact simulator." />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricPill label="Calls intercepted" value={economics.callsIntercepted.toLocaleString()} tone="safe" icon={<Globe2 className="h-3.5 w-3.5" />} />
        <MetricPill label="Operators" value={economics.operatorsFingerprinted.toLocaleString()} tone="warn" icon={<DatabaseZap className="h-3.5 w-3.5" />} />
        <MetricPill label="Minutes wasted" value={economics.minutesWasted.toLocaleString()} tone="violet" icon={<Share2 className="h-3.5 w-3.5" />} />
        <MetricPill label="Dollars saved" value={`$${economics.dollarsSaved.toLocaleString()}`} tone="safe" icon={<Building className="h-3.5 w-3.5" />} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="relative min-h-[430px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_50%,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_72%_58%,rgba(239,68,68,0.14),transparent_28%)]" />
          <svg viewBox="0 0 100 80" className="relative h-full min-h-[390px] w-full">
            {nodes.slice(1).map((node, index) => (
              <motion.line
                key={node.label}
                x1={nodes[0].x}
                y1={nodes[0].y}
                x2={node.x}
                y2={node.y}
                stroke="rgba(56,189,248,0.35)"
                strokeWidth="0.35"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.4, delay: index * 0.18, repeat: Infinity, repeatType: "reverse", repeatDelay: 1.8 }}
              />
            ))}
            {nodes.map((node, index) => (
              <g key={node.label}>
                <motion.circle cx={node.x} cy={node.y} r={index === 2 ? 6 : 4} fill={index === 2 ? "#EF4444" : "#38BDF8"} initial={{ scale: 0.8 }} animate={{ scale: [0.9, 1.18, 0.9] }} transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.22 }} />
                <text x={node.x} y={node.y + 9} textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="3">{node.label}</text>
              </g>
            ))}
          </svg>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">Fingerprint Table</div>
              <h3 className="mt-1 text-xl font-semibold">Known operator signatures</h3>
            </div>
            <div className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs text-cyan">{economics.patternsShared.toLocaleString()} shared</div>
          </div>
          <div className="space-y-3">
            {db.map((record) => (
              <div key={record.id} className="rounded-lg border border-white/10 bg-black/24 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-lg font-semibold">{record.shortId}</div>
                    <div className="text-sm text-white/55">{record.dominantTactic}</div>
                  </div>
                  <div className="rounded-full border border-mint/20 bg-mint/10 px-2.5 py-1 text-xs text-mint">{record.status}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {record.signaturePhrases.map((phrase) => (
                    <span key={phrase} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/60">{phrase}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
