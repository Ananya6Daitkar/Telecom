"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Brain, ClipboardList, Download, FileCheck2, Fingerprint, FlaskConical, Network, PhoneCall, Play, ReceiptText, Scale, Shield, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { AuditLogView } from "@/components/AuditLogView";
import { ComplianceToggle } from "@/components/ComplianceToggle";
import { ConsentBadge } from "@/components/ConsentBadge";
import { DemoSimulator } from "@/components/DemoSimulator";
import { DiarizationView } from "@/components/DiarizationView";
import { EvidenceReceiptView } from "@/components/EvidenceReceiptView";
import { FingerprintAlert } from "@/components/FingerprintAlert";
import { GuardianSOSPanel } from "@/components/GuardianSOSPanel";
import { HoneypotView } from "@/components/HoneypotView";
import { ImplementationBadge } from "@/components/ImplementationBadge";
import { JudgeProofView } from "@/components/JudgeProofView";
import { LiveMicPanel } from "@/components/LiveMicPanel";
import { PatternNetwork } from "@/components/PatternNetwork";
import { ProofStrip } from "@/components/ProofStrip";
import { PrivacyArchitectureView } from "@/components/PrivacyArchitectureView";
import { ReasoningPanel } from "@/components/ReasoningPanel";
import { RedTeamDashboard } from "@/components/RedTeamDashboard";
import { SecurityCaseView } from "@/components/SecurityCaseView";
import { SpeechArenaView } from "@/components/SpeechArenaView";
import { TrustRing } from "@/components/TrustRing";
import { VoiceTwinDemo } from "@/components/VoiceTwinDemo";
import { useGuardianAlert } from "@/hooks/useGuardianAlert";
import { buildIncidentReport, downloadIncidentReport } from "@/lib/incident-report";
import { useAegisStore } from "@/lib/store";
import type { ActiveScreen } from "@/lib/types";

const nav: Array<{ id: ActiveScreen; label: string; icon: React.ReactNode }> = [
  { id: "call", label: "Call", icon: <PhoneCall className="h-4 w-4" /> },
  { id: "proof", label: "Proof", icon: <ShieldCheck className="h-4 w-4" /> },
  { id: "security", label: "Security", icon: <Scale className="h-4 w-4" /> },
  { id: "receipt", label: "Receipt", icon: <ReceiptText className="h-4 w-4" /> },
  { id: "reasoning", label: "Reasoning", icon: <Brain className="h-4 w-4" /> },
  { id: "honeypot", label: "Honeypot", icon: <Shield className="h-4 w-4" /> },
  { id: "patterns", label: "Network", icon: <Network className="h-4 w-4" /> },
  { id: "redteam", label: "Red Team", icon: <FlaskConical className="h-4 w-4" /> },
  { id: "arena", label: "Arena", icon: <Fingerprint className="h-4 w-4" /> },
  { id: "diarization", label: "CEO", icon: <Fingerprint className="h-4 w-4" /> },
  { id: "compliance", label: "Compliance", icon: <FileCheck2 className="h-4 w-4" /> },
  { id: "privacy", label: "Privacy", icon: <Shield className="h-4 w-4" /> },
  { id: "audit", label: "Audit", icon: <ClipboardList className="h-4 w-4" /> }
];

