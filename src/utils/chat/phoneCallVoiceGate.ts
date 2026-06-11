import {
  AUDIO_CONSTANTS,
  DEFAULT_PHONE_CALL_VOICE_GATE_CONFIG,
  type PhoneCallVoiceGateConfig,
} from 'src/types/chat/types';

export type PhoneCallVoiceGateEvent =
  | { type: 'speechStart' }
  | { type: 'stream'; buffer: string }
  | { type: 'complete'; reason: 'silence' | 'maxTurn' | 'forced' };

interface PreRollChunk {
  buffer: string;
  durationMs: number;
}

/**
 * Small RMS voice gate for phone-call chat mode.
 *
 * It is intentionally dependency-free: the browser-side AnalyserNode supplies the
 * RMS value, and this gate only manages hysteresis, pre-roll, end-of-speech, and
 * max-turn bookkeeping. The backend remains authoritative for turn boundaries.
 */
export class PhoneCallVoiceGate {
  private readonly config: PhoneCallVoiceGateConfig;
  private readonly preRoll: PreRollChunk[] = [];

  private preRollDurationMs = 0;
  private voiceStartDurationMs = 0;
  private silenceDurationMs = 0;
  private turnDurationMs = 0;
  private isSpeaking = false;
  private hasOpenTurn = false;

  constructor(config: Partial<PhoneCallVoiceGateConfig> = {}) {
    this.config = { ...DEFAULT_PHONE_CALL_VOICE_GATE_CONFIG, ...config };
  }

  processChunk(
    buffer: string,
    rms: number,
    durationMs = AUDIO_CONSTANTS.chunkDurationMs,
  ): PhoneCallVoiceGateEvent[] {
    if (!this.isSpeaking) {
      this.addPreRoll(buffer, durationMs);

      if (rms >= this.config.voiceStartRmsThreshold) {
        this.voiceStartDurationMs += durationMs;
      } else {
        this.voiceStartDurationMs = 0;
      }

      if (this.voiceStartDurationMs < this.config.voiceStartMinMs) {
        return [];
      }

      this.isSpeaking = true;
      this.hasOpenTurn = true;
      this.silenceDurationMs = 0;
      this.turnDurationMs = 0;
      this.voiceStartDurationMs = 0;

      const events: PhoneCallVoiceGateEvent[] = [{ type: 'speechStart' }];
      for (const chunk of this.preRoll) {
        events.push({ type: 'stream', buffer: chunk.buffer });
        this.turnDurationMs += chunk.durationMs;
      }
      this.clearPreRoll();
      return this.completeIfNeeded(events);
    }

    const events: PhoneCallVoiceGateEvent[] = [{ type: 'stream', buffer }];
    this.turnDurationMs += durationMs;

    if (rms <= this.config.voiceEndRmsThreshold) {
      this.silenceDurationMs += durationMs;
    } else {
      this.silenceDurationMs = 0;
    }

    return this.completeIfNeeded(events);
  }

  reset(): void {
    this.clearPreRoll();
    this.voiceStartDurationMs = 0;
    this.silenceDurationMs = 0;
    this.turnDurationMs = 0;
    this.isSpeaking = false;
    this.hasOpenTurn = false;
  }

  private completeIfNeeded(events: PhoneCallVoiceGateEvent[]): PhoneCallVoiceGateEvent[] {
    if (this.turnDurationMs >= this.config.maxTurnMs) {
      this.closeTurn();
      events.push({ type: 'complete', reason: 'maxTurn' });
      return events;
    }

    if (this.silenceDurationMs >= this.config.voiceEndSilenceMs) {
      this.closeTurn();
      events.push({ type: 'complete', reason: 'silence' });
    }

    return events;
  }

  private closeTurn(): void {
    this.isSpeaking = false;
    this.hasOpenTurn = false;
    this.voiceStartDurationMs = 0;
    this.silenceDurationMs = 0;
    this.turnDurationMs = 0;
    this.clearPreRoll();
  }

  private addPreRoll(buffer: string, durationMs: number): void {
    this.preRoll.push({ buffer, durationMs });
    this.preRollDurationMs += durationMs;

    while (this.preRollDurationMs > this.config.preRollMs) {
      const removed = this.preRoll.shift();
      if (!removed) return;
      this.preRollDurationMs -= removed.durationMs;
    }
  }

  private clearPreRoll(): void {
    this.preRoll.length = 0;
    this.preRollDurationMs = 0;
  }
}
