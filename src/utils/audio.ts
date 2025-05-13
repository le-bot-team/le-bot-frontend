export async function pcmToWav(
  pcmBlob: Blob,
  sampleRate: 8000 | 16000 | 22050 | 24000 | 32000 | 44100 | 48000 = 24000,
  numChannels = 1,
  bitDepth = 16,
): Promise<Blob> {
  const pcmBuffer = await pcmBlob.arrayBuffer();
  const bytesPerSample = bitDepth / 8;
  const dataLength = pcmBuffer.byteLength;

  // Create WAV header
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');

  // fmt subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // Byte rate
  view.setUint16(32, numChannels * bytesPerSample, true); // Block align
  view.setUint16(34, bitDepth, true);

  // data subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Combine header and PCM data
  const wavBuffer = new Uint8Array(header.byteLength + pcmBuffer.byteLength);
  wavBuffer.set(new Uint8Array(header), 0);
  wavBuffer.set(new Uint8Array(pcmBuffer), header.byteLength);

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
