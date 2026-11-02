import { useCallback, useEffect, useRef, useState } from "react";

// ITM-268: dictation with the speech recognition of the browser (Web Speech API). Some browsers send
// the audio to the provider of the browser, which is why the screen asks for a consent first.

export type DictationLanguage = "de-DE" | "en-US";

export const DICTATION_LANGUAGES: { value: DictationLanguage; label: string }[] = [
  { value: "de-DE", label: "German" },
  { value: "en-US", label: "English" },
];

const LANGUAGE_KEY = "daiy.v1.dictation-language";

type RecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};
type RecognitionConstructor = new () => Recognition;

function recognitionConstructor(): RecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function dictationLanguage(): DictationLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored === "de-DE" || stored === "en-US") return stored;
  } catch {
    // no storage: use the language of the browser
  }
  return typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("de")
    ? "de-DE"
    : "en-US";
}

export function rememberDictationLanguage(language: DictationLanguage): void {
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // the choice then only holds until the page is left
  }
}

const ERROR_TEXT: Record<string, string> = {
  "not-allowed": "The microphone is not allowed. Allow it in your browser, or type instead.",
  "service-not-allowed":
    "The microphone is not allowed. Allow it in your browser, or type instead.",
  "no-speech": "No speech was heard. Try again, or type instead.",
  "audio-capture": "No microphone was found. Type instead.",
};

/**
 * Listens and hands the words spoken so far to `onText`, which receives the text the user had when
 * dictation began plus what was recognised. Nothing is recorded before `start` is called.
 */
export function useDictation(onText: (spoken: string) => void) {
  const supported = recognitionConstructor() !== undefined;
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = useRef<Recognition | null>(null);

  const stop = useCallback(() => active.current?.stop(), []);

  const start = useCallback(
    (language: DictationLanguage) => {
      const Ctor = recognitionConstructor();
      if (!Ctor || active.current) return;
      const recognition = new Ctor();
      recognition.lang = language;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (e) => {
        let spoken = "";
        for (let i = 0; i < e.results.length; i++) spoken += e.results[i]![0]!.transcript;
        onText(spoken.trim());
      };
      recognition.onerror = (e) =>
        setError(ERROR_TEXT[e.error] ?? "Dictation did not work. Type instead.");
      recognition.onend = () => {
        active.current = null;
        setListening(false);
      };
      active.current = recognition;
      setError(null);
      setListening(true);
      try {
        recognition.start();
      } catch {
        active.current = null;
        setListening(false);
        setError("Dictation did not work. Type instead.");
      }
    },
    [onText],
  );

  useEffect(
    () => () => {
      const recognition = active.current;
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.stop();
        active.current = null;
      }
    },
    [],
  );

  return { supported, listening, error, start, stop };
}
