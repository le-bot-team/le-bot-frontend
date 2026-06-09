/**
 * IndexedDB-backed chat history storage — device-isolated.
 *
 * Each device gets its own object store inside the shared database, ensuring
 * chat histories are completely isolated between devices.
 *
 * DB name  : lebot-chat-history
 * Version  : dynamic (starts at 2, bumped each time a new device store is added)
 * Stores   : one object store per deviceId, named "dev:<deviceId>"
 *   - keyPath : id
 *   - index   : timestamp (non-unique)
 */

import type { PersistedChatMessage } from 'stores/chat';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A calendar-date entry returned by getDateList(). */
export interface ChatDateEntry {
  /** YYYY-MM-DD */
  date: string;
  /** Earliest message timestamp of that day (ms) */
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toDayKey(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfDayMs(timestamp: number): number {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Build the per-device store name. */
function storeNameFor(deviceId: string): string {
  return `dev:${deviceId}`;
}

/**
 * Read the persisted DB version from localStorage.
 * We store it externally so that upgrades are consistent across page loads.
 */
const VERSION_KEY = 'lebot-chat-history:idb-version';
const BASE_VERSION = 2;

function readVersion(): number {
  return parseInt(localStorage.getItem(VERSION_KEY) ?? String(BASE_VERSION), 10);
}

function writeVersion(v: number): void {
  localStorage.setItem(VERSION_KEY, String(v));
}

// ---------------------------------------------------------------------------
// ChatHistoryDB
// ---------------------------------------------------------------------------

export class ChatHistoryDB {
  private db: IDBDatabase | null = null;
  private dbName = 'lebot-chat-history';
  /** Currently-bound device ID (set via init()). */
  private deviceId = '';

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Open (or create) the IndexedDB database and bind it to a specific device.
   * If the device's object store does not yet exist, the DB is automatically
   * closed and re-opened with a bumped version to trigger onupgradeneeded.
   *
   * @param deviceId - unique identifier for the current device
   */
  async init(deviceId: string): Promise<void> {
    this.deviceId = deviceId;

    if (this.db) {
      // DB already open — check if this device's store exists
      if (!this.db.objectStoreNames.contains(storeNameFor(deviceId))) {
        // Close and reopen with a new version to create the store
        this.db.close();
        this.db = null;
        await this._reopenWithNewStore();
      }
      return;
    }

    // First-time open
    this.db = await this._openDB(readVersion());

    // If the device store still doesn't exist (first time this device is seen),
    // close and re-open with a bumped version
    if (!this.db.objectStoreNames.contains(storeNameFor(deviceId))) {
      this.db.close();
      this.db = null;
      await this._reopenWithNewStore();
    }
  }

  /** Close the database connection. */
  destroy(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.deviceId = '';
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  async addMessages(msgs: PersistedChatMessage[]): Promise<void> {
    if (!this.db || msgs.length === 0) return;
    const name = this._storeName();
    const tx = this.db.transaction(name, 'readwrite');
    const store = tx.objectStore(name);
    for (const msg of msgs) {
      store.put(msg);
    }
    await this._completeTx(tx);
  }

  async getLatest(limit: number): Promise<PersistedChatMessage[]> {
    if (!this.db) return [];
    const name = this._storeName();
    const all = await this._readAll(name, 'prev');
    const slice = all.slice(0, limit);
    slice.sort((a, b) => a.timestamp - b.timestamp);
    return slice;
  }

  async getOlder(before: number, limit: number): Promise<PersistedChatMessage[]> {
    if (!this.db) return [];
    const name = this._storeName();
    const tx = this.db.transaction(name, 'readonly');
    const store = tx.objectStore(name);
    const index = store.index('timestamp');
    const range = IDBKeyRange.upperBound(before, true);
    const results: PersistedChatMessage[] = [];

    return new Promise((resolve, reject) => {
      const req = index.openCursor(range, 'prev');
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value as PersistedChatMessage);
          cursor.continue();
        } else {
          results.sort((a, b) => a.timestamp - b.timestamp);
          resolve(results);
        }
      };
      req.onerror = () => reject(new Error(req.error?.message ?? 'IDB getOlder failed'));
    });
  }

  async getByDateRange(startMs: number, endMs: number): Promise<PersistedChatMessage[]> {
    if (!this.db) return [];
    const name = this._storeName();
    const tx = this.db.transaction(name, 'readonly');
    const store = tx.objectStore(name);
    const index = store.index('timestamp');
    const range = IDBKeyRange.bound(startMs, endMs);
    const results: PersistedChatMessage[] = [];

    return new Promise((resolve, reject) => {
      const req = index.openCursor(range);
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          results.push(cursor.value as PersistedChatMessage);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      req.onerror = () => reject(new Error(req.error?.message ?? 'IDB getByDateRange failed'));
    });
  }

  async getDateList(): Promise<ChatDateEntry[]> {
    if (!this.db) return [];
    const name = this._storeName();
    const tx = this.db.transaction(name, 'readonly');
    const store = tx.objectStore(name);
    const index = store.index('timestamp');
    const seen = new Set<string>();
    const entries: ChatDateEntry[] = [];

    return new Promise((resolve, reject) => {
      const req = index.openCursor(null, 'prev');
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          const msg = cursor.value as PersistedChatMessage;
          const key = toDayKey(msg.timestamp);
          if (!seen.has(key)) {
            seen.add(key);
            entries.push({ date: key, timestamp: startOfDayMs(msg.timestamp) });
          }
          cursor.continue();
        } else {
          resolve(entries);
        }
      };
      req.onerror = () => reject(new Error(req.error?.message ?? 'IDB getDateList failed'));
    });
  }

  async count(): Promise<number> {
    if (!this.db) return 0;
    const name = this._storeName();
    const tx = this.db.transaction(name, 'readonly');
    return new Promise((resolve, reject) => {
      const req = tx.objectStore(name).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(new Error(req.error?.message ?? 'IDB count failed'));
    });
  }

  async hasOlder(before: number): Promise<boolean> {
    if (!this.db) return false;
    const name = this._storeName();
    const tx = this.db.transaction(name, 'readonly');
    const index = tx.objectStore(name).index('timestamp');
    const range = IDBKeyRange.upperBound(before, true);
    return new Promise((resolve, reject) => {
      const req = index.openCursor(range, 'prev');
      req.onsuccess = () => resolve(req.result !== null);
      req.onerror = () => reject(new Error(req.error?.message ?? 'IDB hasOlder failed'));
    });
  }

  async clear(): Promise<void> {
    if (!this.db) return;
    const name = this._storeName();
    const tx = this.db.transaction(name, 'readwrite');
    tx.objectStore(name).clear();
    await this._completeTx(tx);
  }

  /** Delete the entire database. Must be called after destroy(). */
  async deleteDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase(this.dbName);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(new Error(req.error?.message ?? 'IDB deleteDatabase failed'));
    });
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /** Return the store name for the currently-bound device. */
  private _storeName(): string {
    return storeNameFor(this.deviceId);
  }

  /** Open the DB at the given version, creating the current device store on upgrade. */
  private _openDB(version: number): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, version);

      request.onupgradeneeded = () => {
        const db = request.result;
        const name = storeNameFor(this.deviceId);
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(request.error?.message ?? 'IDB open failed'));
    });
  }

  /**
   * Close the current DB and re-open with a bumped version, which triggers
   * onupgradeneeded and creates the missing device store.
   */
  private async _reopenWithNewStore(): Promise<void> {
    const newVersion = readVersion() + 1;
    writeVersion(newVersion);
    this.db = await this._openDB(newVersion);
  }

  private _readAll(
    storeName: string,
    direction: IDBCursorDirection,
  ): Promise<PersistedChatMessage[]> {
    if (!this.db) return Promise.resolve([]);
    const tx = this.db.transaction(storeName, 'readonly');
    const index = tx.objectStore(storeName).index('timestamp');
    const results: PersistedChatMessage[] = [];

    return new Promise((resolve, reject) => {
      const req = index.openCursor(null, direction);
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          results.push(cursor.value as PersistedChatMessage);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      req.onerror = () => reject(new Error(req.error?.message ?? 'IDB readAll failed'));
    });
  }

  private _completeTx(tx: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error(tx.error?.message ?? 'IDB transaction failed'));
    });
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let instance: ChatHistoryDB | null = null;

/** Return (or create) the shared ChatHistoryDB instance. */
export function getChatHistoryDB(): ChatHistoryDB {
  if (!instance) {
    instance = new ChatHistoryDB();
  }
  return instance;
}
