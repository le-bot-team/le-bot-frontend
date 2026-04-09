import { DEFAULT_SILENCE_CONFIG, type SilenceDetectorConfig } from 'src/types/chat/types';

export interface UseSilenceDetectorReturn {
  /** Start periodic silence checking on the given AnalyserNode */
  start: (analyserNode: AnalyserNode) => void;
  /** Stop silence checking */
  stop: () => void;
  /** Reset the silence buffer (call on state transitions) */
  reset: () => void;
  /** Register callback for when sustained silence is detected */
  onSilenceDetected: (callback: () => void) => void;
}

/**
 * RMS-based silence detector for audio streams.
 *
 * Mirrors leBotChatClient's silenceCheckLoop + IsSilent():
 * - Periodically samples RMS from an AnalyserNode (every 500ms by default)
 * - Maintains a ring of recent RMS values (last 3s)
 * - If ALL samples in the ring are below the threshold → silence detected
 * - Has a built-in grace period: won't fire until the ring is fully filled
 *
 * Go client equivalence:
 *   checkInterval=500ms × consecutiveCount=6 = 3s silence window
 *   rmsThreshold=0.01 ≈ Go's 200/32768 for int16 samples
 */
export function useSilenceDetector(
  config: Partial<SilenceDetectorConfig> = {},
): UseSilenceDetectorReturn {
  const {
    rmsThreshold,
    checkIntervalMs,
    consecutiveSilentCount,
  } = { ...DEFAULT_SILENCE_CONFIG, ...config };

  let intervalId: ReturnType<typeof setInterval> | undefined;
  let silentRing: boolean[] = [];
  let silenceCallback: (() => void) | undefined;
  let sampleCount = 0;

  function calculateRms(analyserNode: AnalyserNode): number {
    const buffer = new Float32Array(analyserNode.fftSize);
    analyserNode.getFloatTimeDomainData(buffer);

    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i++) {
      sumSquares += buffer[i]! * buffer[i]!;
    }
    return Math.sqrt(sumSquares / buffer.length);
  }

  function start(analyserNode: AnalyserNode): void {
    stop(); // Clear any existing interval
    silentRing = [];
    sampleCount = 0;

    intervalId = setInterval(() => {
      const rms = calculateRms(analyserNode);
      const isSilent = rms < rmsThreshold;

      // Maintain a ring buffer of the last N checks
      silentRing.push(isSilent);
      if (silentRing.length > consecutiveSilentCount) {
        silentRing.shift();
      }
      sampleCount++;

      // Grace period: don't check until ring is fully populated
      if (sampleCount < consecutiveSilentCount) return;

      // All samples silent → trigger
      if (silentRing.length === consecutiveSilentCount && silentRing.every(Boolean)) {
        silenceCallback?.();
        // Reset after triggering to avoid repeated fires
        silentRing = [];
        sampleCount = 0;
      }
    }, checkIntervalMs);
  }

  function stop(): void {
    if (intervalId !== undefined) {
      clearInterval(intervalId);
      intervalId = undefined;
    }
  }

  function reset(): void {
    silentRing = [];
    sampleCount = 0;
  }

  function onSilenceDetected(callback: () => void): void {
    silenceCallback = callback;
  }

  return {
    start,
    stop,
    reset,
    onSilenceDetected,
  };
}
