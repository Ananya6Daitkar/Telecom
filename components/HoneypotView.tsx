"use client";

import { motion } from "framer-motion";
import { BadgeDollarSign, Clock3, Fingerprint, Loader2, Send, Siren, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useAegisStore } from "@/lib/store";
import { MetricPill } from "./MetricPill";

export function HoneypotView() {
  const messages = useAegisStore((s) => s.honeypotMessages);
  const extracted = useAegisStore((s) => s.extractedScamData);
  const economics = useAegisStore((s) => s.economics);
  const tick = useAegisStore((s) => s.tickEconomics);
  const sendHoneypotStatement = useAegisStore((s) => s.sendHoneypotStatement);
  const provider = useAegisStore((s) => s.honeypotProvider);
  const providerError = useAegisStore((s) => s.honeypotError);
  const isThinking = useAegisStore((s) => s.isHoneypotThinking);
  const [statement, setStatement] = useState("");

  useEffect(() => {
    const id = window.setInterval(tick, 7000);
    return () => window.clearInterval(id);
  }, [tick]);

  const insights = [
    { label: "Claimed identity", value: extracted.claimedIdentity ?? "Analyzing", icon: <Fingerprint className="h-4 w-4" /> },
    { label: "Payment method", value: extracted.paymentMethod ?? "Pending", icon: <BadgeDollarSign className="h-4 w-4" /> },
    { label: "Amount requested", value: extracted.amountRequested ? `$${extracted.amountRequested.toLocaleString()}` : "Unknown", icon: <BadgeDollarSign className="h-4 w-4" /> },
    { label: "Urgency", value: extracted.urgencyTactic ?? "Low", icon: <Siren className="h-4 w-4" /> }
  ];

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto grid max-w-7xl gap-5 px-4 pb-32 pt-24 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">Honeypot Live</div>
            <h2 className="mt-1 text-2xl font-semibold">Margaret is wasting the operator’s time</h2>
          </div>
          <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${provider === "groq" ? "border-mint/25 bg-mint/10 text-mint" : provider === "fallback" ? "border-amber/30 bg-amber/10 text-amber" : "border-coral/25 bg-coral/10 text-coral"}`}>
            {provider === "groq" ? <Wifi className="h-3.5 w-3.5" /> : provider === "fallback" ? <WifiOff className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
            {provider === "groq" ? "Groq live" : provider === "fallback" ? "fallback active" : "live trap"}
          </div>
        </div>

        <div className="h-[480px] space-y-4 overflow-y-auto rounded-lg border border-white/10 bg-black/25 p-4 no-scrollbar">
          {messages.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-white/45">
              <div>
                <div className="mx-auto mb-4 h-16 w-16 animate-pulse rounded-full border border-white/10 bg-white/[0.04]" />
                Honeypot standing by.
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={`${message.role}-${index}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`flex ${message.role === "scammer" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[78%] rounded-lg border p-4 text-sm leading-6 ${message.role === "scammer" ? "border-red-400/20 bg-red-500/10 text-red-50" : "border-cyan/20 bg-cyan/10 text-cyan-50"}`}>
                  <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-white/40">{message.role === "scammer" ? "Operator" : "Margaret"}</div>
                  {message.text}
                </div>
              </motion.div>
            ))
          )}
          {isThinking ? (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-lg border border-cyan/20 bg-cyan/10 p-4 text-sm text-cyan-50">
                <Loader2 className="h-4 w-4 animate-spin" />
                Margaret is thinking...
              </div>
            </div>
          ) : null}
        </div>

        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            const next = statement;
            setStatement("");
            void sendHoneypotStatement(next);
          }}
        >
          <input
            value={statement}
            onChange={(event) => setStatement(event.target.value)}
            placeholder="Type the scammer's next line..."
            className="min-h-11 flex-1 rounded-lg border border-white/10 bg-black/35 px-4 text-sm text-white placeholder:text-white/35"
          />
          <button type="submit" disabled={!statement.trim() || isThinking} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-coral/30 bg-coral/10 px-4 text-sm font-medium text-coral transition hover:bg-coral/15 disabled:cursor-not-allowed disabled:opacity-50">
            {isThinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </button>
        </form>
        {providerError ? <div className="mt-3 rounded-lg border border-amber/25 bg-amber/10 p-3 text-xs text-amber">Groq fallback reason: {providerError}</div> : null}
      </div>

      <div className="grid content-start gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-[0.22em] text-white/45">Extracted Intelligence</div>
          <div className="mt-4 grid gap-3">
            {insights.map((item, index) => (
              <motion.div key={item.label} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + index * 0.12 }} className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/40">{item.icon}{item.label}</div>
                <div className="mt-2 text-lg font-semibold">{item.value}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <MetricPill label="Minutes wasted" value={economics.minutesWasted.toLocaleString()} tone="violet" />
          <MetricPill label="Dollars saved" value={`$${economics.dollarsSaved.toLocaleString()}`} tone="safe" />
          <MetricPill label="Operators tagged" value={economics.operatorsFingerprinted.toLocaleString()} tone="warn" />
        </div>
      </div>
    </motion.section>
  );
}
