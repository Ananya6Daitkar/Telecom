"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { ImplementationBadge } from "./ImplementationBadge";

const attacks = [
  "XTTS voice clone",
  "Caller ID spoof",
  "IRS authority script",
  "Emergency family scam",
  "Low-stress synthetic",
  "Payment pivot",
  "Isolation pressure",
  "CEO wire transfer"
];

export function RedTeamDashboard() {
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl px-4 pb-32 pt-24">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/45">Red Team Harness</div>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">8 adversarial attacks replayed.</h2>
          <div className="mt-4">
            <ImplementationBadge level="simulated" detail="Cards are attack-vector rehearsal states, not an automated exploit runner." />
          </div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="rounded-full border border-mint/25 bg-mint/10 px-4 py-2 text-sm text-mint">
          All attacks contained in simulation
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {attacks.map((attack, index) => (
          <motion.div key={attack} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.12 }} className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg border border-red-400/20 bg-red-500/10"><ShieldAlert className="h-5 w-5 text-red-200" /></div>
                <div>
                  <div className="font-medium">{attack}</div>
                  <div className="text-sm text-white/45">attack vector #{index + 1}</div>
                </div>
              </div>
              <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.2 + index * 0.08 }} className="text-white/45">
                <Loader2 className="h-5 w-5 animate-spin" />
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 + index * 0.08 }} className="flex items-center gap-2 rounded-full border border-mint/25 bg-mint/10 px-3 py-1 text-xs text-mint">
                <CheckCircle2 className="h-3.5 w-3.5" /> detected
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
