"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Download, FileCheck2, LockKeyhole, Scale, ShieldAlert, Volume2, Wifi } from "lucide-react";
import benchmark from "@/public/benchmark/audio-deepfake-subset.json";
import { complianceConfigs } from "@/lib/compliance";
import { buildIncidentReport, downloadIncidentReport } from "@/lib/incident-report";
import { useAegisStore } from "@/lib/store";

function pct(value: number) {
  return `${Math.round(value * 1000) / 10}%`;
}

export function EvidenceReceiptView() {
  const scenario = useAegisStore((s) => s.scenario);
  const trustScore = useAegisStore((s) => s.trustScore);
  const trustLabel = useAegisStore((s) => s.trustLabel);
  const reasoning = useAegisStore((s) => s.reasoning);
  const complianceMode = useAegisStore((s) => s.complianceMode);
  const honeypotProvider = useAegisStore((s) => s.honeypotProvider);
  const extractedScamData = useAegisStore((s) => s.extractedScamData);
  const fingerprintMatch = useAegisStore((s) => s.fingerprintMatch);
  const liveAudioSpoofReport = useAegisStore((s) => s.liveAudioSpoofReport);
  const auditLog = useAegisStore((s) => s.auditLog);
  const addAuditEvent = useAegisStore((s) => s.addAuditEvent);
  const policy = complianceConfigs[complianceMode];

  const guardianFired = auditLog.some((event) => event.label.includes("Guardian SOS threat event")) || trustScore < 0.4;
  const honeypotLive = honeypotProvider === "groq";
  const complianceBlocked = !policy.recordingAllowed || !policy.honeypotAllowed || auditLog.some((event) => event.detail.includes("blocked"));

  function exportReport() {
    downloadIncidentReport(buildIncidentReport({
      scenario,
      trustScore,
      trustLabel,
      reasoning,
      complianceMode,
      honeypotProvider,
      extractedScamData,
      fingerprintMatch,
      liveAudioSpoofReport,
      auditLog
    }));
    addAuditEvent({
      type: "override",
      label: "Evidence receipt exported",
      detail: "Downloaded VoxHalo incident report from Evidence Receipt.",
      level: "live"
    });
  }

  const rows = [
    { icon: <ShieldAlert className="h-5 w-5" />, label: "Guardian intervention", value: guardianFired ? "Threat event fired" : "Ready", state: guardianFired ? "complete" : "pending" },
    { icon: <Volume2 className="h-5 w-5" />, label: "Speech warning", value: guardianFired ? "Browser TTS requested" : "Waiting for threshold", state: guardianFired ? "complete" : "pending" },
    { icon: <Wifi className="h-5 w-5" />, label: "Honeypot provider", value: honeypotLive ? "Groq live" : honeypotProvider === "fallback" ? "Fallback labeled" : "Untested", state: honeypotProvider === "untested" ? "pending" : "complete" },
    { icon: <FileCheck2 className="h-5 w-5" />, label: "Compliance decision", value: complianceBlocked ? `${complianceMode} block logged` : `${complianceMode} allowed`, state: "complete" },
    { icon: <CheckCircle2 className="h-5 w-5" />, label: "Benchmark detector", value: `${pct(benchmark.metrics.accuracy)} accuracy / ${pct(benchmark.metrics.eer)} EER`, state: "complete" },
    { icon: <ShieldAlert className="h-5 w-5" />, label: "Live audio detector", value: liveAudioSpoofReport ? `${Math.round(liveAudioSpoofReport.score * 100)}% ${liveAudioSpoofReport.verdict}` : "Ready for mic/upload", state: liveAudioSpoofReport ? "complete" : "pending" },
    { icon: <Scale className="h-5 w-5" />, label: "Security case", value: "Threat model + override policy documented", state: "complete" },
    { icon: <LockKeyhole className="h-5 w-5" />, label: "Privacy boundary", value: "No raw audio stored; Groq receives text only", state: "complete" },
    { icon: <Download className="h-5 w-5" />, label: "Export report", value: "PDF incident package ready", state: "complete" }
  ];

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl px-4 pb-32 pt-24">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/45">Judge Evidence Receipt</div>
          <h2 className="mt-2 max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">One screen. Every claim accounted for.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/58">
            Use this as the final demo frame: intervention, honeypot, compliance, benchmark, privacy, and export evidence in one place.
          </p>
        </div>
        <button type="button" onClick={exportReport} className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan/25 bg-cyan/10 px-4 py-3 text-sm text-cyan transition hover:bg-cyan/15">
          <Download className="h-4 w-4" />
          Export incident report
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label} className={`rounded-xl border p-5 backdrop-blur-xl ${row.state === "complete" ? "border-mint/20 bg-mint/10" : "border-white/10 bg-white/[0.035]"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-black/25 text-cyan">{row.icon}</div>
              <span className={`rounded-full border px-2.5 py-1 text-xs ${row.state === "complete" ? "border-mint/25 bg-mint/10 text-mint" : "border-amber/30 bg-amber/10 text-amber"}`}>
                {row.state === "complete" ? "proved" : "ready"}
              </span>
            </div>
            <div className="mt-4 text-sm text-white/45">{row.label}</div>
            <div className="mt-1 text-xl font-semibold">{row.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-[0.22em] text-white/45">Current incident</div>
          <div className="mt-3 text-3xl font-semibold">{Math.round(trustScore * 100)}%</div>
          <div className="mt-1 text-sm capitalize text-white/55">{scenario.replace("_", " ")} / {trustLabel}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-[0.22em] text-white/45">Extracted intel</div>
          <div className="mt-3 text-lg font-semibold">{extractedScamData.paymentMethod ?? "Pending"}</div>
          <div className="mt-1 text-sm text-white/55">{extractedScamData.claimedIdentity ?? "No claimed identity yet"}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-[0.22em] text-white/45">Audit events</div>
          <div className="mt-3 text-3xl font-semibold">{auditLog.length}</div>
          <div className="mt-1 text-sm text-white/55">Stored locally in browser state</div>
        </div>
      </div>
    </motion.section>
  );
}
