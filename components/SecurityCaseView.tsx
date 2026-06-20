"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, CloudOff, FileCheck2, GitBranch, LockKeyhole, Network, ShieldAlert, UserCheck } from "lucide-react";
import { complianceConfigs } from "@/lib/compliance";
import { useAegisStore } from "@/lib/store";
import { ImplementationBadge } from "./ImplementationBadge";

const threats = [
  { name: "Voice cloning", control: "audio spoof probability + trust score drop", residual: "Hard clips may require human verification" },
  { name: "Scam intent", control: "transcript intent scoring + emotional tactics", residual: "Ambiguous benign urgency can raise review state" },
  { name: "Returning operator", control: "signature phrase fingerprint match", residual: "Seeded graph until telecom network feed exists" },
  { name: "CEO deepfake", control: "speaker split + executive transfer scenario", residual: "Diarization screen is demo workflow, not full speaker model" },
  { name: "Privacy failure", control: "local audio processing + compliance gates", residual: "Groq receives honeypot text when enabled" },
  { name: "False positive harm", control: "Guardian verification and user override", residual: "System warns; it does not accuse or auto-block" }
];

const redTeamRows = [
  { attack: "Low-stress synthetic clone", response: "Audio baseline + trust ring review", mitigation: "Require caller verification phrase", risk: "Medium" },
  { attack: "Urgent family emergency", response: "Guardian SOS escalation", mitigation: "Trusted contact callback", risk: "Low" },
  { attack: "Payment pivot to gift card", response: "Honeypot extracts payment intel", mitigation: "Delay and collect operator pattern", risk: "Low" },
  { attack: "GDPR jurisdiction conflict", response: "recordingAllowed=false block", mitigation: "Disable mic/upload and log policy decision", risk: "Low" }
];

const architecture = [
  { label: "Browser client", detail: "UI, trust ring, local state, audit export" },
  { label: "Local audio path", detail: "Mic/upload audio decoded in browser for acoustic baseline" },
  { label: "Optional Groq text path", detail: "Honeypot sends scammer text only, never raw audio" },
  { label: "Policy engine", detail: "TRAI/FCC/GDPR/RBI gates recording and honeypot controls" },
  { label: "Export package", detail: "PDF receipt with trust score, benchmark, privacy, audit events" },
  { label: "Future telecom edge", detail: "SIP/IVR carrier integration without raw audio storage by default" }
];

export function SecurityCaseView() {
  const complianceMode = useAegisStore((s) => s.complianceMode);
  const liveAudioSpoofReport = useAegisStore((s) => s.liveAudioSpoofReport);
  const honeypotProvider = useAegisStore((s) => s.honeypotProvider);
  const auditLog = useAegisStore((s) => s.auditLog);
  const policy = complianceConfigs[complianceMode];

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl px-4 pb-32 pt-24">
      <div className="mb-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/45">Security Case</div>
          <h2 className="mt-2 max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">Threat model, ethics, and deployability in one view.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/58">
            This is the judge-facing security argument: what VoxHalo defends against, how it avoids overreach, what remains risky, and how it scales.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ImplementationBadge level="live" detail="Policy gates, audit receipt, export, and live audio baseline are implemented." />
            <ImplementationBadge level="heuristic" detail="Threat model and residual risk are engineering analysis, not certification." />
          </div>
        </div>

        <div className="rounded-xl border border-cyan/20 bg-cyan/10 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan">
            <FileCheck2 className="h-4 w-4" />
            Consent + Data Retention Receipt
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-black/25 p-4">
              <div className="text-xs text-white/45">Jurisdiction</div>
              <div className="mt-1 text-xl font-semibold">{complianceMode}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/25 p-4">
              <div className="text-xs text-white/45">Retention</div>
              <div className="mt-1 text-xl font-semibold">{policy.dataRetentionDays} days</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/25 p-4">
              <div className="text-xs text-white/45">Recording</div>
              <div className={`mt-1 text-xl font-semibold ${policy.recordingAllowed ? "text-mint" : "text-amber"}`}>{policy.recordingAllowed ? "Allowed" : "Blocked"}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/25 p-4">
              <div className="text-xs text-white/45">Groq data boundary</div>
              <div className="mt-1 text-sm font-semibold">{honeypotProvider === "groq" ? "Text-only live call" : "Text-only if enabled"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
            <ShieldAlert className="h-4 w-4" />
            Threat Model
          </div>
          <div className="space-y-3">
            {threats.map((threat) => (
              <div key={threat.name} className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{threat.name}</div>
                    <div className="mt-1 text-sm text-white/58">Control: {threat.control}</div>
                  </div>
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber" />
                </div>
                <div className="mt-2 text-xs text-white/42">Residual risk: {threat.residual}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-xl border border-mint/20 bg-mint/10 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-mint">
              <UserCheck className="h-4 w-4" />
              False Positive + Human Override Policy
            </div>
            <div className="grid gap-3">
              {["High risk means verify, not guilty.", "VoxHalo never auto-sends money, blocks a user, or accuses a caller.", "Guardian can mark She's fine or request help.", "Every override is logged locally for review."].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/25 p-3 text-sm text-white/70">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
              <CloudOff className="h-4 w-4" />
              Live Evidence Status
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="text-xs text-white/45">Audio detector</div>
                <div className="mt-1 font-semibold">{liveAudioSpoofReport ? `${Math.round(liveAudioSpoofReport.score * 100)}% ${liveAudioSpoofReport.verdict}` : "Armed"}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="text-xs text-white/45">Honeypot</div>
                <div className="mt-1 font-semibold capitalize">{honeypotProvider}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="text-xs text-white/45">Audit events</div>
                <div className="mt-1 font-semibold">{auditLog.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
          <GitBranch className="h-4 w-4" />
          Red-Team Residual Risk Register
        </div>
        <div className="grid gap-3 lg:grid-cols-4">
          {redTeamRows.map((row) => (
            <div key={row.attack} className="rounded-lg border border-white/10 bg-black/25 p-4">
              <div className="font-semibold">{row.attack}</div>
              <div className="mt-2 text-sm text-white/58">Response: {row.response}</div>
              <div className="mt-2 text-sm text-white/42">Mitigation: {row.mitigation}</div>
              <div className="mt-3 inline-flex rounded-full border border-amber/25 bg-amber/10 px-2.5 py-1 text-xs text-amber">Residual {row.risk}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
          <Network className="h-4 w-4" />
          Enterprise Deployment Architecture
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {architecture.map((item, index) => (
            <div key={item.label} className="rounded-lg border border-white/10 bg-black/25 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg border border-cyan/20 bg-cyan/10 text-sm text-cyan">{index + 1}</div>
                <div className="font-semibold">{item.label}</div>
              </div>
              <div className="mt-2 text-sm leading-6 text-white/55">{item.detail}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-cyan/20 bg-cyan/10 p-5 text-sm leading-6 text-white/70 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-cyan" />
          <div>
            <span className="font-semibold text-cyan">Security posture:</span> VoxHalo is a privacy-preserving intervention layer for demo use today. Production hardening would add carrier authentication, model monitoring, adversarial evaluation, formal DPIA, and signed audit storage.
          </div>
        </div>
      </div>
    </motion.section>
  );
}
