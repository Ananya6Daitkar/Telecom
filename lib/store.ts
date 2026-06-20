"use client";

import { create } from "zustand";
import { combinedTrustScore, scamIntentScore, voiceAuthenticityScore } from "./classifier";
import { complianceConfigs } from "./compliance";
import { demoCertificates } from "./consent-ledger";
import { speechDeepfakeArenaVerdict } from "./deepfake-arena";
import { ceoDeepfakeSpeakers } from "./diarization";
import { loadEconomics, seedEconomics, tickEconomics } from "./economics";
import { analyzeEmotionalTactics } from "./emotional-radar";
import { extractFeatures } from "./feature-extraction";
import { matchFingerprint, seedFingerprintDB, seedFingerprints } from "./fingerprint";
import { honeypotReply } from "./honeypot";
import { scenarioTranscripts } from "./speech-to-text";
import type {
  ActiveScreen,
  ArenaModelScore,
  AuditEvent,
  ComplianceMode,
  ConsentCertificate,
  EconomicsState,
  EmotionalRadar,
  ExtractedScamData,
  FingerprintRecord,
  HoneypotProvider,
  LiveAudioSpoofReport,
  Scenario,
  Speaker,
  VoiceAnomalyReport
} from "./types";
import { detectAnomalies } from "./voice-anomaly";

type Message = { role: "scammer" | "margaret"; text: string; timestamp: Date };

const AUDIT_KEY = "voxhalo_audit_log";
const LEGACY_AUDIT_KEY = "aegis_audit_log";

type Store = {
  scenario: Scenario;
  transcript: string;
  trustScore: number;
  trustLabel: string;
  trustColor: string;
  voiceAuthScore: number;
  scamIntentScore: number;
  emotionalRadar: EmotionalRadar;
  reasoning: string[];
  voiceAnomalyReport: VoiceAnomalyReport | null;
  fingerprintMatch: FingerprintRecord | null;
  fingerprintDB: FingerprintRecord[];
  callStatus: "idle" | "active" | "honeypot" | "ended";
  honeypotMessages: Message[];
  honeypotProvider: HoneypotProvider;
  honeypotError: string | null;
  isHoneypotThinking: boolean;
  extractedScamData: ExtractedScamData;
  economics: EconomicsState;
  speakers: Speaker[];
  arenaScores: ArenaModelScore[];
  consentCertificate: ConsentCertificate | null;
  certificates: ConsentCertificate[];
  complianceMode: ComplianceMode;
  activeScreen: ActiveScreen;
  isRecording: boolean;
  audioLevel: number;
  isLoadingScenario: boolean;
  error: string | null;
  auditLog: AuditEvent[];
  liveAudioSpoofReport: LiveAudioSpoofReport | null;
  isRecordingAllowed: () => boolean;
  isHoneypotAllowed: () => boolean;
  addAuditEvent: (event: Omit<AuditEvent, "id" | "timestamp">) => void;
  setLiveAudioSpoofReport: (report: LiveAudioSpoofReport) => void;
  clearAuditLog: () => void;
  setScenario: (s: Scenario) => void;
  setScreen: (s: ActiveScreen) => void;
  activateHoneypot: () => Promise<void>;
  sendHoneypotStatement: (text: string) => Promise<void>;
  analyzeLiveTranscript: (text: string, audioLevel?: number) => void;
  tickEconomics: () => void;
  initialize: () => Promise<void>;
  setComplianceMode: (mode: ComplianceMode) => void;
  setAudioLevel: (level: number) => void;
};

const emptyData: ExtractedScamData = {
  paymentMethod: null,
  claimedIdentity: null,
  amountRequested: null,
  urgencyTactic: null
};

function loadAuditLog(): AuditEvent[] {
  if (typeof window === "undefined") return [];
  const existing = localStorage.getItem(AUDIT_KEY) ?? localStorage.getItem(LEGACY_AUDIT_KEY);
  return existing ? JSON.parse(existing) as AuditEvent[] : [];
}

