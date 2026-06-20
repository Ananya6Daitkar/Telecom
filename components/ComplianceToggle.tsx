"use client";

import { motion } from "framer-motion";
import { FileCheck2, ShieldCheck } from "lucide-react";
import { complianceConfigs } from "@/lib/compliance";
import { useAegisStore } from "@/lib/store";
import type { ComplianceMode } from "@/lib/types";
import { ImplementationBadge } from "./ImplementationBadge";

const modes: ComplianceMode[] = ["TRAI", "FCC", "GDPR", "RBI"];

export function ComplianceToggle() {
  const mode = useAegisStore((s) => s.complianceMode);
  const setMode = useAegisStore((s) => s.setComplianceMode);
  const certificates = useAegisStore((s) => s.certificates);
  const config = complianceConfigs[mode];

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl px-4 pb-32 pt-24">
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/45">Compliance Layer</div>
          <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">Consent-aware call defense.</h2>
          <p className="mt-5 text-lg leading-8 text-white/58">VoxHalo previews jurisdiction policy and now enforces recording and honeypot availability in the demo UI.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ImplementationBadge level="live" detail="Recording and honeypot buttons are gated by the selected mode." />
            <ImplementationBadge level="seeded" detail="Certificates are demo records with local SHA-256 signatures." />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
          <label className="text-xs uppercase tracking-[0.22em] text-white/45" htmlFor="jurisdiction">Jurisdiction</label>
          <select id="jurisdiction" value={mode} onChange={(event) => setMode(event.target.value as ComplianceMode)} className="mt-3 w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white">
            {modes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <div className="mt-5 rounded-lg border border-cyan/20 bg-cyan/10 p-4 text-cyan-50">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4" /> Consent preview</div>
            <p className="leading-7 text-white/78">{config.consentText}</p>
            {config.englishText ? <p className="mt-3 leading-7 text-white/55">{config.englishText}</p> : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-black/25 p-4"><div className="text-xs text-white/45">Recording</div><div className="mt-1 font-semibold">{config.recordingAllowed ? "Allowed" : "Blocked"}</div></div>
            <div className="rounded-lg border border-white/10 bg-black/25 p-4"><div className="text-xs text-white/45">Honeypot</div><div className="mt-1 font-semibold">{config.honeypotAllowed ? "Allowed" : "Blocked"}</div></div>
            <div className="rounded-lg border border-white/10 bg-black/25 p-4"><div className="text-xs text-white/45">Retention</div><div className="mt-1 font-semibold">{config.dataRetentionDays} days</div></div>
          </div>
          {!config.recordingAllowed || !config.honeypotAllowed ? (
            <div className="mt-4 rounded-lg border border-amber/25 bg-amber/10 p-3 text-sm text-amber">
              Enforcement active: blocked capabilities are disabled in the call and honeypot workflows.
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45"><FileCheck2 className="h-4 w-4" /> Certificate Ledger</div>
        <div className="grid gap-3 md:grid-cols-2">
          {certificates.map((cert) => (
            <div key={cert.id} className="rounded-lg border border-white/10 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{cert.callerName}</div>
                  <div className="font-mono text-sm text-white/45">{cert.callerId}</div>
                </div>
                <div className={`rounded-full border px-3 py-1 text-xs ${cert.verificationStatus === "verified" ? "border-mint/25 bg-mint/10 text-mint" : "border-white/10 bg-white/[0.04] text-white/55"}`}>{cert.verificationStatus}</div>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/60">{cert.declaredPurpose}</p>
              <div className="mt-3 truncate font-mono text-xs text-white/35">{cert.signature}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
