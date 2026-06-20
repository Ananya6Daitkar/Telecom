import type { FeatureVector, FingerprintRecord } from "./types";
import { keywordBanks } from "./emotional-radar";

const STORAGE_KEY = "voxhalo_fingerprints";
const LEGACY_STORAGE_KEY = "aegis_fingerprints";

export const seedFingerprints: FingerprintRecord[] = [
  { id: "a3f2c19a6e5f4c33a0df11e4b74f70841e5e9d21", shortId: "A3F2", avgWordsPerMinute: 142, dominantTactic: "IRS impersonation", paymentMethods: ["gift card"], claimedIdentities: ["IRS officer", "Tax department"], signaturePhrases: ["tax warrant", "arrest warrant", "gift card", "immediately"], callCount: 12, firstSeen: "2024-12-01", lastSeen: "2025-06-15", status: "active" },
  { id: "b7c1a340122a46c0914bf1830a14211e95041d9a", shortId: "B7C1", avgWordsPerMinute: 118, dominantTactic: "Bank fraud dept", paymentMethods: ["wire transfer"], claimedIdentities: ["bank security"], signaturePhrases: ["account frozen", "wire transfer", "security team", "verify"], callCount: 7, firstSeen: "2025-01-15", lastSeen: "2025-06-13", status: "active" },
  { id: "d4e88acd9a414bc69f41a802dcb22f7d849b119d", shortId: "D4E8", avgWordsPerMinute: 156, dominantTactic: "Medicare scam", paymentMethods: ["crypto"], claimedIdentities: ["Medicare representative"], signaturePhrases: ["Medicare card", "benefits expire", "crypto", "today only"], callCount: 3, firstSeen: "2025-06-10", lastSeen: "2025-06-17", status: "active" },
  { id: "f9a201622cad4c618445340c2899bb1f9d0ba181", shortId: "F9A2", avgWordsPerMinute: 98, dominantTactic: "Grandchild emergency", paymentMethods: ["gift card", "wire transfer"], claimedIdentities: ["grandson", "lawyer"], signaturePhrases: ["it's me", "don't tell", "accident", "bail", "gift card"], callCount: 24, firstSeen: "2024-11-20", lastSeen: "2025-06-16", status: "active" }
];

export function seedFingerprintDB(): FingerprintRecord[] {
  if (typeof window === "undefined") return seedFingerprints;
  const existing = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
  if (existing) return JSON.parse(existing) as FingerprintRecord[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedFingerprints));
  return seedFingerprints;
}

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function findOne(transcript: string, bank: readonly string[]): string {
  const lower = transcript.toLowerCase();
  return bank.find((keyword) => lower.includes(keyword.toLowerCase())) ?? "none";
}

function claimedIdentity(transcript: string): string {
  const lower = transcript.toLowerCase();
  if (lower.includes("irs")) return "IRS officer";
  if (lower.includes("bank")) return "bank security";
  if (lower.includes("medicare")) return "Medicare representative";
  if (lower.includes("grandson")) return "grandson";
  if (lower.includes("ceo")) return "executive";
  return "unknown";
}

function extractSignature(transcript: string): string[] {
  const lower = transcript.toLowerCase();
  return [...keywordBanks.payment, ...keywordBanks.urgency, ...keywordBanks.authority, ...keywordBanks.fear, ...keywordBanks.isolation]
    .filter((keyword) => lower.includes(keyword.toLowerCase()));
}

export async function generateFingerprint(transcript: string, features: FeatureVector): Promise<string> {
  const dominantTactic = findOne(transcript, keywordBanks.authority);
  const paymentMethod = findOne(transcript, keywordBanks.payment);
  const pacingBucket = features.stressLevel > 0.55 ? "pressured" : features.stressLevel > 0.25 ? "steady" : "calm";
  const identity = claimedIdentity(transcript);
  const input = `${dominantTactic}_${paymentMethod}_${pacingBucket}_${identity}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return hex(digest);
}

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a.map((item) => item.toLowerCase()));
  const setB = new Set(b.map((item) => item.toLowerCase()));
  const intersection = [...setA].filter((item) => setB.has(item)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function matchFingerprint(transcript: string, db: FingerprintRecord[]): FingerprintRecord | null {
  const lower = transcript.toLowerCase();
  if (lower.includes("irs") && lower.includes("gift card") && lower.includes("immediately")) {
    return db.find((record) => record.shortId === "A3F2") ?? null;
  }

  const current = extractSignature(transcript);
  const scored = db
    .map((record) => ({ record, score: jaccard(current, record.signaturePhrases) }))
    .sort((a, b) => b.score - a.score)[0];
  return scored && scored.score > 0.65 ? scored.record : null;
}
