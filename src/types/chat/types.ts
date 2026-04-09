/**
 * Chat state machine types — mirrors leBotChatClient's cmd/app.go state model.
 *
 * State transitions:
 *   Idle ──wake──> WaitingResponse ──outputAudioComplete──> Active
 *     ^                  |                                      |
 *     |           30s timeout                           silence detected
 *     └──────────────────┴──────────────────────────────────────┘
 */

/** Equivalent to Go's AppState (Sleeping=0, WaitingResponse=1, Active=2) */
export enum ChatState {
  /** Not connected or idle — wake word listening / button ready */
  Idle = 'idle',
  /** Wake detected, audio streaming, waiting for server response */
  WaitingResponse = 'waitingResponse',
  /** Conversation active — recording, playing, silence detection running */
  Active = 'active',
}

/** A single message in the conversation (user or assistant turn). */
export interface ChatMessage {
  /** Client-generated unique ID */
  id: string;
  /** Server-assigned chat ID (set once received) */
  chatId?: string;
  /** Server-assigned conversation ID */
  conversationId?: string;
  /** Message author */
  role: 'user' | 'assistant';
  /** Accumulated text (streamed incrementally from outputTextStream) */
  text: string;
  /** Raw audio chunks (Blob) received during streaming */
  audioChunks: Blob[];
  /** Object URL for the final combined audio (created on outputAudioComplete) */
  audioUrl?: string;
  /** Whether this message's chat turn is fully complete (chatComplete received) */
  isFinished: boolean;
  /** Whether audio/text is still being streamed */
  isStreaming: boolean;
  /** Unix timestamp (ms) when this message was created */
  timestamp: number;
}

/** Configuration sent to the server via updateConfig on each session start. */
export interface ChatSessionConfig {
  conversationId?: string;
  outputText: boolean;
  timezone: string;
  voiceId?: string;
  speechRate?: number;
  sampleRate?: { input?: number; output?: number };
  location?: { latitude: number; longitude: number };
}

/** Silence detection tuning parameters — mirrors Go's WakeConfig. */
export interface SilenceDetectorConfig {
  /** RMS threshold below which audio is considered silent (default: 0.01 for Web Audio float range) */
  rmsThreshold: number;
  /** How often to sample RMS in milliseconds (default: 500) */
  checkIntervalMs: number;
  /** How many consecutive silent samples required to trigger (default: 6, i.e. 3s at 500ms interval) */
  consecutiveSilentCount: number;
}

/** Default silence detector config adapted from Go's 200.0 int16 threshold to Web Audio float [-1,1] */
export const DEFAULT_SILENCE_CONFIG: SilenceDetectorConfig = {
  // 200 / 32768 ≈ 0.006 — use slightly higher for Web Audio noise floor
  rmsThreshold: 0.01,
  checkIntervalMs: 500,
  // 6 checks × 500ms = 3s buffer (matches Go's SilenceBufferSeconds=3)
  consecutiveSilentCount: 6,
};

/** Timeouts matching Go client's hardcoded values */
export const CHAT_TIMEOUTS = {
  /** WaitingResponse → Idle timeout in ms (Go: 30s) */
  waitingResponseTimeoutMs: 30_000,
  /** Cooldown after sending cancelOutput before starting new session (Go: 300ms) */
  cancelCooldownMs: 300,
  /** WebSocket reconnect base delay in ms */
  reconnectBaseDelayMs: 3_000,
} as const;

/** Audio recording constants matching Go client config */
export const AUDIO_CONSTANTS = {
  /** Sample rate for audio sent to server (Go: 16000) */
  sampleRate: 16_000,
  /** Number of audio channels (Go: 1 — mono) */
  channels: 1,
  /** Bits per sample (Go: 16) */
  bitDepth: 16,
  /** Duration of each audio chunk in ms (Go: 200) */
  chunkDurationMs: 200,
} as const;
