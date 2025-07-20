export interface WavInfo {
  numChannels: number;
  bytesPerSample: number;
  sampleRate: number;
  numSamples: number;
  waveData: Uint8Array;
}

export interface AudioStreamOptions {
  segmentDurationMs?: number;
  onProgress?: (progress: number, segmentIndex: number, totalSegments: number) => void;
  onSegmentSent?: (segmentIndex: number, isLast: boolean) => void;
}
