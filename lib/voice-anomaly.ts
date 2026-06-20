import type { FeatureVector, VoiceAnomalyReport } from "./types";

const relationshipRanges: Array<{ terms: string[]; label: string; range: [number, number] }> = [
  { terms: ["grandson", "granddaughter"], label: "grandson", range: [18, 32] },
  { terms: ["son", "daughter"], label: "son", range: [22, 50] },
  { terms: ["irs officer", "cbi officer", "bank security", "officer", "security"], label: "bank officer", range: [30, 60] },
  { terms: ["medicare representative"], label: "Medicare representative", range: [25, 55] }
];

const emergencyKeywords = ["emergency", "accident", "arrested", "hospital", "hurt", "danger", "help me", "need you"];
const claimKeywords = ["I'm an officer", "calling from", "official", "representative", "department"];

export function detectAnomalies(features: FeatureVector, transcript: string): VoiceAnomalyReport {
  const lower = transcript.toLowerCase();
  const relationship = relationshipRanges.find((entry) => entry.terms.some((term) => lower.includes(term.toLowerCase())));
  const expectedAgeRange = relationship?.range ?? null;
  const ageAnomaly = expectedAgeRange ? features.vocalAge < expectedAgeRange[0] || features.vocalAge > expectedAgeRange[1] : false;
  const emergencyClaim = emergencyKeywords.some((keyword) => lower.includes(keyword));
  const institutionalClaim = claimKeywords.some((keyword) => lower.includes(keyword.toLowerCase()));
  const stressAnomaly = (emergencyClaim && features.stressLevel < 0.3) || (institutionalClaim && features.stressLevel > 0.7);
  const anomalySummary = [
    ...(ageAnomaly && expectedAgeRange ? [`Estimated voice age ${features.vocalAge} falls outside expected ${expectedAgeRange[0]}-${expectedAgeRange[1]} range`] : []),
    ...(stressAnomaly ? ["Suspiciously calm voice for claimed emergency"] : []),
    ...(features.speakerConsistency < 0.7 ? ["Speaker consistency drift suggests model switching or synthetic artifacts"] : [])
  ];

  return {
    ageAnomaly,
    estimatedAge: features.vocalAge,
    claimedRelationship: relationship?.label ?? null,
    expectedAgeRange,
    stressAnomaly,
    stressDescription: stressAnomaly ? "Stress profile does not match the claimed scenario" : "Stress profile is consistent with the call context",
    anomalySummary
  };
}
