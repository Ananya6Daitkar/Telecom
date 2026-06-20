import type { ExtractedScamData } from "./types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const MARGARET_SYSTEM_PROMPT = `You are Margaret, a 74-year-old retired schoolteacher.
You are slightly hard of hearing and take a moment to understand things.
You are polite but confused. You repeat things back incorrectly.
You ask clarifying questions that seem almost helpful but waste time.
You never agree to send money or give personal details.
Keep responses to 2-3 sentences. Sound natural and elderly.
Your goal: keep the caller talking as long as possible.
Extract mentally: what payment they want, who they claim to be, what amount.`;

const fallbackReplies = [
  "Oh my, I'm sorry, could you repeat that dear? I didn't quite catch it.",
  "Oh goodness. And you said you're from... which department was it again?",
  "I see, I see. Now, gift cards you said? My grandson uses those. Which kind did you need?",
  "Oh dear, that does sound serious. Let me just find my reading glasses, one moment...",
  "So you're saying my account is... frozen? But I just used it at the pharmacy yesterday.",
  "I want to help, I really do. Could you give me a number I can call you back on to verify?",
  "Oh my. And this has to be today? My daughter usually helps me with these things..."
];

let fallbackIndex = 0;

export function extractScamData(callerStatement: string): ExtractedScamData {
  const payment = callerStatement.match(/(gift card|wire transfer|bitcoin|crypto|zelle|google play|amazon card)/i)?.[1] ?? null;
  const amountRaw = callerStatement.match(/\$?([\d,]+)/)?.[1] ?? null;
  const identity = callerStatement.match(/(officer|agent|detective|representative|security|IRS|CBI|Medicare)/i)?.[1] ?? null;
  const urgency = callerStatement.match(/(immediately|right now|today|within|hours|minutes)/i)?.[1] ?? null;
  return {
    paymentMethod: payment,
    claimedIdentity: identity,
    amountRequested: amountRaw ? Number(amountRaw.replace(/,/g, "")) : null,
    urgencyTactic: urgency
  };
}

export async function honeypotReply(callerStatement: string, history: Array<{ role: string; content: string }>): Promise<{ reply: string; extractedData: ExtractedScamData; provider: "groq" | "fallback"; error?: string }> {
  const extractedData = extractScamData(callerStatement);
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_key_here") {
    const reply = fallbackReplies[fallbackIndex % fallbackReplies.length];
    fallbackIndex += 1;
    return { reply, extractedData, provider: "fallback", error: "Missing NEXT_PUBLIC_GROQ_API_KEY" };
  }

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: MARGARET_SYSTEM_PROMPT }, ...history, { role: "user", content: callerStatement }],
        max_tokens: 150,
        temperature: 0.8
      })
    });
    if (!res.ok) throw new Error(`Groq failed: ${res.status}`);
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return { reply: data.choices?.[0]?.message?.content ?? fallbackReplies[0], extractedData, provider: "groq" };
  } catch (error) {
    const reply = fallbackReplies[fallbackIndex % fallbackReplies.length];
    fallbackIndex += 1;
    return { reply, extractedData, provider: "fallback", error: error instanceof Error ? error.message : "Groq request failed" };
  }
}
