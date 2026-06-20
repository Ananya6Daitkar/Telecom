"use client";

import { motion } from "framer-motion";
import { FileAudio, Loader2, Mic, Square, WandSparkles } from "lucide-react";
import { useState } from "react";
import { useAudioCapture } from "@/lib/audio-capture";
import { analyzeAudioSpoof } from "@/lib/live-audio-spoof";
import { transcribeAudio } from "@/lib/speech-to-text";
import { useAegisStore } from "@/lib/store";
import type { LiveAudioSpoofReport } from "@/lib/types";

export function LiveMicPanel() {
  const { start, stop, isRecording, audioLevel, getAudioBlob } = useAudioCapture();
  const analyzeLiveTranscript = useAegisStore((s) => s.analyzeLiveTranscript);
  const setLiveAudioSpoofReport = useAegisStore((s) => s.setLiveAudioSpoofReport);
  const liveAudioSpoofReport = useAegisStore((s) => s.liveAudioSpoofReport);
  const recordingAllowed = useAegisStore((s) => s.isRecordingAllowed());
  const [status, setStatus] = useState<"idle" | "recording" | "transcribing" | "ready" | "error">("idle");
  const [detectorStatus, setDetectorStatus] = useState<"idle" | "analyzing" | "ready" | "error">("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [detectorError, setDetectorError] = useState<string | null>(null);

  async function runSpoofDetector(blob: Blob, source: LiveAudioSpoofReport["source"]) {
    setDetectorStatus("analyzing");
    setDetectorError(null);
    try {
      const report = await analyzeAudioSpoof(blob, source);
      setLiveAudioSpoofReport(report);
      setDetectorStatus("ready");
      return report;
    } catch (err) {
      setDetectorStatus("error");
      setDetectorError(err instanceof Error ? err.message : "Audio spoof detector failed");
      return null;
    }
  }

  async function transcribeBlob(blob: Blob, level = 0.42, source: LiveAudioSpoofReport["source"] = "upload") {
    setStatus("transcribing");
    const [text] = await Promise.all([
      transcribeAudio(blob),
      runSpoofDetector(blob, source)
    ]);
    setTranscript(text);
    analyzeLiveTranscript(text, level);
    setStatus("ready");
  }

  async function startRecording() {
    if (!recordingAllowed) {
      setStatus("error");
      setError("Recording is blocked by the active compliance mode. Switch to TRAI, FCC, or RBI to test live mic capture.");
      return;
    }
    try {
      setError(null);
      setTranscript("");
      setStatus("recording");
      await start();
    } catch (err) {
      setStatus("error");
      const detail = err instanceof Error ? err.message : "Microphone permission failed";
      setError(`${detail}. Use the upload/demo audio fallback below, or allow microphone access for 127.0.0.1 in browser site settings.`);
    }
  }

  async function stopAndTranscribe() {
    try {
      setStatus("transcribing");
      stop();
      await new Promise((resolve) => window.setTimeout(resolve, 450));
      const blob = getAudioBlob();
      await transcribeBlob(blob, audioLevel || 0.42, "microphone");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Whisper transcription failed");
    }
  }

  async function transcribePublicSample(path: string, level: number) {
    try {
      setError(null);
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Unable to load ${path}`);
      await transcribeBlob(await response.blob(), level, path.includes("cloned") ? "demo-clone" : "demo-real");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Sample transcription failed");
    }
  }

  async function transcribeUpload(file: File | null) {
    if (!file) return;
    if (!recordingAllowed) {
      setStatus("error");
      setError("Audio upload analysis is blocked by the active compliance mode.");
      return;
    }
    try {
      setError(null);
      await transcribeBlob(file, 0.5, "upload");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Uploaded audio transcription failed");
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-white/45">Live Mic + Whisper</div>
          <h3 className="mt-1 text-xl font-semibold">Record a call snippet</h3>
        </div>
        <div className={`rounded-full border px-3 py-1 text-xs capitalize ${status === "recording" ? "border-red-400/30 bg-red-500/10 text-red-100" : status === "ready" ? "border-mint/25 bg-mint/10 text-mint" : status === "transcribing" ? "border-cyan/25 bg-cyan/10 text-cyan" : "border-white/10 bg-white/[0.04] text-white/55"}`}>
          {status}
        </div>
      </div>

      <div className="mt-5 flex items-end gap-1">
        {Array.from({ length: 24 }, (_, index) => (
          <motion.span
            key={index}
            animate={{ height: isRecording ? 10 + Math.abs(Math.sin(index + audioLevel * 14)) * 34 + audioLevel * 48 : 12 }}
            className="w-1 flex-1 rounded-full bg-cyan/55"
          />
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-mint/20 bg-mint/10 p-3 text-sm text-white/65">
        <span className="font-medium text-mint">Live audio spoof detector armed.</span> Mic, upload, and demo samples run the same acoustic baseline used in the dataset subset benchmark.
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {!isRecording ? (
          <button type="button" disabled={!recordingAllowed} onClick={() => void startRecording()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan/25 bg-cyan/10 px-4 py-3 text-sm font-medium text-cyan transition hover:bg-cyan/15 disabled:cursor-not-allowed disabled:opacity-45">
            <Mic className="h-4 w-4" />
            Start live mic
          </button>
        ) : (
          <button type="button" onClick={() => void stopAndTranscribe()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-medium text-coral transition hover:bg-coral/15">
            <Square className="h-4 w-4" />
            Stop and transcribe
          </button>
        )}

        <button
          type="button"
          disabled={!transcript || status === "transcribing"}
          onClick={() => analyzeLiveTranscript(transcript, audioLevel || 0.42)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {status === "transcribing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
          Analyze transcript
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75 transition hover:bg-white/[0.08] ${recordingAllowed ? "cursor-pointer" : "cursor-not-allowed opacity-45"}`}>
          <FileAudio className="h-4 w-4" />
          Upload audio
          <input
            type="file"
            accept="audio/*,video/mp4"
            className="sr-only"
            onChange={(event) => void transcribeUpload(event.target.files?.[0] ?? null)}
            disabled={!recordingAllowed}
          />
        </label>
        <button type="button" onClick={() => void transcribePublicSample("/demo-audio/real-voice.mp4", 0.28)} className="rounded-lg border border-mint/25 bg-mint/10 px-4 py-3 text-sm text-mint transition hover:bg-mint/15">
          Analyze real sample
        </button>
        <button type="button" onClick={() => void transcribePublicSample("/demo-audio/cloned-voice.mpeg", 0.72)} className="rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral transition hover:bg-coral/15">
          Analyze clone sample
        </button>
      </div>

      {transcript ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/70">
          <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/35">Whisper transcript</div>
          {transcript}
        </div>
      ) : null}

      {liveAudioSpoofReport ? (
        <div className="mt-4 rounded-lg border border-mint/20 bg-mint/10 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-mint">Live audio spoof detector</div>
              <div className="mt-1 text-sm text-white/55">Same acoustic baseline as the dataset subset benchmark.</div>
            </div>
            <div className={`rounded-full border px-3 py-1 text-xs capitalize ${liveAudioSpoofReport.verdict === "spoof" ? "border-red-400/30 bg-red-500/10 text-red-100" : liveAudioSpoofReport.verdict === "review" ? "border-amber/30 bg-amber/10 text-amber" : "border-mint/25 bg-mint/10 text-mint"}`}>
              {liveAudioSpoofReport.verdict}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="text-xs text-white/45">Spoof probability</div>
              <div className="mt-1 text-xl font-semibold">{Math.round(liveAudioSpoofReport.score * 100)}%</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="text-xs text-white/45">Benchmark accuracy</div>
              <div className="mt-1 text-xl font-semibold">{Math.round(liveAudioSpoofReport.accuracy * 1000) / 10}%</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="text-xs text-white/45">Benchmark EER</div>
              <div className="mt-1 text-xl font-semibold">{Math.round(liveAudioSpoofReport.eer * 1000) / 10}%</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="text-xs text-white/45">Source</div>
              <div className="mt-1 text-xl font-semibold capitalize">{liveAudioSpoofReport.source.replace("-", " ")}</div>
            </div>
          </div>
        </div>
      ) : detectorStatus === "analyzing" ? (
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan/20 bg-cyan/10 px-4 py-3 text-sm text-cyan">
          <Loader2 className="h-4 w-4 animate-spin" />
          Computing live audio spoof probability...
        </div>
      ) : null}

      {error ? <div className="mt-4 rounded-lg border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-100">{error}</div> : null}
      {detectorError ? <div className="mt-4 rounded-lg border border-amber/25 bg-amber/10 p-3 text-sm text-amber">Detector note: {detectorError}</div> : null}
    </div>
  );
}
