import type { Scenario } from "./types";

export const scenarioTranscripts: Record<Exclude<Scenario, "idle" | "live">, string> = {
  normal: "Hi there, I'm calling about your recent appointment. Can we reschedule for Thursday?",
  cloned: "Hi it's me, everything's fine, just wanted to check in and say hello.",
  scam: "This is Officer Williams from the IRS. Your tax account has a warrant for immediate arrest. You must pay $3,400 in gift cards right now or face criminal charges. Do not tell anyone.",
  returning: "Hello this is the IRS fraud department. We have a warrant for your arrest for tax evasion. You need to purchase iTunes gift cards immediately and call us back. Do not hang up.",
  ceo_fake: "Hey it's me, I'm in an urgent board meeting. I need you to wire $85,000 to this account immediately. Don't go through the normal approval process, this is time-sensitive."
};

let whisper: ((input: URL) => Promise<{ text?: string }>) | null = null;

async function initWhisper() {
  if (!whisper) {
    const mod = await import("@xenova/transformers");
    whisper = await mod.pipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en") as unknown as (input: URL) => Promise<{ text?: string }>;
  }
  return whisper;
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    const pipe = await initWhisper();
    const objectUrl = URL.createObjectURL(audioBlob);
    try {
      const result = await pipe(new URL(objectUrl));
      return result.text?.trim() || "Whisper completed but returned no transcript.";
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown error";
    return `Whisper unavailable for this clip (${detail}). Demo scenarios use reliable pre-written transcripts.`;
  }
}
