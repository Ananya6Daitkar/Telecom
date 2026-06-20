const DEFAULT_WARNING =
  "This call has been flagged by VoxHalo. Please verify the caller's identity before sharing any personal or payment information.";

function chooseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const preferred = voices.find((voice) =>
    /samantha|victoria|karen|zira|natural|enhanced|google us english/i.test(voice.name)
  );
  return preferred ?? voices.find((voice) => /^en[-_]/i.test(voice.lang)) ?? voices[0] ?? null;
}

export function injectCallWarning(message = DEFAULT_WARNING): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    const voice = chooseVoice(window.speechSynthesis.getVoices());
    if (voice) utterance.voice = voice;
    utterance.rate = 0.92;
    utterance.pitch = 0.96;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}