function Shell() {
  const initialize = useAegisStore((s) => s.initialize);
  const activeScreen = useAegisStore((s) => s.activeScreen);
  const setScreen = useAegisStore((s) => s.setScreen);
  const scenario = useAegisStore((s) => s.scenario);
  const trustScore = useAegisStore((s) => s.trustScore);
  const trustColor = useAegisStore((s) => s.trustColor);
  const trustLabel = useAegisStore((s) => s.trustLabel);
  const audioLevel = useAegisStore((s) => s.audioLevel);
  const certificate = useAegisStore((s) => s.consentCertificate);
  const fingerprintMatch = useAegisStore((s) => s.fingerprintMatch);
  const transcript = useAegisStore((s) => s.transcript);
  const activateHoneypot = useAegisStore((s) => s.activateHoneypot);
  const honeypotAllowed = useAegisStore((s) => s.isHoneypotAllowed());
  const addAuditEvent = useAegisStore((s) => s.addAuditEvent);
  const setScenario = useAegisStore((s) => s.setScenario);
  const setComplianceMode = useAegisStore((s) => s.setComplianceMode);
  const sendHoneypotStatement = useAegisStore((s) => s.sendHoneypotStatement);
  const complianceMode = useAegisStore((s) => s.complianceMode);
  const extractedScamData = useAegisStore((s) => s.extractedScamData);
  const reasoning = useAegisStore((s) => s.reasoning);
  const auditLog = useAegisStore((s) => s.auditLog);
  const honeypotProvider = useAegisStore((s) => s.honeypotProvider);
  const liveAudioSpoofReport = useAegisStore((s) => s.liveAudioSpoofReport);
  const guardianAlert = useGuardianAlert(trustScore * 100);

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
      label: "Incident report exported",
      detail: "Downloaded local JSON incident report for judge review.",
      level: "live"
    });
  }

  function runJudgeDemo() {
    addAuditEvent({
      type: "scenario",
      label: "Judge Demo sequence started",
      detail: "Automated sequence: cloned voice, Guardian alert, returning operator, Groq honeypot, GDPR block, audit log.",
      level: "live"
    });
    setScreen("call");
    setComplianceMode("TRAI");
    setScenario("cloned");
    window.setTimeout(() => {
      setScenario("normal");
    }, 2400);
    window.setTimeout(() => {
      setScenario("returning");
    }, 3600);
    window.setTimeout(() => {
      void activateHoneypot();
    }, 5200);
    window.setTimeout(() => {
      void sendHoneypotStatement("This is Officer Williams from the IRS. You must pay $500 in gift cards immediately.");
    }, 7000);
    window.setTimeout(() => {
      setComplianceMode("GDPR");
      setScreen("call");
    }, 9500);
    window.setTimeout(() => {
      setScreen("audit");
    }, 11500);
    window.setTimeout(() => {
      setScreen("receipt");
    }, 13200);
  }

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    document.title = "VoxHalo | Live Voice Trust";
  }, []);

  useEffect(() => {
    function onThreat(event: Event) {
      const detail = event instanceof CustomEvent ? event.detail as { trustScore?: number; threshold?: number } : {};
      addAuditEvent({
        type: "guardian",
        label: "Guardian SOS threat event fired",
        detail: `Trust score ${Math.round(detail.trustScore ?? trustScore * 100)} crossed below threshold ${detail.threshold ?? 40}. Browser speech warning requested.`,
        level: "live"
      });
    }

    window.addEventListener("sentinel:threat", onThreat);
    return () => window.removeEventListener("sentinel:threat", onThreat);
  }, [addAuditEvent, trustScore]);

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(56,189,248,0.12),transparent_28%),radial-gradient(circle_at_80%_40%,rgba(139,92,246,0.12),transparent_28%),linear-gradient(180deg,#0A0A0F,#090910)]" />
      <div className={`fixed inset-0 transition duration-700 ${trustLabel === "danger" ? "bg-red-950/20" : trustLabel === "suspicious" ? "bg-amber-950/10" : "bg-transparent"}`} />
      <FingerprintAlert match={fingerprintMatch} />

      <header className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-black/45 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <button type="button" onClick={() => setScreen("call")} className="flex items-center gap-3 text-left">
            <div className="grid h-9 w-9 place-items-center rounded-lg border border-cyan/20 bg-cyan/10"><Sparkles className="h-4 w-4 text-cyan" /></div>
            <div>
              <div className="font-semibold tracking-[-0.02em]">VoxHalo</div>
              <div className="hidden text-xs text-white/45 sm:block">Every call gets a trust score before you say hello.</div>
            </div>
          </button>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {nav.map((item) => (
              <button key={item.id} type="button" onClick={() => setScreen(item.id)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${activeScreen === item.id ? "bg-white/[0.08] text-white" : "text-white/55 hover:bg-white/[0.05] hover:text-white/85"}`}>
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
          <div className="hidden items-center gap-2 xl:flex">
            <button type="button" onClick={runJudgeDemo} className="inline-flex items-center gap-2 rounded-lg border border-mint/25 bg-mint/10 px-3 py-2 text-sm text-mint transition hover:bg-mint/15">
              <Play className="h-4 w-4" />
              Judge Demo
            </button>
            <button type="button" onClick={exportReport} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.08]">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="relative pt-14 lg:pt-0">
        <AnimatePresence mode="wait">
          {activeScreen === "call" ? (
            <motion.section key="call" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-7xl px-4 pb-16 pt-24">
              {/* Hero two-column grid — kept balanced on desktop */}
              <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
                <div className="order-2 lg:order-1">
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <ConsentBadge certificate={certificate} />
                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/55">{scenario === "idle" ? "no active call" : scenario.replace("_", " ")}</div>
                  </div>
                  <h1 className="max-w-2xl text-5xl font-semibold tracking-[-0.055em] sm:text-7xl">Trust is being calculated in real time.</h1>
                  <p className="mt-5 max-w-xl text-lg leading-8 text-white/58">{transcript}</p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={() => setScreen("reasoning")} className="rounded-lg border border-cyan/25 bg-cyan/10 px-5 py-3 text-sm font-medium text-cyan transition hover:bg-cyan/15">
                      View reasoning
                    </button>
                    <button type="button" disabled={!honeypotAllowed} onClick={() => void activateHoneypot()} className="rounded-lg border border-coral/30 bg-coral/10 px-5 py-3 text-sm font-medium text-coral transition hover:bg-coral/15 disabled:cursor-not-allowed disabled:opacity-45">
                      {honeypotAllowed ? "Activate honeypot" : "Honeypot blocked"}
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <ImplementationBadge level="heuristic" detail="Trust scoring uses explainable heuristic math." />
                    <ImplementationBadge level="live" detail="Guardian warning uses browser speech synthesis." />
                    <ImplementationBadge level="seeded" detail="Scenario and fingerprint data are seeded locally." />
                  </div>
                  <ProofStrip honeypotProvider={honeypotProvider} onOpenProof={() => setScreen("proof")} />
                </div>
                <div className="order-1 lg:order-2">
                  <TrustRing score={trustScore} color={trustColor} scenario={scenario} audioLevel={audioLevel} />
                  <div className="text-center text-sm uppercase tracking-[0.26em] text-white/45">live telecom trust signal</div>
                  <div className="mt-5">
                    <GuardianSOSPanel
                      status={guardianAlert.status}
                      onResolve={(outcome) => {
                        guardianAlert.resolve(outcome);
                        addAuditEvent({
                          type: "guardian",
                          label: outcome === "safe" ? "Guardian marked caller safe" : "Guardian call requested",
                          detail: outcome === "safe" ? "Human override resolved the high-risk alert as safe." : "User requested help from trusted guardian.",
                          level: "live"
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Full-width panels below the hero grid */}
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <VoiceTwinDemo />
                <LiveMicPanel />
              </div>
            </motion.section>
          ) : activeScreen === "proof" ? (
            <JudgeProofView key="proof" />
          ) : activeScreen === "security" ? (
            <SecurityCaseView key="security" />
          ) : activeScreen === "receipt" ? (
            <EvidenceReceiptView key="receipt" />
          ) : activeScreen === "reasoning" ? (
            <ReasoningPanel key="reasoning" />
          ) : activeScreen === "honeypot" ? (
            <HoneypotView key="honeypot" />
          ) : activeScreen === "patterns" ? (
            <PatternNetwork key="patterns" />
          ) : activeScreen === "redteam" ? (
            <RedTeamDashboard key="redteam" />
          ) : activeScreen === "arena" ? (
            <SpeechArenaView key="arena" />
          ) : activeScreen === "diarization" ? (
            <DiarizationView key="diarization" />
          ) : activeScreen === "audit" ? (
            <AuditLogView key="audit" />
          ) : activeScreen === "privacy" ? (
            <PrivacyArchitectureView key="privacy" />
          ) : (
            <ComplianceToggle key="compliance" />
          )}
        </AnimatePresence>
      </div>

      <div className="fixed left-4 right-4 top-[76px] z-30 mx-auto flex max-w-6xl gap-2 overflow-x-auto rounded-xl border border-white/10 bg-black/55 p-2 backdrop-blur-2xl no-scrollbar lg:hidden">
        {nav.map((item) => (
          <button key={item.id} type="button" onClick={() => setScreen(item.id)} className={`flex min-w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm ${activeScreen === item.id ? "bg-white/[0.08] text-white" : "text-white/55"}`}>
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
      <DemoSimulator />
      <div className="relative z-20 mx-3 mb-6 flex justify-end gap-2 sm:fixed sm:bottom-6 sm:right-4 sm:z-40 sm:mx-0 sm:mb-0 sm:flex-col xl:hidden">
        <button type="button" onClick={runJudgeDemo} className="inline-flex items-center justify-center gap-2 rounded-lg border border-mint/25 bg-mint/10 px-3 py-2 text-sm text-mint backdrop-blur-xl">
          <Play className="h-4 w-4" />
          Judge
        </button>
        <button type="button" onClick={exportReport} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white/70 backdrop-blur-xl">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
    </main>
  );
}

export default function Page() {
  return <Shell />;
}
