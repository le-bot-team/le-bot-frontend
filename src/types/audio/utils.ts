import { DEFAULT_SAMPLE_RATE } from 'src/types/audio/constants';
import type { WavInfo } from 'src/types/audio/types';

export const isWavFile = (data: Uint8Array): boolean => {
  if (data.length < 44) return false;
  const riff = new TextDecoder().decode(data.slice(0, 4));
  const wave = new TextDecoder().decode(data.slice(8, 12));
  return riff === 'RIFF' && wave === 'WAVE';
};

export const readWavInfo = (data: Uint8Array): WavInfo => {
  if (data.length < 44) {
    throw new Error('Invalid WAV file: too short');
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  // 检查RIFF和WAVE标识
  const riff = new TextDecoder().decode(data.slice(0, 4));
  const wave = new TextDecoder().decode(data.slice(8, 12));

  if (riff !== 'RIFF') throw new Error('Invalid WAV file: not RIFF format');
  if (wave !== 'WAVE') throw new Error('Invalid WAV file: not WAVE format');

  // 解析fmt子块
  const numChannels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const bitsPerSample = view.getUint16(34, true);
  const bytesPerSample = bitsPerSample / 8;

  // 查找data子块 - 这里是关键，要确保找到正确的data chunk
  let pos = 36;
  while (pos < data.length - 8) {
    const subchunkId = new TextDecoder().decode(data.slice(pos, pos + 4));
    const subchunkSize = view.getUint32(pos + 4, true);

    if (subchunkId === 'data') {
      // 重要：只返回纯音频数据，不包含WAV头，与Python代码保持一致
      const waveData = data.slice(pos + 8, pos + 8 + subchunkSize);
      const numSamples = Math.floor(subchunkSize / (numChannels * bytesPerSample));

      console.log('WAV parsing details:', {
        dataChunkOffset: pos + 8,
        dataChunkSize: subchunkSize,
        actualDataLength: waveData.length,
        numChannels,
        bytesPerSample,
        sampleRate,
        numSamples,
      });

      return {
        numChannels,
        bytesPerSample,
        sampleRate,
        numSamples,
        waveData, // 这里是纯PCM数据，不包含任何头部信息
      };
    }
    pos += 8 + subchunkSize;
  }

  throw new Error('Invalid WAV file: no data subchunk found');
};

/**
 * 计算音频分段大小，参考 Python 的 get_segment_size 方法
 */
export const getSegmentSize = (wavInfo: WavInfo, segmentDurationMs: number = 200): number => {
  const { numChannels, bytesPerSample, sampleRate } = wavInfo;
  const sizePerSec = numChannels * bytesPerSample * sampleRate;
  return Math.floor((sizePerSec * segmentDurationMs) / 1000);
};

/**
 * 分割音频数据，参考 Python 的 split_audio 方法
 */
export const splitAudio = (data: Uint8Array, segmentSize: number): Uint8Array[] => {
  if (segmentSize <= 0) return [];

  const segments: Uint8Array[] = [];
  for (let i = 0; i < data.length; i += segmentSize) {
    const end = Math.min(i + segmentSize, data.length);
    segments.push(data.slice(i, end));
  }
  return segments;
};

/**
 * 将音频文件转换为 WAV 格式（如果需要）
 * 确保输出格式符合语音识别API要求：16kHz, 16bit, 单声道PCM
 */
export const convertToWav = async (file: File): Promise<Uint8Array> => {
  // 使用Web Audio API转换音频文件为16kHz单声道WAV
  const audioContext = new (window.AudioContext || (window as unknown as typeof AudioContext))();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // 强制转换为16kHz单声道，符合API要求
    const targetSampleRate = DEFAULT_SAMPLE_RATE; // 16000Hz
    const targetChannels = 1; // 单声道
    const targetLength = Math.floor(audioBuffer.duration * targetSampleRate);

    const offlineContext = new OfflineAudioContext(targetChannels, targetLength, targetSampleRate);

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    // 如果原音频是多声道，需要转换为单声道
    if (audioBuffer.numberOfChannels > 1) {
      const splitter = offlineContext.createChannelSplitter(audioBuffer.numberOfChannels);
      const merger = offlineContext.createChannelMerger(1);

      source.connect(splitter);
      // 混合所有声道到单声道
      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        splitter.connect(merger, i, 0);
      }
      merger.connect(offlineContext.destination);
    } else {
      source.connect(offlineContext.destination);
    }

    source.start();

    const renderedBuffer = await offlineContext.startRendering();

    // 转换为标准WAV格式
    const wavData = audioBufferToWav(renderedBuffer);
    return new Uint8Array(wavData);
  } catch (error) {
    console.error('Audio conversion failed:', error);
    throw error instanceof Error ? error : new Error('Failed to convert audio to WAV');
  } finally {
    void audioContext.close();
  }
};

