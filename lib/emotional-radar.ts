import type { EmotionalRadar } from "./types";

export const keywordBanks = {
  urgency: ["immediately", "right now", "today", "expires", "last chance", "urgent", "within the hour", "minutes", "deadline", "before it's too late", "act now", "no time"],
  authority: ["officer", "detective", "IRS", "FBI", "CBI", "ED", "police", "Medicare", "Social Security", "bank security", "RBI", "government", "legal department", "court order"],
  payment: ["gift card", "wire transfer", "crypto", "bitcoin", "zelle", "google play", "amazon card", "prepaid card", "send money", "transfer funds", "pay now", "account number"],
  fear: ["arrested", "warrant", "lawsuit", "suspended", "frozen", "criminal charges", "seized", "deported", "prison", "jail", "legal action", "sue", "prosecute"],
  isolation: ["don't tell", "keep this private", "confidential", "between us", "don't mention", "don't discuss", "secret", "no one else", "hang up and call", "verify separately"],
  guilt: ["you owe", "responsible", "your fault", "caused this", "failed to", "negligent", "liability", "you must pay", "obligation"]
} as const;

function countMatches(transcript: string, bank: readonly string[]): number {
  const lower = transcript.toLowerCase();
  return bank.reduce((count, keyword) => count + (lower.includes(keyword.toLowerCase()) ? 1 : 0), 0);
}

function dimensionScore(transcript: string, bank: readonly string[]): number {
  return Math.min(100, Math.round((countMatches(transcript, bank) / Math.max(1, Math.min(bank.length, 5))) * 100));
}

export function emotionalRadar(transcript: string): EmotionalRadar {
  const raw = analyzeEmotionalTactics(transcript);
  return {
    fear: raw.fear / 100,
    urgency: raw.urgency / 100,
    authority: raw.authority / 100,
    isolation: raw.isolation / 100,
    guilt: raw.guilt / 100
  };
}

export function analyzeEmotionalTactics(transcript: string): EmotionalRadar {
  return {
    fear: dimensionScore(transcript, keywordBanks.fear),
    urgency: dimensionScore(transcript, keywordBanks.urgency),
    authority: dimensionScore(transcript, keywordBanks.authority),
    isolation: dimensionScore(transcript, keywordBanks.isolation),
    guilt: dimensionScore(transcript, keywordBanks.guilt)
  };
}
