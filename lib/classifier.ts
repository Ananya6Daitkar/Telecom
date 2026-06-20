import type { EmotionalRadar, FeatureVector } from "./types";
import { keywordBanks } from "./emotional-radar";

export function voiceAuthenticityScore(features: FeatureVector): number {
  const score =
    features.prosodyScore * 0.35 +
    features.microPauseScore * 0.3 +
    (1 - features.spectralFlux) * 0.25 +
    features.speakerConsistency * 0.1;
  return Math.min(1, Math.max(0, score));
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function scamIntentScore(transcript: string): number {
  const allKeywords = [
    ...keywordBanks.urgency,
    ...keywordBanks.authority,
    ...keywordBanks.payment,
    ...keywordBanks.fear,
    ...keywordBanks.isolation
  ];
  const lower = transcript.toLowerCase();
  const matchCount = allKeywords.filter((keyword) => lower.includes(keyword.toLowerCase())).length;
  const transcriptWordCount = Math.max(1, transcript.trim().split(/\s+/).length);
  return sigmoid((matchCount / transcriptWordCount) * 15);
}

export function combinedTrustScore(voiceScore: number, intentScore: number) {
  const score = voiceScore * 0.6 + (1 - intentScore) * 0.4;
  const label = score > 0.75 ? "safe" : score > 0.45 ? "suspicious" : "danger";
  const color = label === "safe" ? "#22C55E" : label === "suspicious" ? "#F59E0B" : "#EF4444";
  const reasoning = [
    voiceScore < 0.35 ? "Spectral anomaly detected — prosody unnatural" : "Voice cadence matches expected human speech",
    intentScore > 0.65 ? "Transcript contains urgency, authority, payment, or isolation pressure" : "No coercive scam language detected",
    score <= 0.45 ? "Combined voice and intent risk crosses automatic intervention threshold" : "Combined trust remains above danger threshold"
  ];

  return { score, label, color, reasoning };
}

export function radarPeak(radar: EmotionalRadar): string {
  return Object.entries(radar).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "none";
}