/**
 * 将 AudioBuffer 转换为标准 WAV 格式
 * 生成16位PCM格式，符合语音识别API要求
 * 重要：返回完整的WAV文件，但后续处理时只使用PCM数据部分
 */
const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
  const length = buffer.length;
  const sampleRate = buffer.sampleRate;
  const numberOfChannels = buffer.numberOfChannels;
  const bitsPerSample = 16; // 固定16位
  const bytesPerSample = bitsPerSample / 8;

  // 验证参数符合API要求
  if (sampleRate !== DEFAULT_SAMPLE_RATE) {
    console.warn(`Sample rate ${sampleRate} may not match API requirement ${DEFAULT_SAMPLE_RATE}`);
  }
  if (numberOfChannels !== 1) {
    console.warn(`Channel count ${numberOfChannels} may not match API requirement (mono)`);
  }

  const dataLength = length * numberOfChannels * bytesPerSample;
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // 标准WAV文件头，严格按照规范
  writeString(view, 0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true); // 文件大小-8
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM format (1)
  view.setUint16(22, numberOfChannels, true); // 声道数
  view.setUint32(24, sampleRate, true); // 采样率
  view.setUint32(28, sampleRate * numberOfChannels * bytesPerSample, true); // 字节率
  view.setUint16(32, numberOfChannels * bytesPerSample, true); // 块对齐
  view.setUint16(34, bitsPerSample, true); // 位深

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true); // 数据长度

  // 转换音频数据为16位PCM，使用小端序（little-endian）
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      // 确保样本值在有效范围内
      const sample = Math.max(-1, Math.min(1, channelData[i] ?? 0));
      // 转换为16位有符号整数，与Python代码保持一致
      const intSample = sample < 0 ? Math.floor(sample * 0x8000) : Math.floor(sample * 0x7fff);
      view.setInt16(offset, intSample, true); // true表示小端序
      offset += 2;
    }
  }

  console.log('Generated WAV file:', {
    totalSize: bufferLength,
    headerSize: 44,
    dataSize: dataLength,
    sampleRate,
    channels: numberOfChannels,
    bitsPerSample,
  });

  return arrayBuffer;
};

const writeString = (view: DataView, offset: number, str: string): void => {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
};

/**
 * 读取音频文件数据，参考 Python 的 read_audio_data 方法
 * 确保输出的音频格式符合API要求
 */
export const readAudioData = async (file: File): Promise<Uint8Array> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    // 检查是否是WAV文件
    if (!isWavFile(data)) {
      console.log('Converting non-WAV audio to WAV format...');
      return await convertToWav(file);
    } else {
      // 即使是WAV文件，也要检查格式是否符合要求
      try {
        const wavInfo = readWavInfo(data);
        console.log('Original WAV info:', {
          channels: wavInfo.numChannels,
          sampleRate: wavInfo.sampleRate,
          bitsPerSample: wavInfo.bytesPerSample * 8,
        });

        // 检查是否符合API要求
        const needsConversion =
          wavInfo.sampleRate !== DEFAULT_SAMPLE_RATE ||
          wavInfo.numChannels !== 1 ||
          wavInfo.bytesPerSample !== 2; // 16位 = 2字节

        if (needsConversion) {
          console.log('WAV format does not match API requirements, converting...');
          return await convertToWav(file);
        } else {
          console.log('WAV format matches API requirements');
          return data;
        }
      } catch {
        console.log('Invalid WAV format, converting...');
        return await convertToWav(file);
      }
    }
  } catch (error) {
    console.error('Failed to read audio data:', error);
    throw error instanceof Error ? error : new Error('Failed to read audio data');
  }
};

/**
 * 将 Uint8Array 转换为 base64 字符串
 */
export const uint8ArrayToBase64 = (data: Uint8Array): string => {
  const binary = Array.from(data, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary);
};

/**
 * 从PCM数据创建完整的WAV文件，确保每个音频片段都有完整的WAV头部
 * 这样火山引擎API就能正确识别每个片段的音频格式
 */
export const createWavFileFromPcm = (
  pcmData: Uint8Array,
  sampleRate: number,
  numChannels: number,
  bytesPerSample: number,
): Uint8Array => {
  const bitsPerSample = bytesPerSample * 8;
  const dataLength = pcmData.length;
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // 标准WAV文件头
  writeString(view, 0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true); // 文件大小-8
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM format (1)
  view.setUint16(22, numChannels, true); // 声道数
  view.setUint32(24, sampleRate, true); // 采样率
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // 字节率
  view.setUint16(32, numChannels * bytesPerSample, true); // 块对齐
  view.setUint16(34, bitsPerSample, true); // 位深

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true); // 数据长度

  // 复制PCM数据
  new Uint8Array(arrayBuffer, 44).set(pcmData);

  return new Uint8Array(arrayBuffer);
};
