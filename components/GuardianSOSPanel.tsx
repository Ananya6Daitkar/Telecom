"use client";

import { motion } from "framer-motion";
import { CheckCircle2, PhoneCall, ShieldAlert, UserRoundCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import type { GuardianOutcome, GuardianStatus } from "@/hooks/useGuardianAlert";
import { injectCallWarning } from "@/lib/voiceInjection";

type Props = {
  status: GuardianStatus;
  guardianName?: string;
  contextLine?: string;
  onResolve: (outcome: GuardianOutcome) => void;
};

export function GuardianSOSPanel({ status, guardianName = "Priya (Daughter)", contextLine = "High-risk voice and payment pattern detected.", onResolve }: Props) {
  const previousStatus = useRef<GuardianStatus>("idle");

  useEffect(() => {
    if (status === "alert" && previousStatus.current !== "alert") {
      injectCallWarning();
    }
    previousStatus.current = status;
  }, [status]);

  const isAlert = status === "alert";
  const isSafe = status === "resolved-safe";
  const isHelp = status === "resolved-help";

  return (
    <motion.aside
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl border p-5 backdrop-blur-xl transition duration-500 ${
        isAlert
          ? "border-red-400/35 bg-red-500/10 shadow-glow"
          : isSafe
            ? "border-mint/25 bg-mint/10"
            : isHelp
              ? "border-amber/30 bg-amber/10"
              : "border-white/10 bg-white/[0.035]"
      }`}
      aria-live="polite"
    >
      {isAlert ? <div className="absolute right-4 top-4 h-3 w-3 rounded-full bg-red-400"><span className="absolute inset-0 animate-ping rounded-full bg-red-400" /></div> : null}

      <div className="flex items-center gap-4">
        <motion.div
          animate={isAlert ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={isAlert ? { duration: 0.8, repeat: Infinity } : undefined}
          className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl border ${
            isAlert ? "border-red-300/35 bg-red-500/15" : isSafe ? "border-mint/25 bg-mint/10" : isHelp ? "border-amber/30 bg-amber/10" : "border-cyan/20 bg-cyan/10"
          }`}
        >
          {isSafe ? <CheckCircle2 className="h-8 w-8 text-mint" /> : isHelp ? <PhoneCall className="h-8 w-8 text-amber" /> : isAlert ? <ShieldAlert className="h-8 w-8 text-red-100" /> : <UserRoundCheck className="h-8 w-8 text-cyan" />}
        </motion.div>

        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.22em] text-white/45">Guardian Phone</div>
          <h3 className="mt-1 truncate text-xl font-semibold">{guardianName}</h3>
          <p className={`mt-1 text-sm ${isAlert ? "text-red-100/80" : "text-white/55"}`}>
            {isSafe
              ? "Guardian confirmed she is fine."
              : isHelp
                ? "Connecting guardian call now..."
                : isAlert
                  ? contextLine
                  : "Monitoring active"}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-white/10 bg-black/25 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-white/55">Intervention status</span>
          <span className={`rounded-full border px-3 py-1 text-xs capitalize ${
            isAlert ? "border-red-400/30 bg-red-500/10 text-red-100" : isSafe ? "border-mint/25 bg-mint/10 text-mint" : isHelp ? "border-amber/30 bg-amber/10 text-amber" : "border-white/10 bg-white/[0.04] text-white/55"
          }`}>
            {status.replace("-", " ")}
          </span>
        </div>
      </div>

      {isAlert ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onResolve("safe")}
            className="rounded-lg border border-mint/25 bg-mint/10 px-4 py-3 text-sm font-medium text-mint transition hover:bg-mint/15"
          >
            She's fine
          </button>
          <button
            type="button"
            onClick={() => onResolve("help")}
            className="rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-sm font-medium text-amber transition hover:bg-amber/15"
          >
            Call her now
          </button>
        </div>
      ) : null}
    </motion.aside>
  );
}
