import { ref, type Ref } from 'vue';

export interface UseChatPlayerReturn {
  /** Whether audio is currently playing */
  isPlaying: Ref<boolean>;
  /** Play a base64-encoded audio chunk (scheduled for gapless streaming) */
  playChunk: (base64Audio: string) => Promise<void>;
  /** Mark that the server has finished sending audio (no more chunks expected) */
  setAudioComplete: (complete: boolean) => void;
  /** Immediately stop all playback and discard queued audio */
  stopPlayback: () => void;
  /** Clear internal buffers without stopping current playback */
  clearBuffer: () => void;
  /** Register callback for when all scheduled audio finishes playing */
  onPlaybackFinished: (callback: () => void) => void;
  /** Get the combined audio chunks as a single Blob (for message audioUrl) */
  getAudioBlob: () => Blob;
  /** Release all resources */
  destroy: () => void;
}

/**
 * Streaming audio player for chat responses.
 *
 * Mirrors leBotChatClient's internal/audio/player.go:
 * - Receives base64-encoded audio chunks from outputAudioStream
 * - Decodes via Web Audio API and schedules gapless playback
 * - Supports immediate interruption (stopPlayback)
 * - Tracks playback state for the state machine
 *
 * Playback pipeline:
 *   base64 → ArrayBuffer → AudioContext.decodeAudioData()
 *     → AudioBufferSourceNode → scheduled at nextStartTime → destination
 */
export function useChatPlayer(): UseChatPlayerReturn {
  const isPlaying = ref(false);

  let audioContext: AudioContext | undefined;
  let nextStartTime = 0;
  let activeSources: AudioBufferSourceNode[] = [];
  let audioComplete = false;
  let rawChunks: ArrayBuffer[] = [];
  let finishedCallback: (() => void) | undefined;

  function ensureContext(): AudioContext {
    if (!audioContext) {
      audioContext = new AudioContext();
      nextStartTime = audioContext.currentTime;
    }
    return audioContext;
  }

  async function playChunk(base64Audio: string): Promise<void> {
    const ctx = ensureContext();

    // Decode base64 to ArrayBuffer
    const binary = atob(base64Audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

    // Store raw chunk for later combined blob
    rawChunks.push(arrayBuffer.slice(0));

    try {
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      // Schedule gapless playback
      const startTime = Math.max(ctx.currentTime, nextStartTime);
      source.start(startTime);
      nextStartTime = startTime + audioBuffer.duration;

      activeSources.push(source);
      isPlaying.value = true;

      source.onended = () => {
        const idx = activeSources.indexOf(source);
        if (idx > -1) activeSources.splice(idx, 1);

        // If no more sources and server marked audio complete, we're done
        if (activeSources.length === 0) {
          isPlaying.value = false;
          if (audioComplete) {
            finishedCallback?.();
          }
        }
      };
    } catch (error) {
      console.warn('[useChatPlayer] Failed to decode audio chunk:', error);
    }
  }

  function setAudioComplete(complete: boolean): void {
    audioComplete = complete;
    // If already no sources playing, fire immediately
    if (complete && activeSources.length === 0) {
      isPlaying.value = false;
      finishedCallback?.();
    }
  }

  function stopPlayback(): void {
    for (const source of activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Source may already be stopped
      }
    }
    activeSources = [];
    isPlaying.value = false;

    // Reset scheduling timeline
    if (audioContext) {
      nextStartTime = audioContext.currentTime;
    }
  }

  function clearBuffer(): void {
    rawChunks = [];
    audioComplete = false;
  }

  function onPlaybackFinished(callback: () => void): void {
    finishedCallback = callback;
  }

  function getAudioBlob(): Blob {
    return new Blob(rawChunks.map((buf) => new Uint8Array(buf)), {
      type: 'application/octet-stream',
    });
  }

  function destroy(): void {
    stopPlayback();
    clearBuffer();
    if (audioContext) {
      audioContext.close().catch(console.error);
      audioContext = undefined;
    }
    finishedCallback = undefined;
  }

  return {
    isPlaying,
    playChunk,
    setAudioComplete,
    stopPlayback,
    clearBuffer,
    onPlaybackFinished,
    getAudioBlob,
    destroy,
  };
}
