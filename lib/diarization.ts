import type { Speaker } from "./types";

export const ceoDeepfakeSpeakers: Speaker[] = [
  { id: "A", label: "You", trustScore: 0.94, voiceAuthScore: 0.96, isSynthetic: false, speakingTime: 45 },
  { id: "B", label: "CEO (deepfake)", trustScore: 0.18, voiceAuthScore: 0.14, isSynthetic: true, speakingTime: 38 },
  { id: "C", label: "CFO", trustScore: 0.91, voiceAuthScore: 0.89, isSynthetic: false, speakingTime: 22 }
];

export const ceoDeepfakeAlert = "Synthetic voice detected in participant 'CEO' — do not authorise wire transfer";
