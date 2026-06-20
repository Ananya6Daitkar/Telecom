"use client";

import { motion } from "framer-motion";
import { Database, FileText, LockKeyhole, MicOff, ShieldCheck, Wifi } from "lucide-react";
import { ImplementationBadge } from "./ImplementationBadge";

const rows = [
  { icon: <MicOff className="h-5 w-5" />, title: "Raw audio stays local", detail: "Mic capture and uploaded samples are processed in the browser path; no app backend stores call audio." },
  { icon: <FileText className="h-5 w-5" />, title: "Transcripts are ephemeral", detail: "Live transcripts are held in client state for scoring and demo display, not posted to a database." },
  { icon: <Wifi className="h-5 w-5" />, title: "Groq receives honeypot text only", detail: "The Groq call sends caller text and Margaret history, never raw audio." },
  { icon: <Database className="h-5 w-5" />, title: "LocalStorage keys are explicit", detail: "voxhalo_fingerprints, voxhalo_economics, and voxhalo_audit_log persist demo state locally." },
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Compliance gates capabilities", detail: "GDPR mode disables recording/upload analysis and honeypot engagement in the UI." },
  { icon: <LockKeyhole className="h-5 w-5" />, title: "No production identity graph", detail: "Certificates, fingerprints, economics, and Arena results are seeded or simulated unless marked Live." }
];

export function PrivacyArchitectureView() {
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl px-4 pb-32 pt-24">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.24em] text-white/45">Privacy Architecture</div>
        <h2 className="mt-2 max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">Privacy boundaries a security judge can inspect.</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <ImplementationBadge level="live" detail="Policy gates and local state behavior are implemented in the app." />
          <ImplementationBadge level="heuristic" detail="This is a prototype architecture map, not a formal DPIA." />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((row) => (
          <div key={row.title} className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-cyan/20 bg-cyan/10 text-cyan">{row.icon}</div>
              <div>
                <h3 className="text-lg font-semibold">{row.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/58">{row.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
