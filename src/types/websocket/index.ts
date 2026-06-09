import type { WsAction, WsHandler, WsRequest, WsResponseMapping } from 'src/types/websocket/types';

/** Heartbeat interval — send ping every 25 s */
const HEARTBEAT_INTERVAL_MS = 25_000;
/** If no data received for this long, consider the connection dead */
const HEARTBEAT_TIMEOUT_MS = 60_000;

export class WsWrapper {
  readonly url;

  private _onOpenHandlers: (() => void)[] = [];
  private _onCloseHandlers: (() => void)[] = [];
  private _actionHandlers: Map<WsAction, WsHandler<never>> = new Map();
  private _ws: WebSocket | undefined;
  private _reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  private _heartbeatTimer: ReturnType<typeof setInterval> | undefined;
  private _lastReceivedAt = 0;
  private _destroyed = false;

  constructor(url: string) {
    this.url = url;
    this._connect();
  }

  destroy() {
    this._destroyed = true;
    this._stopHeartbeat();
    if (this._reconnectTimer !== undefined) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = undefined;
    }
    if (this._ws) {
      this._ws.onclose = null;
      this._ws.onerror = null;
      this._ws.close();
      this._ws = undefined;
    }
    this._actionHandlers.clear();
  }

  addOnOpenHandler(handler: () => void) {
    this._onOpenHandlers.push(handler);
  }

  addOnCloseHandler(handler: () => void) {
    this._onCloseHandlers.push(handler);
  }

  isOpen() {
    return this._ws?.readyState === WebSocket.OPEN;
  }

  setHandler<T extends WsAction>(action: T, handler: WsHandler<WsResponseMapping[T]>) {
    this._actionHandlers.set(action, handler);
  }

  deleteHandler(action: WsAction) {
    this._actionHandlers.delete(action);
  }

  sendAction<T extends WsRequest>(wsRequest: T) {
    this.sendRaw(JSON.stringify(wsRequest));
  }

  /** Whether the connection is alive (received data within heartbeat timeout). */
  isAlive(): boolean {
    if (!this.isOpen()) return false;
    return Date.now() - this._lastReceivedAt < HEARTBEAT_TIMEOUT_MS;
  }

  /** Force-close the current socket to trigger auto-reconnect. */
  forceReconnect(): void {
    if (this._ws) {
      console.log('[WsWrapper] Forcing reconnect due to heartbeat timeout');
      this._ws.close();
    }
  }

  sendRaw(message: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (this.isOpen()) {
      this._ws?.send(message);
    } else {
      console.log('[WsWrapper] Cannot send — WebSocket not open');
    }
  }

  private _connect() {
    if (this._destroyed) return;
    this._ws = new WebSocket(this.url);
    this._ws.onerror = (event) => {
      console.error('[WsWrapper] WebSocket error:', event);
    };
    this._ws.onclose = () => {
      if (this._destroyed) return;
      this._stopHeartbeat();
      console.log('[WsWrapper] WebSocket closed, reconnecting in 3s...');
      this._onCloseHandlers.forEach((handler) => handler());
      if (this._reconnectTimer !== undefined) {
        clearTimeout(this._reconnectTimer);
      }
      this._reconnectTimer = setTimeout(() => {
        this._reconnectTimer = undefined;
        this._connect();
      }, 3000);
    };
    this._ws.onmessage = async (event) => {
      // Any incoming data resets the heartbeat timer
      this._lastReceivedAt = Date.now();

      // Only process text (JSON) messages; ignore binary (Blob/ArrayBuffer)
      if (typeof event.data !== 'string') {
        return;
      }

      let message: { action?: WsAction; data?: unknown };
      try {
        message = JSON.parse(event.data);
      } catch {
        console.warn('[WsWrapper] Failed to parse message:', event.data);
        return;
      }
      // Guard: if the parsed object has no action field, silently ignore
      // (e.g. server heartbeat responses or non-action control messages)
      if (!message.action) {
        return;
      }
      // Heartbeat pong — silently consumed (already reset _lastReceivedAt above)
      if (message.action === ('pong' as WsAction)) {
        return;
      }
      console.log('[WsWrapper] Received action:', message.action);
      if (this._actionHandlers.has(message.action)) {
        await this._actionHandlers.get(message.action)?.call(this, message as never);
      } else {
        console.warn('[WsWrapper] Unknown action:', message.action, message.data);
      }
    };
    this._ws.onopen = () => {
      this._lastReceivedAt = Date.now();
      this._startHeartbeat();
      this._onOpenHandlers.forEach((handler) => handler());
    };
  }

  /** Start periodic ping to keep the connection alive and detect half-open sockets. */
  private _startHeartbeat(): void {
    this._stopHeartbeat();
    this._heartbeatTimer = setInterval(() => {
      if (!this.isOpen()) return;
      if (Date.now() - this._lastReceivedAt > HEARTBEAT_TIMEOUT_MS) {
        // No data received within timeout — connection is likely dead
        console.warn(
          '[WsWrapper] Heartbeat timeout — no data for',
          Math.round((Date.now() - this._lastReceivedAt) / 1000),
          's',
        );
        this.forceReconnect();
        return;
      }
      // Send application-level ping
      this.sendRaw(JSON.stringify({ action: 'ping' }));
    }, HEARTBEAT_INTERVAL_MS);
  }

  private _stopHeartbeat(): void {
    if (this._heartbeatTimer !== undefined) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = undefined;
    }
  }
}
