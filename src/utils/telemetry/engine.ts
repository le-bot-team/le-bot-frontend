/**
 * TelemetryEngine — 遥测事件调度中心
 *
 * 统一管理所有遥测事件的生命周期：
 * 入队 → 隐私过滤 → 采样判定 → 缓冲 → 批量上报
 *                               ↘ 离线降级 → 补发
 *
 * 设计原则：
 * - 对上层完全透明：调用方只需 trackEvent()
 * - 不阻断业务流程：所有操作异步执行，失败静默
 * - 单例模式：全局唯一实例
 */

import type {
  ConversionNode,
  PageEnterMeta,
  TelemetryEngineConfig,
  TelemetryEvent,
  TelemetryEventType,
} from 'src/types/api/telemetry';

import { BufferQueue } from './buffer';
import { OfflineQueue } from './offline';
import { filterEventData, hashUserId } from './privacy';
import { DEFAULT_SAMPLING_CONFIG, shouldSample } from './sampling';
import { sendTelemetryBatch } from 'src/utils/api/telemetry';

// ---------------------------------------------------------------------------
// 默认引擎配置
// ---------------------------------------------------------------------------

const DEFAULT_ENGINE_CONFIG: TelemetryEngineConfig = {
  bufferSize: 50,
  flushInterval: 10_000,
  offlineDbName: 'lebot-telemetry-offline',
  offlineStoreName: 'events',
  offlineMaxEntries: 500,
  offlineFlushBatchSize: 50,
  sampling: DEFAULT_SAMPLING_CONFIG,
  enabled: true,
};

// ---------------------------------------------------------------------------
// UUID 生成
// ---------------------------------------------------------------------------

