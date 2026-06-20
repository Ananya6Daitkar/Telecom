import type { AuditEvent, ComplianceMode, ExtractedScamData, FingerprintRecord, HoneypotProvider, LiveAudioSpoofReport, Scenario } from "./types";
import benchmark from "@/public/benchmark/audio-deepfake-subset.json";

export type IncidentReportInput = {
  scenario: Scenario;
  trustScore: number;
  trustLabel: string;
  reasoning: string[];
  complianceMode: ComplianceMode;
  honeypotProvider: HoneypotProvider;
  extractedScamData: ExtractedScamData;
  fingerprintMatch: FingerprintRecord | null;
  liveAudioSpoofReport: LiveAudioSpoofReport | null;
  auditLog: AuditEvent[];
};

export function buildIncidentReport(input: IncidentReportInput) {
  return {
    generatedAt: new Date().toISOString(),
    product: "VoxHalo",
    implementationDisclosure: {
      live: ["Groq honeypot when provider badge says Groq live", "Guardian browser speech synthesis", "Compliance gating", "Local audit log"],
      heuristic: ["Trust scoring", "Scam intent", "Voice anomaly scoring"],
      simulated: ["Speech Arena model-family verdicts", "CEO diarization workflow", "Pattern network economics"],
      seeded: ["Fingerprint database", "Consent certificates", "Demo scenarios"],
      benchmarkStatus: "Audio Deepfake Detection dataset subset evaluated locally with a lightweight acoustic-feature baseline. This is not a trained AASIST/RawNet checkpoint."
    },
    benchmarkEvidence: {
      datasetName: benchmark.datasetName,
      subset: benchmark.subset,
      metrics: benchmark.metrics,
      disclosure: benchmark.disclosure
    },
    privacyBoundary: {
      rawAudioStored: false,
      transcriptsPersistedToDatabase: false,
      groqReceives: "honeypot text only",
      localStorageKeys: ["voxhalo_fingerprints", "voxhalo_economics", "voxhalo_audit_log"]
    },
    incident: {
      scenario: input.scenario,
      trustScorePercent: Math.round(input.trustScore * 100),
      trustLabel: input.trustLabel,
      reasoning: input.reasoning,
      complianceMode: input.complianceMode,
      honeypotProvider: input.honeypotProvider,
      fingerprintMatch: input.fingerprintMatch ? {
        shortId: input.fingerprintMatch.shortId,
        dominantTactic: input.fingerprintMatch.dominantTactic,
        callCount: input.fingerprintMatch.callCount
      } : null,
      extractedScamData: input.extractedScamData,
      liveAudioSpoofReport: input.liveAudioSpoofReport
    },
    auditLog: input.auditLog
  };
}

