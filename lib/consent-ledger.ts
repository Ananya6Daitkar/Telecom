import type { ConsentCertificate } from "./types";

async function sign(callerId: string, purpose: string, issuedAt: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    return `${callerId}-${issuedAt}`.replace(/\W/g, "").slice(0, 28);
  }
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(callerId + purpose + issuedAt));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function demoCertificates(): Promise<ConsentCertificate[]> {
  const issuedAt = "2026-06-17T09:00:00.000Z";
  const verifiedPurpose = "Fraud alert follow-up on account ending 4521";
  const unverifiedPurpose = "Collections escalation";
  return [
    {
      id: "cert-hdfc",
      callerId: "+912212345678",
      callerName: "HDFC Bank",
      declaredPurpose: verifiedPurpose,
      verificationStatus: "verified",
      issuedAt,
      signature: await sign("+912212345678", verifiedPurpose, issuedAt)
    },
    {
      id: "cert-irs",
      callerId: "+18005551234",
      callerName: "IRS Collections",
      declaredPurpose: unverifiedPurpose,
      verificationStatus: "unverified",
      issuedAt,
      signature: await sign("+18005551234", unverifiedPurpose, issuedAt)
    }
  ];
}
