"use client";

import benchmark from "@/public/benchmark/audio-deepfake-subset.json";
import type { LiveAudioSpoofReport } from "./types";

type Source = LiveAudioSpoofReport["source"];
type AudioContextWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function std(values: number[]) {
  const m = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - m) ** 2)));
}

function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-value));
}

function frameFeatures(samples: Float32Array, sampleRate: number) {
  const frameSize = Math.min(2048, samples.length);
  const hop = Math.max(512, Math.floor(frameSize / 2));
  const frames: Array<{ rms: number; zcr: number; roughness: number; peak: number }> = [];

  for (let start = 0; start + frameSize <= samples.length && frames.length < 48; start += hop * 8) {
    let energy = 0;
    let zeroCrossings = 0;
    let diff = 0;
    let previous = samples[start] ?? 0;
    let peak = 0;

    for (let i = 0; i < frameSize; i += 1) {
      const value = samples[start + i] ?? 0;
      energy += value * value;
      peak = Math.max(peak, Math.abs(value));
      if ((value >= 0 && previous < 0) || (value < 0 && previous >= 0)) zeroCrossings += 1;
      diff += Math.abs(value - previous);
      previous = value;
    }

    frames.push({
      rms: Math.sqrt(energy / frameSize),
      zcr: zeroCrossings / frameSize,
      roughness: diff / frameSize,
      peak
    });
  }

  return { frames, sampleRate };
}

function monoSamples(buffer: AudioBuffer) {
  const samples = new Float32Array(buffer.length);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i += 1) samples[i] += data[i] / buffer.numberOfChannels;
  }
  return samples;
}

function vectorFromAudio(buffer: AudioBuffer) {
  const samples = monoSamples(buffer);
  const { frames, sampleRate } = frameFeatures(samples, buffer.sampleRate);
  const rms = frames.map((frame) => frame.rms);
  const zcr = frames.map((frame) => frame.zcr);
  const roughness = frames.map((frame) => frame.roughness);
  const peak = frames.map((frame) => frame.peak);
  const durationSeconds = buffer.duration;
  const rmsMean = mean(rms);

  return {
    durationSeconds,
    sampleRate,
    vector: [
      Math.log10(durationSeconds + 0.01),
      Math.log10(rmsMean + 0.000001),
      Math.log10(std(rms) + 0.000001),
      mean(zcr),
      std(zcr),
      mean(roughness),
      mean(peak),
      mean(peak) / Math.max(0.00001, rmsMean),
      sampleRate / 24000
    ]
  };
}

function scoreVector(vector: number[]) {
  const model = benchmark.baselineModel;
  const scaled = vector.map((value, index) => (value - model.scaler.meanValues[index]) / model.scaler.stdValues[index]);
  const linear = scaled.reduce((sum, value, index) => sum + value * model.weights[index], model.bias);
  return sigmoid(linear);
}

function verdictFor(score: number, threshold: number): LiveAudioSpoofReport["verdict"] {
  if (Math.abs(score - threshold) < 0.08) return "review";
  return score >= threshold ? "spoof" : "bonafide";
}

export async function analyzeAudioSpoof(blob: Blob, source: Source): Promise<LiveAudioSpoofReport> {
  if (typeof window === "undefined") throw new Error("Audio spoof analysis runs in the browser.");
  const audioWindow = window as AudioContextWindow;
  const AudioContextClass = audioWindow.AudioContext || audioWindow.webkitAudioContext;
  if (!AudioContextClass) throw new Error("Web Audio API is unavailable in this browser.");

  const audioContext = new AudioContextClass();
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const { vector, durationSeconds, sampleRate } = vectorFromAudio(audioBuffer);
    const score = scoreVector(vector);
    const threshold = benchmark.baselineModel.threshold;

    return {
      score,
      verdict: verdictFor(score, threshold),
      threshold,
      accuracy: benchmark.metrics.accuracy,
      eer: benchmark.metrics.eer,
      source,
      durationSeconds,
      sampleRate,
      evaluatedAt: new Date().toISOString()
    };
  } finally {
    await audioContext.close().catch(() => undefined);
  }
}
