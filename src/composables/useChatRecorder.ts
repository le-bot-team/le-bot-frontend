import { type IMediaRecorder, MediaRecorder } from 'extendable-media-recorder';
import { ref, type Ref } from 'vue';

import { AUDIO_CONSTANTS } from 'src/types/chat/types';

export interface UseChatRecorderReturn {
  /** Whether the recorder is currently capturing audio */
  isRecording: Ref<boolean>;
  /** Whether the media stream has been acquired */
  isMediaReady: Ref<boolean>;
  /** Initialize the media stream (call once, reuse across sessions) */
  initMedia: () => Promise<void>;
  /** Start recording — emits 200ms WAV chunks via onChunk callback */
  startRecording: () => void;
  /** Stop recording */
  stopRecording: () => void;
  /** Release the media stream and all resources */
  releaseMedia: () => void;
  /** Register a callback for each 200ms audio chunk (base64 WAV) */
  onChunk: (callback: (base64: string) => void) => void;
  /** Get the AnalyserNode for silence detection (available after initMedia) */
  getAnalyserNode: () => AnalyserNode | undefined;
}

/**
 * Continuous audio recorder for chat sessions.
 *
 * Uses extendable-media-recorder with WAV mimeType for 200ms chunked output.
 * Also creates an AnalyserNode on the same MediaStream for silence detection.
 *
 * Audio pipeline:
 *   getUserMedia (16kHz, mono, 16-bit)
 *     ├── MediaRecorder (WAV, 200ms timeslice) → base64 chunks
 *     └── AudioContext → MediaStreamSource → AnalyserNode → RMS for silence detection
 */
export function useChatRecorder(): UseChatRecorderReturn {
  const isRecording = ref(false);
  const isMediaReady = ref(false);

  let mediaStream: MediaStream | undefined;
  let mediaRecorder: IMediaRecorder | undefined;
  let audioContext: AudioContext | undefined;
  let analyserNode: AnalyserNode | undefined;

  let chunkCallback: ((base64: string) => void) | undefined;

  async function initMedia(): Promise<void> {
    if (mediaStream) return; // Already initialized

    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: AUDIO_CONSTANTS.sampleRate,
        sampleSize: AUDIO_CONSTANTS.bitDepth,
        channelCount: AUDIO_CONSTANTS.channels,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    // Create AudioContext + AnalyserNode for silence detection
    audioContext = new AudioContext({ sampleRate: AUDIO_CONSTANTS.sampleRate });
    const source = audioContext.createMediaStreamSource(mediaStream);
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    source.connect(analyserNode);
    // Do NOT connect analyserNode to destination — we only analyze, not play back

    isMediaReady.value = true;
  }

  function startRecording(): void {
    if (!mediaStream) {
      console.warn('[useChatRecorder] Media not initialized — call initMedia() first');
      return;
    }
    if (isRecording.value) return;

    mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/wav' });

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0 && chunkCallback) {
        blobToBase64(event.data)
          .then((base64) => chunkCallback?.(base64))
          .catch(console.error);
      }
    };

    mediaRecorder.start(AUDIO_CONSTANTS.chunkDurationMs);
    isRecording.value = true;
  }

  function stopRecording(): void {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop();
      mediaRecorder = undefined;
    }
    isRecording.value = false;
  }

  function releaseMedia(): void {
    stopRecording();

    if (audioContext) {
      audioContext.close().catch(console.error);
      audioContext = undefined;
      analyserNode = undefined;
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = undefined;
    }

    isMediaReady.value = false;
  }

  function onChunk(callback: (base64: string) => void): void {
    chunkCallback = callback;
  }

  function getAnalyserNode(): AnalyserNode | undefined {
    return analyserNode;
  }

  return {
    isRecording,
    isMediaReady,
    initMedia,
    startRecording,
    stopRecording,
    releaseMedia,
    onChunk,
    getAnalyserNode,
  };
}

/** Convert a Blob to a raw base64 string (no data URI prefix). */
async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}
