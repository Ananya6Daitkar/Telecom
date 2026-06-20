"use client";

import { motion } from "framer-motion";
import { ClipboardList, FileDown } from "lucide-react";
import { complianceConfigs } from "@/lib/compliance";
import { buildIncidentReport, downloadIncidentReport } from "@/lib/incident-report";
import { useAegisStore } from "@/lib/store";
import { ImplementationBadge } from "./ImplementationBadge";

export function AuditLogView() {
  const auditLog = useAegisStore((s) => s.auditLog);
  const clearAuditLog = useAegisStore((s) => s.clearAuditLog);
  const scenario = useAegisStore((s) => s.scenario);
  const trustScore = useAegisStore((s) => s.trustScore);
  const trustLabel = useAegisStore((s) => s.trustLabel);
  const reasoning = useAegisStore((s) => s.reasoning);
  const complianceMode = useAegisStore((s) => s.complianceMode);
  const honeypotProvider = useAegisStore((s) => s.honeypotProvider);
  const extractedScamData = useAegisStore((s) => s.extractedScamData);
  const fingerprintMatch = useAegisStore((s) => s.fingerprintMatch);
  const liveAudioSpoofReport = useAegisStore((s) => s.liveAudioSpoofReport);
  const policy = complianceConfigs[complianceMode];

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
  }

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl px-4 pb-32 pt-24">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/45">Audit Trail</div>
          <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">Every intervention leaves a local trail.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/58">Client-side demo log for judge review: scenario changes, Guardian actions, honeypot use, compliance mode changes, and live transcription events.</p>
        </div>
        <button type="button" onClick={clearAuditLog} className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70 transition hover:bg-white/[0.08]">
          Clear log
        </button>
        <button type="button" onClick={exportReport} className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan/25 bg-cyan/10 px-4 py-3 text-sm text-cyan transition hover:bg-cyan/15">
          <FileDown className="h-4 w-4" />
          Export incident report
        </button>
      </div>

      <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
        <div className="mb-4 text-xs uppercase tracking-[0.22em] text-white/45">Policy Decision Log</div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-black/25 p-4">
            <div className="text-xs text-white/45">Active mode</div>
            <div className="mt-1 text-xl font-semibold">{complianceMode}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/25 p-4">
            <div className="text-xs text-white/45">Recording decision</div>
            <div className={`mt-1 text-xl font-semibold ${policy.recordingAllowed ? "text-mint" : "text-amber"}`}>{policy.recordingAllowed ? "Allowed" : "Blocked"}</div>
            {!policy.recordingAllowed ? <div className="mt-2 text-xs text-white/45">Blocked because recordingAllowed=false.</div> : null}
          </div>
          <div className="rounded-lg border border-white/10 bg-black/25 p-4">
            <div className="text-xs text-white/45">Honeypot decision</div>
            <div className={`mt-1 text-xl font-semibold ${policy.honeypotAllowed ? "text-mint" : "text-amber"}`}>{policy.honeypotAllowed ? "Allowed" : "Blocked"}</div>
            {!policy.honeypotAllowed ? <div className="mt-2 text-xs text-white/45">Blocked because honeypotAllowed=false.</div> : null}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
          <ClipboardList className="h-4 w-4" />
          Local event stream
        </div>
        <div className="space-y-3">
          {auditLog.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-black/25 p-6 text-center text-white/45">No events yet. Select a scenario or trigger Guardian SOS.</div>
          ) : (
            auditLog.map((event) => (
              <div key={event.id} className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <div className="font-medium">{event.label}</div>
                    <div className="mt-1 text-sm text-white/55">{event.detail}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ImplementationBadge level={event.level} />
                    <span className="font-mono text-xs text-white/35">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.section>
  );
}
