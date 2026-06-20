import type { ArenaModelScore, Scenario } from "./types";

const modelFamilies: Array<Pick<ArenaModelScore, "model" | "family">> = [
  { model: "AASIST", family: "graph attention" },
  { model: "RawNet2", family: "raw waveform" },
  { model: "RawGatST", family: "graph attention" },
  { model: "WavLM ECAPA", family: "self-supervised" },
  { model: "HuBERT ECAPA", family: "self-supervised" },
  { model: "Wav2Vec2 AASIST", family: "self-supervised" },
  { model: "TCM", family: "codec forensic" },
  { model: "Nes2Net-X", family: "codec forensic" }
];

const scenarioBase: Record<Scenario, number> = {
  idle: 0.08,
  live: 0.18,
  normal: 0.04,
  cloned: 0.86,
  scam: 0.91,
  returning: 0.94,
  ceo_fake: 0.88
};

function clamp(value: number): number {
  return Math.min(0.99, Math.max(0.01, value));
}

export function speechDeepfakeArenaVerdict(scenario: Scenario, voiceAuthScore: number): ArenaModelScore[] {
  const base = scenarioBase[scenario];
  return modelFamilies.map((entry, index) => {
    const modelBias = (index - 3.5) * 0.018;
    const voicePenalty = (1 - voiceAuthScore) * 0.16;
    const spoofProbability = clamp(base * 0.84 + voicePenalty + modelBias);
    const confidence = clamp(0.74 + Math.abs(spoofProbability - 0.5) * 0.42 + (index % 3) * 0.015);
    const verdict = spoofProbability > 0.68 ? "spoof" : spoofProbability > 0.38 ? "review" : "bonafide";
    return {
      ...entry,
      spoofProbability,
      confidence,
      verdict
    };
  });
}

export function arenaConsensus(scores: ArenaModelScore[]) {
  const spoofVotes = scores.filter((score) => score.verdict === "spoof").length;
  const reviewVotes = scores.filter((score) => score.verdict === "review").length;
  const averageSpoof = scores.reduce((sum, score) => sum + score.spoofProbability, 0) / Math.max(1, scores.length);
  return {
    spoofVotes,
    reviewVotes,
    averageSpoof,
    label: spoofVotes >= 5 ? "synthetic consensus" : reviewVotes >= 3 ? "manual review" : "bonafide consensus"
  };
}
