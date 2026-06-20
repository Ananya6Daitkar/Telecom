import type { FeatureVector, Scenario } from "./types";

const simulatedFeatures: Record<Exclude<Scenario, "idle" | "live">, FeatureVector> = {
  normal: { spectralFlux: 0.12, prosodyScore: 0.91, microPauseScore: 0.88, vocalAge: 38, stressLevel: 0.2, speakerConsistency: 0.95 },
  cloned: { spectralFlux: 0.87, prosodyScore: 0.23, microPauseScore: 0.08, vocalAge: 38, stressLevel: 0.1, speakerConsistency: 0.71 },
  scam: { spectralFlux: 0.91, prosodyScore: 0.19, microPauseScore: 0.05, vocalAge: 42, stressLevel: 0.15, speakerConsistency: 0.68 },
  returning: { spectralFlux: 0.89, prosodyScore: 0.21, microPauseScore: 0.06, vocalAge: 42, stressLevel: 0.14, speakerConsistency: 0.66 },
  ceo_fake: { spectralFlux: 0.83, prosodyScore: 0.31, microPauseScore: 0.11, vocalAge: 52, stressLevel: 0.08, speakerConsistency: 0.59 }
};

export function extractFeatures(audioLevel: number, isSimulated: boolean, scenario: Scenario): FeatureVector {
  if (isSimulated && scenario !== "idle" && scenario !== "live") {
    return simulatedFeatures[scenario];
  }

  const level = Math.min(1, Math.max(0, audioLevel));
  return {
    spectralFlux: Math.min(1, 0.18 + level * 0.32),
    prosodyScore: Math.max(0.35, 0.82 - level * 0.18),
    microPauseScore: Math.max(0.25, 0.74 - level * 0.12),
    vocalAge: 36 + Math.round(level * 18),
    stressLevel: Math.min(1, level * 0.7),
    speakerConsistency: Math.max(0.55, 0.92 - level * 0.2)
  };
}
