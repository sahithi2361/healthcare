import { Language } from "../types";

// Speech Synthesis (TTS) Helper
export function speakText(
  text: string,
  language: Language = "en",
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("SpeechSynthesis is not supported in this browser environment.");
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    // Clean markdown / asterisk artifacts for clean speech
    const cleanText = text
      .replace(/[*_#`~[\]]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\n+/g, ". ")
      .trim();

    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Language code selection
    if (language === "te") {
      utterance.lang = "te-IN";
    } else if (language === "hi") {
      utterance.lang = "hi-IN";
    } else {
      utterance.lang = "en-IN";
    }

    utterance.rate = 0.92; // Slightly slower, calm cadence for elderly / low-literacy users
    utterance.pitch = 1.0;

    // Try finding matched voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) =>
        v.lang === utterance.lang ||
        v.lang.startsWith(language) ||
        (language === "te" && v.name.toLowerCase().includes("telugu")) ||
        (language === "hi" && v.name.toLowerCase().includes("hindi"))
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = (e) => {
      console.warn("Speech synthesis error event:", e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error("Failed to execute speech synthesis:", err);
    if (onEnd) onEnd();
    return false;
  }
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

// Speech Recognition (STT) interface
export interface SpeechRecognitionHookResult {
  isListening: boolean;
  transcript: string;
  startListening: (lang?: Language) => void;
  stopListening: () => void;
  isSupported: boolean;
}

export function createSpeechRecognizer(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError?: (error: any) => void,
  onEnd?: () => void
) {
  if (typeof window === "undefined") return null;

  const SpeechRecognitionClass =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    return null;
  }

  try {
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const text = final || interim;
      onResult(text, Boolean(final));
    };

    if (onError) {
      recognition.onerror = onError;
    }

    if (onEnd) {
      recognition.onend = onEnd;
    }

    return recognition;
  } catch (err) {
    console.error("Could not create SpeechRecognizer instance:", err);
    return null;
  }
}
