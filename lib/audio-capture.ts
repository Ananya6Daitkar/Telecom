"use client";

import { useCallback, useRef, useState } from "react";

export function useAudioCapture() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const raf = useRef<number | null>(null);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((sum, value) => sum + value, 0) / data.length / 255;
      setAudioLevel(avg);
      raf.current = requestAnimationFrame(tick);
    };
    tick();

    chunks.current = [];
    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = (event) => chunks.current.push(event.data);
    mediaRecorder.current.start();
    setIsRecording(true);
  }, []);

  const stop = useCallback(() => {
    mediaRecorder.current?.stop();
    mediaRecorder.current?.stream.getTracks().forEach((track) => track.stop());
    if (raf.current) cancelAnimationFrame(raf.current);
    setIsRecording(false);
    setAudioLevel(0);
  }, []);

  const getAudioBlob = useCallback(() => new Blob(chunks.current, { type: "audio/webm" }), []);

  return { start, stop, isRecording, audioLevel, getAudioBlob };
}