function callerCertificate(scenario: Scenario, certificates: ConsentCertificate[]): ConsentCertificate | null {
  if (scenario === "normal") return certificates.find((cert) => cert.id === "cert-hdfc") ?? null;
  if (scenario === "scam" || scenario === "returning") return certificates.find((cert) => cert.id === "cert-irs") ?? null;
  return null;
}

export const useAegisStore = create<Store>((set, get) => ({
  scenario: "idle",
  transcript: "No active call. Select a scenario from the simulator.",
  trustScore: 0.82,
  trustLabel: "safe",
  trustColor: "#22C55E",
  voiceAuthScore: 0.88,
  scamIntentScore: 0.08,
  emotionalRadar: { fear: 0, urgency: 0, authority: 0, isolation: 0, guilt: 0 },
  reasoning: ["System armed. Awaiting call stream."],
  voiceAnomalyReport: null,
  fingerprintMatch: null,
  fingerprintDB: seedFingerprints,
  callStatus: "idle",
  honeypotMessages: [],
  honeypotProvider: "untested",
  honeypotError: null,
  isHoneypotThinking: false,
  extractedScamData: emptyData,
  economics: seedEconomics,
  speakers: [],
  arenaScores: speechDeepfakeArenaVerdict("idle", 0.88),
  consentCertificate: null,
  certificates: [],
  complianceMode: "TRAI",
  activeScreen: "call",
  isRecording: false,
  audioLevel: 0.35,
  isLoadingScenario: false,
  error: null,
  auditLog: [],
  liveAudioSpoofReport: null,

  isRecordingAllowed: () => complianceConfigs[get().complianceMode].recordingAllowed,
  isHoneypotAllowed: () => complianceConfigs[get().complianceMode].honeypotAllowed,

  addAuditEvent: (event) => set((state) => {
    const next: AuditEvent = {
      ...event,
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: new Date().toISOString()
    };
    const auditLog = [next, ...state.auditLog].slice(0, 40);
    if (typeof window !== "undefined") localStorage.setItem(AUDIT_KEY, JSON.stringify(auditLog));
    return { auditLog };
  }),

  clearAuditLog: () => {
    if (typeof window !== "undefined") localStorage.removeItem(AUDIT_KEY);
    if (typeof window !== "undefined") localStorage.removeItem(LEGACY_AUDIT_KEY);
    set({ auditLog: [] });
  },

  setLiveAudioSpoofReport: (liveAudioSpoofReport) => {
    set({ liveAudioSpoofReport });
    get().addAuditEvent({
      type: "transcription",
      label: "Live audio spoof probability computed",
      detail: `Baseline detector returned ${Math.round(liveAudioSpoofReport.score * 100)}% spoof probability from ${liveAudioSpoofReport.source}.`,
      level: "live"
    });
  },

  initialize: async () => {
    const certificates = await demoCertificates();
    set({
      fingerprintDB: seedFingerprintDB(),
      economics: loadEconomics(),
      certificates,
      consentCertificate: null,
      auditLog: loadAuditLog()
    });
  },

  setScenario: (scenario) => {
    if (scenario === "idle") {
      set({ scenario, activeScreen: "call", callStatus: "idle" });
      return;
    }
    if (scenario === "live") return;

    set({ isLoadingScenario: true, error: null });
    const features = extractFeatures(0.45, true, scenario);
    const voiceScore = voiceAuthenticityScore(features);
    const transcript = scenarioTranscripts[scenario];
    let intentScore = scamIntentScore(transcript);
    const certificates = get().certificates;
    const cert = callerCertificate(scenario, certificates);
    if (cert?.verificationStatus === "unverified") intentScore = Math.min(1, intentScore + 0.2);
    const combined = combinedTrustScore(voiceScore, intentScore);
    const db = get().fingerprintDB;
    const fingerprintMatch = scenario === "returning" ? matchFingerprint(transcript, db) : null;
    const activeScreen: ActiveScreen = scenario === "ceo_fake" ? "diarization" : "call";
    const anomalies = detectAnomalies(features, transcript);
    const radar = analyzeEmotionalTactics(transcript);

    set({
      scenario,
      transcript,
      voiceAuthScore: voiceScore,
      scamIntentScore: intentScore,
      trustScore: combined.score,
      trustLabel: combined.label,
      trustColor: combined.color,
      emotionalRadar: radar,
      reasoning: fingerprintMatch
        ? [`Returning operator matched to ${fingerprintMatch.shortId} with known signature phrases`, ...combined.reasoning]
        : combined.reasoning,
      voiceAnomalyReport: anomalies,
      fingerprintMatch,
      callStatus: "active",
      honeypotMessages: [],
      honeypotProvider: "untested",
      honeypotError: null,
      isHoneypotThinking: false,
      extractedScamData: emptyData,
      consentCertificate: cert,
      speakers: scenario === "ceo_fake" ? ceoDeepfakeSpeakers : [],
      arenaScores: speechDeepfakeArenaVerdict(scenario, voiceScore),
      activeScreen,
      audioLevel: scenario === "normal" ? 0.28 : 0.72,
      isLoadingScenario: false
    });
    get().addAuditEvent({
      type: "scenario",
      label: `Scenario selected: ${scenario.replace("_", " ")}`,
      detail: `Trust score recalculated to ${Math.round(combined.score * 100)}%. Scenario features are ${scenario === "normal" ? "seeded benign" : "seeded demo"} inputs.`,
      level: scenario === "normal" ? "seeded" : "simulated"
    });

    if (scenario === "scam") {
      window.setTimeout(() => {
        if (get().scenario === "scam" && get().callStatus === "active") void get().activateHoneypot();
      }, 2000);
    }
  },

  setScreen: (activeScreen) => set({ activeScreen }),

  activateHoneypot: async () => {
    const state = get();
    if (!get().isHoneypotAllowed()) {
      get().addAuditEvent({
        type: "compliance",
        label: "Honeypot blocked by compliance mode",
        detail: `${state.complianceMode} does not allow honeypot engagement in this demo policy.`,
        level: "live"
      });
      return;
    }
    if (state.callStatus === "honeypot") {
      set({ activeScreen: "honeypot" });
      return;
    }
    set({ callStatus: "honeypot", activeScreen: "honeypot", isHoneypotThinking: true, honeypotError: null });
    const reply = await honeypotReply(
      state.transcript,
      state.honeypotMessages.map((message) => ({
        role: message.role === "margaret" ? "assistant" : "user",
        content: message.text
      }))
    );
    set({
      honeypotMessages: [
        { role: "scammer", text: state.transcript, timestamp: new Date() },
        { role: "margaret", text: reply.reply, timestamp: new Date() }
      ],
      extractedScamData: reply.extractedData,
      honeypotProvider: reply.provider,
      honeypotError: reply.error ?? null,
      isHoneypotThinking: false
    });
    get().addAuditEvent({
      type: "honeypot",
      label: `Honeypot activated via ${reply.provider === "groq" ? "Groq" : "fallback"}`,
      detail: reply.provider === "groq" ? "Margaret response generated by Groq API." : `Fallback response used: ${reply.error ?? "offline mode"}.`,
      level: reply.provider === "groq" ? "live" : "simulated"
    });
  },

  sendHoneypotStatement: async (text) => {
    const statement = text.trim();
    if (!statement) return;
    if (!get().isHoneypotAllowed()) {
      get().addAuditEvent({
        type: "compliance",
        label: "Honeypot message blocked by compliance mode",
        detail: `${get().complianceMode} disables honeypot engagement.`,
        level: "live"
      });
      return;
    }
    const state = get();
    const history = state.honeypotMessages.map((message) => ({
      role: message.role === "margaret" ? "assistant" : "user",
      content: message.text
    }));
    const nextMessages: Message[] = [...state.honeypotMessages, { role: "scammer", text: statement, timestamp: new Date() }];
    set({ callStatus: "honeypot", activeScreen: "honeypot", honeypotMessages: nextMessages, isHoneypotThinking: true, honeypotError: null });
    const reply = await honeypotReply(statement, history);
    set((current) => ({
      honeypotMessages: [...current.honeypotMessages, { role: "margaret", text: reply.reply, timestamp: new Date() }],
      extractedScamData: {
        paymentMethod: reply.extractedData.paymentMethod ?? current.extractedScamData.paymentMethod,
        claimedIdentity: reply.extractedData.claimedIdentity ?? current.extractedScamData.claimedIdentity,
        amountRequested: reply.extractedData.amountRequested ?? current.extractedScamData.amountRequested,
        urgencyTactic: reply.extractedData.urgencyTactic ?? current.extractedScamData.urgencyTactic
      },
      honeypotProvider: reply.provider,
      honeypotError: reply.error ?? null,
      isHoneypotThinking: false
    }));
    get().addAuditEvent({
      type: "honeypot",
      label: `Honeypot turn completed via ${reply.provider === "groq" ? "Groq" : "fallback"}`,
      detail: `Extracted payment=${reply.extractedData.paymentMethod ?? "unknown"}, identity=${reply.extractedData.claimedIdentity ?? "unknown"}.`,
      level: reply.provider === "groq" ? "live" : "simulated"
    });
  },

  analyzeLiveTranscript: (text, level = 0.48) => {
    const transcript = text.trim();
    if (!transcript) return;
    const features = extractFeatures(level, false, "live");
    const voiceScore = voiceAuthenticityScore(features);
    const intentScore = scamIntentScore(transcript);
    const combined = combinedTrustScore(voiceScore, intentScore);
    const fingerprintMatch = matchFingerprint(transcript, get().fingerprintDB);
    set({
      scenario: "live",
      transcript,
      voiceAuthScore: voiceScore,
      scamIntentScore: intentScore,
      trustScore: combined.score,
      trustLabel: combined.label,
      trustColor: combined.color,
      emotionalRadar: analyzeEmotionalTactics(transcript),
      reasoning: fingerprintMatch ? [`Live transcript matched operator ${fingerprintMatch.shortId}`, ...combined.reasoning] : ["Live microphone transcript analyzed by Whisper", ...combined.reasoning],
      voiceAnomalyReport: detectAnomalies(features, transcript),
      fingerprintMatch,
      consentCertificate: null,
      speakers: [],
      arenaScores: speechDeepfakeArenaVerdict("live", voiceScore),
      callStatus: "active",
      activeScreen: "call",
      audioLevel: level
    });
    get().addAuditEvent({
      type: "transcription",
      label: "Live transcript analyzed",
      detail: `Trust score recalculated to ${Math.round(combined.score * 100)}% from live/uploaded audio transcript.`,
      level: "heuristic"
    });
  },

  tickEconomics: () => set((state) => ({ economics: tickEconomics(state.economics) })),

  setComplianceMode: (complianceMode) => {
    const config = complianceConfigs[complianceMode];
    set((state) => ({
      complianceMode,
      reasoning: [`Compliance switched to ${complianceMode}: ${config.dataRetentionDays} day retention`, ...state.reasoning.slice(0, 3)]
    }));
    get().addAuditEvent({
      type: "compliance",
      label: `Compliance mode set to ${complianceMode}`,
      detail: `Recording ${config.recordingAllowed ? "allowed" : "blocked"}, honeypot ${config.honeypotAllowed ? "allowed" : "blocked"}, retention ${config.dataRetentionDays} days.`,
      level: "live"
    });
  },

  setAudioLevel: (audioLevel) => set({ audioLevel })
}));
