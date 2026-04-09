import { ref, type Ref } from 'vue';

/** Wake word variants to match (normalized: lowercase, punctuation stripped) */
const WAKE_PHRASES = ['你好乐宝', '你好，乐宝', '你好,乐宝', '你好 乐宝'];

/**
 * Minimal Web Speech API type declarations.
 * The full SpeechRecognition API is not included in TypeScript's dom lib,
 * so we declare only the subset we need.
 */
interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: { readonly transcript: string; readonly confidence: number } | undefined;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult | undefined;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { resultIndex: number; results: SpeechRecognitionResultList }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start(): void;
  stop(): void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export interface UseWakeWordReturn {
  /** Whether the browser supports SpeechRecognition API */
  isSupported: boolean;
  /** Whether the wake word listener is actively listening */
  isListening: Ref<boolean>;
  /** Start listening for the wake word */
  start: () => void;
  /** Stop listening */
  stop: () => void;
  /** Register callback for when the wake word is detected */
  onWakeDetected: (callback: () => void) => void;
}

/**
 * Wake word detection using the Web Speech API.
 *
 * Adapts leBotChatClient's GPIO-based wake detection for the browser:
 * - Uses SpeechRecognition (Chrome/Edge) to continuously listen for "你好乐宝"
 * - Falls back gracefully: isSupported=false on unsupported browsers
 * - Auto-restarts on recognition end/error (SpeechRecognition stops periodically)
 *
 * Usage: In Idle state, start listening. On wake detection, stop listening
 * and begin the chat session. Restart when returning to Idle.
 */
export function useWakeWord(): UseWakeWordReturn {
  const Ctor = getSpeechRecognitionCtor();
  const isSupported = !!Ctor;
  const isListening = ref(false);

  let recognition: SpeechRecognitionLike | undefined;
  let wakeCallback: (() => void) | undefined;
  let shouldBeListening = false;

  function matchesWakePhrase(transcript: string): boolean {
    const normalized = transcript.toLowerCase().replace(/[,，。.!！?\s]/g, '');
    return WAKE_PHRASES.some((phrase) => {
      const normalizedPhrase = phrase.replace(/[,，。.!！?\s]/g, '');
      return normalized.includes(normalizedPhrase);
    });
  }

  function start(): void {
    if (!Ctor) return;
    if (recognition) stop();

    shouldBeListening = true;
    recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i]?.[0]?.transcript ?? '';
        if (matchesWakePhrase(transcript)) {
          console.log('[useWakeWord] Wake phrase detected:', transcript);
          wakeCallback?.();
          // Don't auto-restart — the session will stop us
          shouldBeListening = false;
          stop();
          return;
        }
      }
    };

    // Auto-restart: SpeechRecognition may stop due to silence or timeout
    recognition.onend = () => {
      isListening.value = false;
      if (shouldBeListening) {
        // Re-start after a brief delay to avoid rapid cycling
        setTimeout(() => {
          if (shouldBeListening) {
            try {
              recognition?.start();
              isListening.value = true;
            } catch {
              // May throw if already started
            }
          }
        }, 300);
      }
    };

    recognition.onerror = (event) => {
      // 'no-speech' and 'aborted' are expected — just log others
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('[useWakeWord] Recognition error:', event.error);
      }
    };

    try {
      recognition.start();
      isListening.value = true;
    } catch {
      console.warn('[useWakeWord] Failed to start SpeechRecognition');
    }
  }

  function stop(): void {
    shouldBeListening = false;
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        // May throw if not started
      }
      recognition = undefined;
    }
    isListening.value = false;
  }

  function onWakeDetected(callback: () => void): void {
    wakeCallback = callback;
  }

  return {
    isSupported,
    isListening,
    start,
    stop,
    onWakeDetected,
  };
}
