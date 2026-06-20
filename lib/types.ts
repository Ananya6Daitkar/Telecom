export type Scenario = "idle" | "live" | "normal" | "cloned" | "scam" | "returning" | "ceo_fake";

export type FeatureVector = {
  spectralFlux: number;
  prosodyScore: number;
  microPauseScore: number;
  vocalAge: number;
  stressLevel: number;
  speakerConsistency: number;
};

export type EmotionalRadar = {
  fear: number;
  urgency: number;
  authority: number;
  isolation: number;
  guilt: number;
};

export type FingerprintRecord = {
  id: string;
  shortId: string;
  avgWordsPerMinute: number;
  dominantTactic: string;
  paymentMethods: string[];
  claimedIdentities: string[];
  signaturePhrases: string[];
  callCount: number;
  firstSeen: string;
  lastSeen: string;
  status: "active" | "dormant";
};

export type VoiceAnomalyReport = {
  ageAnomaly: boolean;
  estimatedAge: number;
  claimedRelationship: string | null;
  expectedAgeRange: [number, number] | null;
  stressAnomaly: boolean;
  stressDescription: string;
  anomalySummary: string[];
};

export type ExtractedScamData = {
  paymentMethod: string | null;
  claimedIdentity: string | null;
  amountRequested: number | null;
  urgencyTactic: string | null;
};

export type EconomicsState = {
  callsIntercepted: number;
  minutesWasted: number;
  operatorsFingerprinted: number;
  dollarsSaved: number;
  patternsShared: number;
};

export type ConsentCertificate = {
  id: string;
  callerId: string;
  callerName: string;
  declaredPurpose: string;
  verificationStatus: "verified" | "unverified";
  issuedAt: string;
  signature: string;
};

export type Speaker = {
  id: string;
  label: string;
  trustScore: number;
  voiceAuthScore: number;
  isSynthetic: boolean;
  speakingTime: number;
};

export type ComplianceMode = "TRAI" | "FCC" | "GDPR" | "RBI";

export type ImplementationLevel = "live" | "heuristic" | "simulated" | "seeded";

export type HoneypotProvider = "untested" | "groq" | "fallback";

export type LiveAudioSpoofReport = {
  score: number;
  verdict: "bonafide" | "spoof" | "review";
  threshold: number;
  accuracy: number;
  eer: number;
  source: "microphone" | "upload" | "demo-real" | "demo-clone";
  durationSeconds: number;
  sampleRate: number;
  evaluatedAt: string;
};

export type AuditEvent = {
  id: string;
  timestamp: string;
  type: "scenario" | "guardian" | "honeypot" | "compliance" | "transcription" | "override";
  label: string;
  detail: string;
  level: ImplementationLevel;
};

export type ArenaModelScore = {
  model: string;
  family: "raw waveform" | "self-supervised" | "graph attention" | "codec forensic";
  spoofProbability: number;
  confidence: number;
  verdict: "bonafide" | "spoof" | "review";
};

export type ActiveScreen = "call" | "proof" | "security" | "receipt" | "reasoning" | "honeypot" | "patterns" | "redteam" | "diarization" | "arena" | "compliance" | "audit" | "privacy";
