import type { EconomicsState } from "./types";

const KEY = "voxhalo_economics";
const LEGACY_KEY = "aegis_economics";

export const seedEconomics: EconomicsState = {
  callsIntercepted: 1247,
  minutesWasted: 3891,
  operatorsFingerprinted: 89,
  dollarsSaved: 3363300,
  patternsShared: 4420
};

export function loadEconomics(): EconomicsState {
  if (typeof window === "undefined") return seedEconomics;
  const existing = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
  if (!existing) {
    localStorage.setItem(KEY, JSON.stringify(seedEconomics));
    return seedEconomics;
  }
  return JSON.parse(existing) as EconomicsState;
}

export function tickEconomics(current: EconomicsState): EconomicsState {
  const next = {
    ...current,
    callsIntercepted: current.callsIntercepted + 1,
    minutesWasted: current.minutesWasted + Math.floor(Math.random() * 4) + 2,
    dollarsSaved: current.dollarsSaved + Math.floor(Math.random() * 2000) + 500
  };
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
