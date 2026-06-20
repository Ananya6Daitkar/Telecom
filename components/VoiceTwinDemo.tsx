"use client";

import { motion } from "framer-motion";
import { AudioLines, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { useRef, useState } from "react";
import { useAegisStore } from "@/lib/store";

const stages = [
  "Recording voice sample",
  "Generating AI clone",
  "Running attack",
  "Detected in 1.8s"
];

export function VoiceTwinDemo() {
  const [active, setActive] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const realAudio = useRef<HTMLAudioElement | null>(null);
  const clonedAudio = useRef<HTMLAudioElement | null>(null);
  const setScenario = useAegisStore((s) => s.setScenario);

  function runDemo() {
    setIsRunning(true);
    setActive(0);
    realAudio.current?.pause();
    clonedAudio.current?.pause();
    if (realAudio.current) realAudio.current.currentTime = 0;
    if (clonedAudio.current) clonedAudio.current.currentTime = 0;
    void realAudio.current?.play().catch(() => undefined);

    window.setTimeout(() => {
      setActive(1);
      realAudio.current?.pause();
    }, 1800);

    window.setTimeout(() => {
      setActive(2);
      if (clonedAudio.current) clonedAudio.current.currentTime = 0;
      void clonedAudio.current?.play().catch(() => undefined);
    }, 3200);

    window.setTimeout(() => {
      setActive(3);
      setScenario("cloned");
      setIsRunning(false);
    }, 5000);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-white/45">Voice Twin Demo</div>
          <h3 className="mt-1 text-xl font-semibold">Your voice, cloned, caught.</h3>
        </div>
        <button type="button" onClick={runDemo} disabled={isRunning} className="rounded-lg border border-coral/30 bg-coral/10 px-4 py-2 text-sm text-coral transition hover:bg-coral/15 disabled:cursor-not-allowed disabled:opacity-60">
          {isRunning ? "Running..." : "Run attack"}
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        {stages.map((stage, index) => {
          const done = active > index || active === 3;
          const current = active === index && active !== 3;
          return (
            <motion.div key={stage} animate={{ opacity: active >= index || index === 0 ? 1 : 0.35 }} className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-3">
              <div className={`grid h-9 w-9 place-items-center rounded-lg border ${done ? "border-mint/25 bg-mint/10 text-mint" : current ? "border-cyan/25 bg-cyan/10 text-cyan" : "border-white/10 bg-white/[0.04] text-white/35"}`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : current ? <Loader2 className="h-4 w-4 animate-spin" /> : <AudioLines className="h-4 w-4" />}
              </div>
              <div className="flex-1 text-sm">{stage}</div>
              {stage === "Detected in 1.8s" ? <ShieldAlert className="h-4 w-4 text-red-200" /> : null}
            </motion.div>
          );
        })}
      </div>

      <audio ref={realAudio} preload="metadata" src="/demo-audio/real-voice.mp4" />
      <audio ref={clonedAudio} preload="metadata" src="/demo-audio/cloned-voice.mpeg" />
    </div>
  );
}
