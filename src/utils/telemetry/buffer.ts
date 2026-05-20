/**
 * 缓冲队列
 *
 * 内存环形缓冲区，暂存待上报的遥测事件。
 * 支持两种 flush 触发方式：
 * 1. 定时器触发（默认 10 秒）
 * 2. 队列满触发（默认 50 条）
 */

import type { TelemetryEvent } from 'src/types/api/telemetry';

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

/** flush 回调：接收一批事件进行上报 */
export type FlushCallback = (events: TelemetryEvent[]) => Promise<void>;

/** 缓冲队列配置 */
export interface BufferQueueConfig {
  /** 最大容量 */
  maxSize: number;
  /** 定时 flush 间隔 (ms) */
  flushInterval: number;
}

/** 默认配置 */
const DEFAULT_CONFIG: BufferQueueConfig = {
  maxSize: 50,
  flushInterval: 10_000, // 10 秒
};

// ---------------------------------------------------------------------------
// BufferQueue
// ---------------------------------------------------------------------------

export class BufferQueue {
  private buffer: TelemetryEvent[] = [];
  private config: BufferQueueConfig;
  private flushCallback: FlushCallback | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private flushing = false;

  constructor(config: Partial<BufferQueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ----- 公开 API -----

  /** 设置 flush 回调 */
  onFlush(callback: FlushCallback): void {
    this.flushCallback = callback;
  }

  /** 启动定时 flush */
  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.flush();
    }, this.config.flushInterval);
  }

  /** 停止定时 flush（页面卸载时调用） */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** 入队事件，如果队列满则立即触发 flush */
  push(event: TelemetryEvent): void {
    this.buffer.push(event);

    if (this.buffer.length >= this.config.maxSize) {
      void this.flush();
    }
  }

  /** 手动触发 flush（将缓冲区所有事件发送到回调） */
  async flush(): Promise<void> {
    if (this.flushing || this.buffer.length === 0) return;

    this.flushing = true;
    const events = this.buffer.splice(0, this.buffer.length);

    try {
      if (this.flushCallback) {
        await this.flushCallback(events);
      }
    } catch (err) {
      // flush 失败，将事件放回缓冲区头部（下次重试）
      this.buffer.unshift(...events);
      if (process.env.DEV) {
        console.warn('[Telemetry] BufferQueue flush failed:', err);
      }
    } finally {
      this.flushing = false;
    }
  }

  /** 当前缓冲区大小 */
  get size(): number {
    return this.buffer.length;
  }

  /**
   * Synchronously drain all buffered events and clear the buffer.
   * Used for unload-safe flushing via sendBeacon.
   */
  drain(): TelemetryEvent[] {
    return this.buffer.splice(0, this.buffer.length);
  }

  /** 销毁队列 */
  destroy(): void {
    this.stop();
    this.buffer = [];
    this.flushCallback = null;
  }
}