/** 生成 UUID v4（不依赖外部库） */
function uuid(): string {
  // 优先使用浏览器原生 API
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: 手动生成
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------------------------------------------------------------------------
// TelemetryEngine
// ---------------------------------------------------------------------------

export class TelemetryEngine {
  private config: TelemetryEngineConfig;
  private buffer: BufferQueue;
  private offline: OfflineQueue;
  private batchSeq = 0;

  // 当前页面进入元信息（用于计算停留时长）
  private currentPageEnter: PageEnterMeta | null = null;

  // 引擎状态
  private _initialized = false;

  constructor(config: Partial<TelemetryEngineConfig> = {}) {
    this.config = { ...DEFAULT_ENGINE_CONFIG, ...config };
    this.buffer = new BufferQueue({
      maxSize: this.config.bufferSize,
      flushInterval: this.config.flushInterval,
    });
    this.offline = new OfflineQueue({
      dbName: this.config.offlineDbName,
      storeName: this.config.offlineStoreName,
      maxEntries: this.config.offlineMaxEntries,
      flushBatchSize: this.config.offlineFlushBatchSize,
    });
  }

  // ----- 初始化 -----

  /**
   * 初始化引擎。
   *
   * 必须在应用启动时调用一次。
   * 会启动缓冲队列定时器、初始化离线队列、注册 beforeunload。
   */
  async init(getState: () => EngineState): Promise<void> {
    if (this._initialized || !this.config.enabled) return;

    // 保存 getState 回调
    this._getState = getState;

    // 初始化离线队列
    await this.offline.init();

    // 设置缓冲队列 flush 回调
    this.buffer.onFlush(async (events) => {
      await this.doFlush(events);
    });

    // 设置离线队列 flush 回调
    this.offline.onFlush(async (events) => {
      const success = await this.sendBatch(events);
      return success;
    });

    // 启动定时 flush
    this.buffer.start();

    // 尝试补发离线事件
    if (navigator.onLine) {
      await this.offline.flush();
    }

    // 注册页面卸载前 flush
    this.registerUnload();

    this._initialized = true;

    // 记录会话开始事件
    await this.trackEvent('session_start', 'session_start', '/', '', {});

    if (process.env.DEV) {
      console.debug('[Telemetry] Engine initialized');
    }
  }

  // ----- 事件采集 API -----

  /**
   * 通用事件上报入口。
   *
   * @param type    事件类型
   * @param name    事件名称
   * @param page    当前页面路径
   * @param referrer 来源页面路径
   * @param data    事件自定义数据
   * @param duration 事件持续时长（ms），用于 page_leave 等事件
   */
  async trackEvent(
    type: TelemetryEventType,
    name: string,
    page: string,
    referrer: string,
    data?: Record<string, unknown>,
    duration?: number,
  ): Promise<void> {
    if (!this.config.enabled || !this._initialized) return;

    const state = this._getState();

    // 采样判定：使用当前路由名称（而非事件名称）作为采样配置的 key
    const pageName = (this.currentPageEnter?.name || page.split('/').filter(Boolean).pop() || 'unknown').replace(/[/_]/g, '-');
    const sampled = shouldSample(type, pageName, this.config.sampling);

    // Unsampled non-conversion events are dropped (not sent to backend)
    if (!sampled && type !== 'conversion') {
      return;
    }

    // 隐私过滤
    const filteredData = filterEventData(data);

    // 计算 userIdHash
    const rawId = state.accessToken || state.deviceFingerprint;
    const userIdHash = rawId ? await hashUserId(rawId) : 'anonymous';

    const event: TelemetryEvent = {
      id: uuid(),
      type,
      name,
      page,
      referrer,
      userIdHash,
      sessionId: state.sessionId,
      deviceId: state.deviceId,
      timestamp: Date.now(),
      data: filteredData,
      sampled: true, // Always true for sent events (unsampled events are dropped above)
      ...(duration !== undefined && { duration }),
    };

    this.buffer.push(event);

    if (process.env.DEV) {
      console.debug(`[Telemetry] Event: ${type}/${name}`, event);
    }
  }

  /**
   * 页面进入事件。
   * 由路由守卫调用。
   */
  async trackPageEnter(to: PageEnterMeta, fromPath: string): Promise<void> {
    // 记录进入时间
    this.currentPageEnter = { ...to };

    await this.trackEvent(
      'page_enter',
      to.name || to.path,
      to.path,
      fromPath,
      { routeName: to.name },
    );
  }

  /**
   * 页面离开事件（含停留时长）。
   * 由路由守卫调用。
   */
  async trackPageLeave(fromPath: string): Promise<void> {
    if (!this.currentPageEnter) return;

    const duration = Date.now() - this.currentPageEnter.enterTime;

    await this.trackEvent(
      'page_leave',
      this.currentPageEnter.name || this.currentPageEnter.path,
      fromPath,
      '',
      undefined,
      duration,
    );

    // 清除
    this.currentPageEnter = null;
  }

  /**
   * 点击事件。
   * 由 v-track 指令或 useTracker 调用。
   */
  async trackClick(
    eventName: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    const page = this.currentPageEnter?.path || '/';

    await this.trackEvent('click', eventName, page, '', data);
  }

  /**
   * 自定义业务事件。
   */
  async trackCustom(
    eventName: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    const page = this.currentPageEnter?.path || '/';

    await this.trackEvent('custom', eventName, page, '', data);
  }

  /**
   * 转化节点事件。
   * 转化事件始终全量采集，不受采样率影响。
   */
  async trackConversion(node: ConversionNode, data?: Record<string, unknown>): Promise<void> {
    const page = this.currentPageEnter?.path || '/';

    await this.trackEvent('conversion', `conv_${node}`, page, '', {
      conversionNode: node,
      ...data,
    });
  }

  /**
   * App 从后台恢复事件。
   */
  async trackAppResume(): Promise<void> {
    await this.trackEvent('app_resume', 'app_resume', this.currentPageEnter?.path || '/', '', {});
  }

  // ----- 内部方法 -----

  /** 获取引擎状态的回调（由 init 时注入） */
  private _getState: () => EngineState = () => ({
    sessionId: '',
    deviceFingerprint: '',
    deviceId: null,
    accessToken: '',
  });

  /** 执行 flush：尝试上报，失败则降级到离线队列 */
  private async doFlush(events: TelemetryEvent[]): Promise<void> {
    const success = await this.sendBatch(events);
    if (!success) {
      // 上报失败，降级到离线队列
      await this.offline.enqueue(events);
      if (process.env.DEV) {
        console.warn(`[Telemetry] Flush failed, ${events.length} events queued offline`);
      }
    }
  }

  /** 发送一个批次到后端 */
  private async sendBatch(events: TelemetryEvent[]): Promise<boolean> {
    if (events.length === 0) return true;

    try {
      const request = {
        events,
        clientTime: Date.now(),
        batchSeq: ++this.batchSeq,
      };

      const response = await sendTelemetryBatch(request);

      if (response.success) {
        if (process.env.DEV) {
          console.debug(`[Telemetry] Batch #${this.batchSeq} sent: ${events.length} events`);
        }
        return true;
      }

      if (process.env.DEV) {
        console.warn(`[Telemetry] Batch rejected: ${response.message}`);
      }
      return false;
    } catch (err) {
      if (process.env.DEV) {
        console.warn('[Telemetry] Send error:', err);
      }
      return false;
    }
  }

  /** Unload handler reference for cleanup */
  private _unloadHandler: (() => void) | null = null;
  private _visibilityHandler: (() => void) | null = null;

  /** Register page unload flush using sendBeacon for reliability */
  private registerUnload(): void {
    this._unloadHandler = () => {
      this.flushWithBeacon();
    };

    this._visibilityHandler = () => {
      if (document.visibilityState === 'hidden') {
        this.flushWithBeacon();
      }
    };

    window.addEventListener('beforeunload', this._unloadHandler);
    document.addEventListener('visibilitychange', this._visibilityHandler);
  }

  /** Flush buffered events synchronously using sendBeacon (unload-safe) */
  private flushWithBeacon(): void {
    const events = this.buffer.drain();
    if (events.length === 0) return;

    const beaconUrl = `${process.env.LE_BOT_BACKEND_HTTP_BASE_URL}/api/v1/telemetry/batch`;
    const payload = JSON.stringify({
      events,
      clientTime: Date.now(),
      batchSeq: ++this.batchSeq,
    });

    // Try sendBeacon first (most reliable during unload)
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      const sent = navigator.sendBeacon(beaconUrl, blob);
      if (sent) return;
    }

    // Fallback: fetch with keepalive
    try {
      void fetch(beaconUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      });
    } catch {
      // Last resort: re-enqueue to offline (may not complete during unload)
      void this.offline.enqueue(events);
    }
  }

  /** 销毁引擎 */
  async destroy(): Promise<void> {
    if (this._unloadHandler) {
      window.removeEventListener('beforeunload', this._unloadHandler);
    }
    if (this._visibilityHandler) {
      document.removeEventListener('visibilitychange', this._visibilityHandler);
    }
    this.buffer.stop();
    await this.buffer.flush();
    this.offline.destroy();
    this._initialized = false;
  }
}

// ---------------------------------------------------------------------------
// 引擎状态接口（由 TelemetryStore 提供）
// ---------------------------------------------------------------------------

/** 引擎运行时需要从 Store 获取的状态 */
export interface EngineState {
  sessionId: string;
  deviceFingerprint: string;
  deviceId: string | null;
  accessToken: string;
}

// ---------------------------------------------------------------------------
// 全局单例
// ---------------------------------------------------------------------------

let _instance: TelemetryEngine | null = null;

/** 获取全局 TelemetryEngine 实例 */
export function getTelemetryEngine(): TelemetryEngine {
  if (!_instance) {
    _instance = new TelemetryEngine();
  }
  return _instance;
}

/** 创建自定义配置的 TelemetryEngine 实例（用于测试或特殊场景） */
export function createTelemetryEngine(config: Partial<TelemetryEngineConfig>): TelemetryEngine {
  _instance = new TelemetryEngine(config);
  return _instance;
}
