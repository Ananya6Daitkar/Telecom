"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type GuardianStatus = "idle" | "alert" | "resolved-safe" | "resolved-help";
export type GuardianOutcome = "safe" | "help";

type ThreatEventDetail = {
  trustScore: number;
  threshold: number;
  firedAt: string;
};

export function useGuardianAlert(trustScore: number, threshold = 40) {
  const [status, setStatus] = useState<GuardianStatus>("idle");
  const hasFiredForCrossing = useRef(false);

  useEffect(() => {
    const isThreat = trustScore < threshold;

    if (isThreat && !hasFiredForCrossing.current) {
      hasFiredForCrossing.current = true;
      setStatus("alert");

      if (typeof window !== "undefined") {
        const detail: ThreatEventDetail = {
          trustScore,
          threshold,
          firedAt: new Date().toISOString()
        };
        window.dispatchEvent(new CustomEvent<ThreatEventDetail>("sentinel:threat", { detail }));
      }
    }

    if (!isThreat) {
      hasFiredForCrossing.current = false;
      setStatus("idle");
    }
  }, [threshold, trustScore]);

  const resolve = useCallback((outcome: GuardianOutcome) => {
    setStatus(outcome === "safe" ? "resolved-safe" : "resolved-help");
  }, []);

  const reset = useCallback(() => {
    hasFiredForCrossing.current = false;
    setStatus("idle");
  }, []);

  return { status, resolve, reset };
}
