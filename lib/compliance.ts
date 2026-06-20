import type { ComplianceMode } from "./types";

export const complianceConfigs: Record<ComplianceMode, { consentText: string; englishText?: string; recordingAllowed: boolean; honeypotAllowed: boolean; dataRetentionDays: number }> = {
  TRAI: {
    consentText: "Yeh call dharohar fraud detection ke liye AI se analyze ki ja sakti hai. TRAI niyamon ke anusaar.",
    englishText: "This call may be analyzed by AI for fraud detection under TRAI regulations.",
    recordingAllowed: true,
    honeypotAllowed: true,
    dataRetentionDays: 90
  },
  FCC: {
    consentText: "AI fraud detection active under FCC consumer protection guidelines.",
    recordingAllowed: true,
    honeypotAllowed: true,
    dataRetentionDays: 180
  },
  GDPR: {
    consentText: "Fraud analysis under GDPR Art. 6(1)(f). No raw audio stored. Right to object applies.",
    recordingAllowed: false,
    honeypotAllowed: false,
    dataRetentionDays: 30
  },
  RBI: {
    consentText: "This call is monitored for fraud under RBI circular on digital payment security.",
    recordingAllowed: true,
    honeypotAllowed: true,
    dataRetentionDays: 365
  }
};
