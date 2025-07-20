// 音频流处理器，参考 Python 脚本的 start_audio_stream 逻辑
import type { AudioStreamOptions } from 'src/types/audio/types';
import type { WsWrapper } from 'src/types/websocket';
import { WsInputAudioStreamRequest, WsInputAudioCompleteRequest } from 'src/types/websocket/types';
import {
  getSegmentSize,
  readAudioData,
  readWavInfo,
  splitAudio,
  uint8ArrayToBase64,
  createWavFileFromPcm,
} from 'src/types/audio/utils';

export class AudioStreamProcessor {
  private isProcessing = false;
  private shouldStop = false;

  constructor(
    private ws: WsWrapper,
    private options: AudioStreamOptions = {},
  ) {}

  /**
   * 处理音频文件并流式发送，参考 Python 的 execute 和 start_audio_stream 方法
   */
  async processAudioFile(file: File): Promise<void> {
    if (this.isProcessing) {
      throw new Error('Audio processing is already in progress');
    }

    this.isProcessing = true;
    this.shouldStop = false;

    try {
      // 1. 读取音频文件数据
      console.log('Reading audio file...');
      const audioData = await readAudioData(file);

      // 2. 解析 WAV 信息（仅用于计算分段大小）
      console.log('Parsing WAV info...');
      const wavInfo = readWavInfo(audioData);
      console.log('WAV Info:', {
        channels: wavInfo.numChannels,
        sampleRate: wavInfo.sampleRate,
        bitsPerSample: wavInfo.bytesPerSample * 8,
        duration: wavInfo.numSamples / wavInfo.sampleRate,
        totalFileLength: audioData.length, // 完整文件长度
        rawDataLength: wavInfo.waveData.length, // 纯PCM数据长度
      });

      // 3. 计算分段大小（基于PCM数据）
      const segmentDurationMs = this.options.segmentDurationMs || 200;
      const segmentSize = getSegmentSize(wavInfo, segmentDurationMs);
      console.log('Segment size:', segmentSize, 'bytes');

      // 4. 关键修复：生成带WAV头部的音频片段
      // 分割纯PCM数据，然后为每个片段添加WAV头部，这样保证每个片段都是完整的WAV文件
      const pcmSegments = splitAudio(wavInfo.waveData, segmentSize);
      console.log('Total PCM segments:', pcmSegments.length);

      // 为每个PCM片段生成完整的WAV文件
      const segments = pcmSegments.map((pcmData) => {
        return createWavFileFromPcm(
          pcmData,
          wavInfo.sampleRate,
          wavInfo.numChannels,
          wavInfo.bytesPerSample,
        );
      });
      console.log('Total WAV segments:', segments.length);

      // 5. 流式发送音频片段
      await this.sendAudioSegments(segments);
    } catch (error) {
      console.error('Error processing audio file:', error);
      throw error;
    } finally {
      this.isProcessing = false;
      this.shouldStop = false;
    }
  }

  /**
   * 发送音频片段，参考 Python 的 send_messages 方法
   */
  private async sendAudioSegments(segments: Uint8Array[]): Promise<void> {
    const totalSegments = segments.length;
    const segmentDurationMs = this.options.segmentDurationMs || 200;

    for (let i = 0; i < totalSegments; i++) {
      if (this.shouldStop) {
        console.log('Audio streaming stopped by user');
        break;
      }

      const isLast = i === totalSegments - 1;
      const segment = segments[i];
      if (!segment) {
        console.warn(`Segment ${i + 1} is empty, skipping...`);
        continue;
      }

      // 将音频片段转换为 base64
      const base64Data = uint8ArrayToBase64(segment);

      // 关键修复：最后一个音频包通过 WsInputAudioCompleteRequest 发送
      if (isLast) {
        this.ws.sendAction(new WsInputAudioCompleteRequest(base64Data));
        console.log(
          `Sent final audio segment ${i + 1}/${totalSegments} (${segment.length} bytes) via inputAudioComplete`,
        );
      } else {
        this.ws.sendAction(new WsInputAudioStreamRequest(base64Data));
        console.log(`Sent audio segment ${i + 1}/${totalSegments} (${segment.length} bytes)`);
      }

      // 调用回调函数
      this.options.onSegmentSent?.(i, isLast);

      // 更新进度
      const progress = (i + 1) / totalSegments;
      this.options.onProgress?.(progress, i + 1, totalSegments);

      // 如果不是最后一个片段，等待一段时间模拟实时流
      if (!isLast) {
        await new Promise((resolve) => setTimeout(resolve, segmentDurationMs));
      }
    }

    console.log('Audio streaming completed');
  }

  /**
   * 停止音频流处理
   */
  stop(): void {
    if (this.isProcessing) {
      this.shouldStop = true;
      console.log('Stopping audio stream...');
    }
  }

  /**
   * 检查是否正在处理
   */
  get processing(): boolean {
    return this.isProcessing;
  }
}
