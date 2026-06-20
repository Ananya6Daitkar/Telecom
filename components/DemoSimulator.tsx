"use client";

import { motion } from "framer-motion";
import { Building2, Mic2, Phone, Radar, ShieldAlert } from "lucide-react";
import type { Scenario } from "@/lib/types";
import { useAegisStore } from "@/lib/store";

const scenarios: Array<{ id: Exclude<Scenario, "idle">; label: string; tone: string; icon: React.ReactNode }> = [
  { id: "normal", label: "Normal call", tone: "border-mint/45 hover:bg-mint/10", icon: <Phone className="h-4 w-4" /> },
  { id: "cloned", label: "Cloned voice", tone: "border-amber/45 hover:bg-amber/10", icon: <Mic2 className="h-4 w-4" /> },
  { id: "scam", label: "Active scam", tone: "border-red-400/50 hover:bg-red-500/10", icon: <ShieldAlert className="h-4 w-4" /> },
  { id: "returning", label: "Returning operator", tone: "border-red-700 hover:bg-red-950/45", icon: <Radar className="h-4 w-4" /> },
  { id: "ceo_fake", label: "CEO deepfake", tone: "border-violet/50 hover:bg-violet/10", icon: <Building2 className="h-4 w-4" /> }
];

export function DemoSimulator() {
  const scenario = useAegisStore((s) => s.scenario);
  const setScenario = useAegisStore((s) => s.setScenario);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="relative z-20 mx-3 mb-28 mt-4 rounded-xl border border-white/10 bg-black/80 p-2 shadow-2xl backdrop-blur-2xl sm:fixed sm:bottom-4 sm:left-4 sm:right-4 sm:z-40 sm:mx-auto sm:mb-0 sm:mt-0 sm:max-w-6xl"
      aria-label="Demo simulator scenarios"
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {scenarios.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setScenario(item.id)}
            className={`flex h-12 min-w-0 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium text-white/85 transition duration-200 ${item.tone} ${scenario === item.id ? "bg-white/[0.08] text-white" : "bg-white/[0.025]"}`}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
