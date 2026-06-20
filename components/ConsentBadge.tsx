"use client";

import { ShieldCheck, ShieldQuestion } from "lucide-react";
import type { ConsentCertificate } from "@/lib/types";

export function ConsentBadge({ certificate }: { certificate: ConsentCertificate | null }) {
  if (!certificate) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/55">
        <ShieldQuestion className="h-3.5 w-3.5" />
        No consent certificate
      </div>
    );
  }

  const verified = certificate.verificationStatus === "verified";
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${verified ? "border-mint/25 bg-mint/10 text-mint" : "border-white/10 bg-white/[0.04] text-white/55"}`}>
      {verified ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldQuestion className="h-3.5 w-3.5" />}
      {certificate.callerName} · {verified ? "verified" : "unverified"}
    </div>
  );
}
