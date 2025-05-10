import { Notify } from 'quasar';

import type { WsAction, WsHandler, WsResponse } from 'src/types/websocket/types';

export class WsWrapper {
  readonly url;

  private _onOpenHandlers: (() => void)[] = [
    () =>
      Notify.create({
        type: 'positive',
        message: 'WebSocket connected',
        icon: 'check',
      }),
  ];
  private _actionMessageHandlers: Map<WsAction, WsHandler<never>> = new Map();
  private _genericMessageHandlers: Map<string, WsHandler<never>> = new Map();
  private _ws: WebSocket | undefined;

  constructor(url: string) {
    this.url = url;
    this._connect();
  }

  destroy() {
    if (this._ws) {
      this._ws.onclose = null;
      this._ws.close();
      this._ws = undefined;
    }
    this._actionMessageHandlers.clear();
  }

  addOnOpenHandler(handler: () => void) {
    this._onOpenHandlers.push(handler);
  }

  isOpen() {
    return this._ws?.readyState === WebSocket.OPEN;
  }

  setActionHandler<T extends WsResponse>(action: WsAction, handler: WsHandler<T>) {
    this._actionMessageHandlers.set(action, handler);
  }

  deleteActionHandler(action: WsAction) {
    this._actionMessageHandlers.delete(action);
  }

  setGenericHandler<T extends WsResponse>(id: string, handler: WsHandler<T>) {
    this._genericMessageHandlers.set(id, handler);
  }

  deleteGenericHandler(id: string) {
    this._genericMessageHandlers.delete(id);
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
      Notify.create({
        type: 'negative',
        message: 'WebSocket closed, reconnecting...',
        icon: 'close',
      });
      setTimeout(() => {
        this._connect();
      }, 3000);
    };
    this._ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.action) {
        if (this._actionMessageHandlers.has(message.action)) {
          await this._actionMessageHandlers.get(message.action)?.call(this, message as never);
        } else {
          Notify.create({
            type: 'warning',
            message: `Unknown action: ${message.action}`,
            caption: JSON.stringify(message.data),
            icon: 'help_outline',
          });
          console.log(message);
        }
      } else {
        this._genericMessageHandlers.forEach((handler) => {
          handler(message as never).catch((e) => console.warn(e));
        });
      }
    };
    this._ws.onopen = () => {
      this._onOpenHandlers.forEach((handler) => handler());
    };
  }
}