export function downloadIncidentReport(report: ReturnType<typeof buildIncidentReport>) {
  if (typeof window === "undefined") return;
  const blob = new Blob([buildIncidentPdf(report)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `voxhalo-incident-${Date.now()}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function pdfEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapLine(value: string, max = 92) {
  const words = value.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (`${current} ${word}`.trim().length > max) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function reportLines(report: ReturnType<typeof buildIncidentReport>) {
  const benchmark = report.benchmarkEvidence.metrics;
  const spoof = report.incident.liveAudioSpoofReport;
  const intel = report.incident.extractedScamData;
  const fingerprint = report.incident.fingerprintMatch;
  const audit = report.auditLog.slice(0, 8);

  const lines = [
    "VoxHalo Incident Report",
    `Generated: ${new Date(report.generatedAt).toLocaleString()}`,
    "",
    "Incident Summary",
    `Scenario: ${report.incident.scenario}`,
    `Trust score: ${report.incident.trustScorePercent}% (${report.incident.trustLabel})`,
    `Compliance mode: ${report.incident.complianceMode}`,
    `Honeypot provider: ${report.incident.honeypotProvider}`,
    "",
    "Benchmark Evidence",
    `Dataset: ${report.benchmarkEvidence.datasetName}`,
    `Subset: ${report.benchmarkEvidence.subset.bonafide} bonafide / ${report.benchmarkEvidence.subset.spoof} spoof`,
    `Held-out accuracy: ${Math.round(benchmark.accuracy * 1000) / 10}%`,
    `EER: ${Math.round(benchmark.eer * 1000) / 10}%`,
    report.benchmarkEvidence.disclosure,
    "",
    "Live Audio Detector",
    spoof ? `Spoof probability: ${Math.round(spoof.score * 100)}% (${spoof.verdict}) from ${spoof.source}` : "No live audio spoof report captured yet.",
    "",
    "Extracted Scam Intelligence",
    `Claimed identity: ${intel.claimedIdentity ?? "unknown"}`,
    `Payment method: ${intel.paymentMethod ?? "unknown"}`,
    `Amount requested: ${intel.amountRequested ? `$${intel.amountRequested.toLocaleString()}` : "unknown"}`,
    `Urgency tactic: ${intel.urgencyTactic ?? "unknown"}`,
    "",
    "Returning Operator",
    fingerprint ? `Matched ${fingerprint.shortId}: ${fingerprint.dominantTactic}, ${fingerprint.callCount} known calls` : "No returning operator fingerprint matched.",
    "",
    "Privacy Boundary",
    `Raw audio stored: ${report.privacyBoundary.rawAudioStored ? "yes" : "no"}`,
    `Transcripts persisted to database: ${report.privacyBoundary.transcriptsPersistedToDatabase ? "yes" : "no"}`,
    `Groq receives: ${report.privacyBoundary.groqReceives}`,
    `Local keys: ${report.privacyBoundary.localStorageKeys.join(", ")}`,
    "",
    "Implementation Disclosure",
    `Live: ${report.implementationDisclosure.live.join("; ")}`,
    `Heuristic: ${report.implementationDisclosure.heuristic.join("; ")}`,
    `Simulated: ${report.implementationDisclosure.simulated.join("; ")}`,
    `Seeded: ${report.implementationDisclosure.seeded.join("; ")}`,
    report.implementationDisclosure.benchmarkStatus,
    "",
    "Reasoning",
    ...report.incident.reasoning.slice(0, 6).map((item) => `- ${item}`),
    "",
    "Recent Audit Events",
    ...(audit.length ? audit.map((event) => `- ${new Date(event.timestamp).toLocaleTimeString()}: ${event.label} - ${event.detail}`) : ["No audit events captured."])
  ];

  return lines.flatMap((line) => wrapLine(line));
}

function buildIncidentPdf(report: ReturnType<typeof buildIncidentReport>) {
  const width = 612;
  const height = 792;
  const marginX = 44;
  const startY = 746;
  const lineHeight = 13;
  const linesPerPage = Math.floor((startY - 48) / lineHeight);
  const lines = reportLines(report);
  const pages: string[][] = [];

  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage));
  }

  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(`<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`);

  pages.forEach((pageLines, index) => {
    const pageObjectNumber = 3 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> /Contents ${contentObjectNumber} 0 R >>`);

    const text = pageLines.map((line, lineIndex) => {
      const font = lineIndex === 0 && index === 0 ? "/F2 20 Tf" : line.endsWith("Evidence") || line.endsWith("Summary") || line.endsWith("Detector") || line.endsWith("Intelligence") || line.endsWith("Operator") || line.endsWith("Boundary") || line.endsWith("Disclosure") || line.endsWith("Reasoning") || line.endsWith("Events") ? "/F2 12 Tf" : "/F1 10 Tf";
      const y = startY - lineIndex * lineHeight;
      return `BT ${font} ${marginX} ${y} Td (${pdfEscape(line)}) Tj ET`;
    }).join("\n");

    objects.push(`<< /Length ${text.length} >>\nstream\n${text}\nendstream`);
  });

  const chunks = ["%PDF-1.4\n"];
  const offsets: number[] = [0];
  objects.forEach((object, index) => {
    offsets.push(chunks.join("").length);
    chunks.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
  });

  const xrefOffset = chunks.join("").length;
  chunks.push(`xref\n0 ${objects.length + 1}\n`);
  chunks.push("0000000000 65535 f \n");
  offsets.slice(1).forEach((offset) => {
    chunks.push(`${offset.toString().padStart(10, "0")} 00000 n \n`);
  });
  chunks.push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return chunks.join("");
}
