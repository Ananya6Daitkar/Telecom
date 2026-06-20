"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Network } from "lucide-react";
import type { FingerprintRecord } from "@/lib/types";

export function FingerprintAlert({ match }: { match: FingerprintRecord | null }) {
  return (
    <AnimatePresence>
      {match ? (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed left-4 right-4 top-4 z-50 mx-auto max-w-5xl overflow-hidden rounded-lg border border-red-400/35 bg-red-950/80 shadow-glow backdrop-blur-2xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.35),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.18),transparent_30%)]" />
          <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-lg border border-red-300/25 bg-red-500/15">
                <AlertTriangle className="h-6 w-6 text-red-200" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-red-200/70">Returning Operator</div>
                <div className="mt-1 text-2xl font-semibold text-white">{match.shortId}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center sm:min-w-[430px]">
              <div className="rounded-md border border-white/10 bg-white/[0.05] p-3">
                <div className="text-xl font-semibold">{match.callCount}</div>
                <div className="text-[11px] text-white/50">known scams</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/[0.05] p-3">
                <div className="text-xl font-semibold">6 mo</div>
                <div className="text-[11px] text-white/50">active</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/[0.05] p-3">
                <div className="flex items-center justify-center gap-2 text-xl font-semibold"><Network className="h-4 w-4" /> 0.78</div>
                <div className="text-[11px] text-white/50">genome match</div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
