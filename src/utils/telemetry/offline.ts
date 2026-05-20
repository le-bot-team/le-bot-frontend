/**
 * 离线队列
 *
 * 基于 IndexedDB 的持久化队列，用于：
 * 1. 上报失败时暂存事件，等待重试
 * 2. PWA 离线时暂存事件，监听 online 事件后自动补发
 *
 * 使用原生 IndexedDB API，无需额外依赖。
 */

import type { TelemetryEvent } from 'src/types/api/telemetry';

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

/** 离线队列配置 */
export interface OfflineQueueConfig {
  /** IndexedDB 数据库名 */
  dbName: string;
  /** IndexedDB object store 名 */
  storeName: string;
  /** 最大存储条目数（FIFO 淘汰） */
  maxEntries: number;
  /** 单次补发最大批次大小 */
  flushBatchSize: number;
}

/** 默认配置 */
const DEFAULT_CONFIG: OfflineQueueConfig = {
  dbName: 'lebot-telemetry-offline',
  storeName: 'events',
  maxEntries: 500,
  flushBatchSize: 50,
};

/** 补发回调 */
export type OfflineFlushCallback = (events: TelemetryEvent[]) => Promise<boolean>;

// ---------------------------------------------------------------------------
// OfflineQueue
// ---------------------------------------------------------------------------

export class OfflineQueue {
  private config: OfflineQueueConfig;
  private db: IDBDatabase | null = null;
  private flushCallback: OfflineFlushCallback | null = null;
  private onlineHandler: (() => void) | null = null;
  private visibilityHandler: (() => void) | null = null;
  private initialized = false;
  private _flushing = false;

  constructor(config: Partial<OfflineQueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ----- 初始化 -----

  /** 初始化 IndexedDB 和事件监听 */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      this.db = await this.openDB();
      this.listenOnline();
      this.listenVisibility();
      this.initialized = true;
    } catch (err) {
      if (process.env.DEV) {
        console.warn('[Telemetry] OfflineQueue init failed, offline persistence disabled:', err);
      }
    }
  }

  // ----- 公开 API -----

  /** 设置补发回调 */
  onFlush(callback: OfflineFlushCallback): void {
    this.flushCallback = callback;
  }

  /** 入队事件（持久化到 IndexedDB） */
  async enqueue(events: TelemetryEvent[]): Promise<void> {
    if (!this.db || events.length === 0) return;

    try {
      const tx = this.db.transaction(this.config.storeName, 'readwrite');
      const store = tx.objectStore(this.config.storeName);

      for (const event of events) {
        store.add(event);
      }

      await this.completeTransaction(tx);

      // 检查是否超过最大条目数，执行 FIFO 淘汰
      await this.evictIfNeeded();
    } catch (err) {
      if (process.env.DEV) {
        console.warn('[Telemetry] OfflineQueue enqueue failed:', err);
      }
    }
  }

  /** 当前队列中的事件数量 */
  async count(): Promise<number> {
    if (!this.db) return 0;

    try {
      const tx = this.db.transaction(this.config.storeName, 'readonly');
      const store = tx.objectStore(this.config.storeName);
      return new Promise((resolve, reject) => {
        const req = store.count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(new Error(req.error?.message ?? 'IDB count failed'));
      });
    } catch {
      return 0;
    }
  }

  /** 补发所有离线事件（按批次） */
  async flush(): Promise<void> {
    if (!this.db || !this.flushCallback || this._flushing) return;

    this._flushing = true;
    try {
      let continueFlush = true;
      while (continueFlush) {
        const batch = await this.readBatch(this.config.flushBatchSize);
        if (batch.length === 0) break;

        const success = await this.flushCallback(batch);
        if (success) {
          // 上报成功，删除已补发的事件
          await this.deleteEvents(batch.map((e) => e.id));
        } else {
          // 上报失败，停止补发
          continueFlush = false;
        }
      }
    } catch (err) {
      if (process.env.DEV) {
        console.warn('[Telemetry] OfflineQueue flush failed:', err);
      }
    } finally {
      this._flushing = false;
    }
  }

  /** 销毁队列 */
  destroy(): void {
    this.unlistenOnline();
    this.unlistenVisibility();

    if (this.db) {
      this.db.close();
      this.db = null;
    }

    this.initialized = false;
  }

  // ----- IndexedDB 操作 -----

  /** 打开/创建 IndexedDB */
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const store = db.createObjectStore(this.config.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(request.error?.message ?? 'IDB open failed'));
    });
  }

  /** 读取一批事件（按时间戳排序） */
  private readBatch(limit: number): Promise<TelemetryEvent[]> {
    if (!this.db) return Promise.resolve([]);

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.config.storeName, 'readonly');
      const store = tx.objectStore(this.config.storeName);
      const index = store.index('timestamp');
      const results: TelemetryEvent[] = [];

      const request = index.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(new Error(request.error?.message ?? 'IDB readBatch failed'));
    });
  }

  /** 删除指定 ID 的事件 */
  private async deleteEvents(ids: string[]): Promise<void> {
    if (!this.db || ids.length === 0) return;

    const tx = this.db.transaction(this.config.storeName, 'readwrite');
    const store = tx.objectStore(this.config.storeName);

    for (const id of ids) {
      store.delete(id);
    }

    await this.completeTransaction(tx);
  }

  /** FIFO 淘汰超过 maxEntries 的旧事件 */
  private async evictIfNeeded(): Promise<void> {
    const count = await this.count();
    if (count <= this.config.maxEntries) return;

    const deleteCount = count - this.config.maxEntries;
    if (!this.db) return;

    const tx = this.db.transaction(this.config.storeName, 'readwrite');
    const store = tx.objectStore(this.config.storeName);
    const index = store.index('timestamp');

    // Attach completion handler BEFORE starting cursor operations
    const txComplete = this.completeTransaction(tx);

    let deleted = 0;
    await new Promise<void>((resolve, reject) => {
      const request = index.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && deleted < deleteCount) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(new Error(request.error?.message ?? 'IDB evict failed'));
    });

    // Wait for the transaction to fully commit
    await txComplete;
  }

  /** 等待事务完成 */
  private completeTransaction(tx: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error(tx.error?.message ?? 'IDB transaction failed'));
    });
  }

  // ----- 事件监听 -----

  /** 监听网络恢复事件 */
  private listenOnline(): void {
    this.onlineHandler = () => {
      if (process.env.DEV) {
        console.debug('[Telemetry] Network online, flushing offline queue');
      }
      void this.flush();
    };
    window.addEventListener('online', this.onlineHandler);
  }

  private unlistenOnline(): void {
    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler);
      this.onlineHandler = null;
    }
  }

  /** 监听页面可见性恢复（从后台切回前台时尝试补发） */
  private listenVisibility(): void {
    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        void this.flush();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  private unlistenVisibility(): void {
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }
}
