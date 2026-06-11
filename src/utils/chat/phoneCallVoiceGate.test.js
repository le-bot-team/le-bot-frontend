import { describe, expect, test } from 'bun:test';

import { PhoneCallVoiceGate } from './phoneCallVoiceGate';

const config = {
  voiceStartRmsThreshold: 0.015,
  voiceEndRmsThreshold: 0.01,
  voiceStartMinMs: 200,
  voiceEndSilenceMs: 1000,
  preRollMs: 400,
  maxTurnMs: 25_000,
};

describe('PhoneCallVoiceGate', () => {
  test('does not emit stream events for silence-only input', () => {
    const gate = new PhoneCallVoiceGate(config);

    const events = [
      ...gate.processChunk('silence-1', 0.001, 200),
      ...gate.processChunk('silence-2', 0.001, 200),
      ...gate.processChunk('silence-3', 0.001, 200),
    ];

    expect(events).toEqual([]);
  });

  test('flushes bounded pre-roll when speech starts', () => {
    const gate = new PhoneCallVoiceGate(config);

    gate.processChunk('old-silence', 0.001, 200);
    gate.processChunk('pre-roll', 0.001, 200);
    const events = gate.processChunk('speech-start', 0.02, 200);

    expect(events).toEqual([
      { type: 'speechStart' },
      { type: 'stream', buffer: 'pre-roll' },
      { type: 'stream', buffer: 'speech-start' },
    ]);
  });

  test('emits complete after configured trailing silence', () => {
    const gate = new PhoneCallVoiceGate(config);

    gate.processChunk('speech-start', 0.02, 200);
    const events = [
      ...gate.processChunk('speech-body', 0.02, 200),
      ...gate.processChunk('silence-1', 0.001, 200),
      ...gate.processChunk('silence-2', 0.001, 200),
      ...gate.processChunk('silence-3', 0.001, 200),
      ...gate.processChunk('silence-4', 0.001, 200),
      ...gate.processChunk('silence-5', 0.001, 200),
    ];

    expect(events.at(-1)).toEqual({ type: 'complete', reason: 'silence' });
  });

  test('emits complete when max turn duration is reached', () => {
    const gate = new PhoneCallVoiceGate({ ...config, maxTurnMs: 600 });

    const events = [
      ...gate.processChunk('speech-start', 0.02, 200),
      ...gate.processChunk('speech-body-1', 0.02, 200),
      ...gate.processChunk('speech-body-2', 0.02, 200),
    ];

    expect(events.at(-1)).toEqual({ type: 'complete', reason: 'maxTurn' });
  });
});
