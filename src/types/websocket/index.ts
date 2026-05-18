import type { WsAction, WsHandler, WsRequest, WsResponseMapping } from 'src/types/websocket/types';

export class WsWrapper {
  readonly url;

  private _onOpenHandlers: (() => void)[] = [];
  private _actionHandlers: Map<WsAction, WsHandler<never>> = new Map();
  private _ws: WebSocket | undefined;
  private _reconnectTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(url: string) {
    this.url = url;
    this._connect();
  }

  destroy() {
    if (this._reconnectTimer !== undefined) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = undefined;
    }
    if (this._ws) {
      this._ws.onclose = null;
      this._ws.close();
      this._ws = undefined;
    }
    this._actionHandlers.clear();
  }

  addOnOpenHandler(handler: () => void) {
    this._onOpenHandlers.push(handler);
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

  sendRaw(message: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (this.isOpen()) {
      this._ws?.send(message);
    } else {
      console.log('WebSocket not connected');
    }
  }

  private _connect() {
    this._ws = new WebSocket(this.url);
    this._ws.onclose = () => {
      console.log('[WsWrapper] WebSocket closed, reconnecting in 3s...');
      this._reconnectTimer = setTimeout(() => {
        this._reconnectTimer = undefined;
        this._connect();
      }, 3000);
    };
    this._ws.onmessage = async (event) => {
      const message = JSON.parse(event.data as string);
      if (this._actionHandlers.has(message.action)) {
        await this._actionHandlers.get(message.action)?.call(this, message as never);
      } else {
        console.warn('[WsWrapper] Unknown action:', message.action, message.data);
      }
    };
    this._ws.onopen = () => {
      this._onOpenHandlers.forEach((handler) => handler());
    };
  }
}
