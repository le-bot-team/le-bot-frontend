import { Notify } from 'quasar';

import type {
  CozeWsEventType,
  CozeWsResponse,
  WsAction,
  WsHandler,
  WsResponse,
} from 'src/types/websocket/types';

export class CozeWsWrapper {
  readonly url;
  private _closeHandlers = new Map<string, WsHandler<CloseEvent>>();
  private _eventHandlers = new Map<CozeWsEventType, WsHandler<never>>();
  private _openHandlers = new Map<string, WsHandler<never>>();
  private _ws: WebSocket | undefined;

  constructor(accessToken: string, botId: string) {
    this.url = `wss://ws.coze.cn/v1/chat?authorization=Bearer ${accessToken}&bot_id=${botId}`;
    this._connect();
  }

  destroy() {
    if (this._ws) {
      this._ws.onclose = null;
      this._ws.close();
      this._ws = undefined;
    }
    this._closeHandlers.clear();
    this._eventHandlers.clear();
    this._openHandlers.clear();
  }

  setCloseHandler(id: string, handler: WsHandler<CloseEvent>) {
    this._closeHandlers.set(id, handler);
  }

  deleteCloseHandler(id: string) {
    this._closeHandlers.delete(id);
  }

  setEventHandler<T extends CozeWsResponse>(
    eventType: CozeWsEventType,
    handler: WsHandler<T>,
  ): void;
  setEventHandler<T extends CozeWsResponse>(
    eventTypeList: CozeWsEventType[],
    handler: WsHandler<T>,
  ): void;
  setEventHandler<T extends CozeWsResponse>(
    eventTypeOrEventTypeList: CozeWsEventType | CozeWsEventType[],
    handler: WsHandler<T>,
  ): void {
    if (Array.isArray(eventTypeOrEventTypeList)) {
      eventTypeOrEventTypeList.forEach((eventType) => {
        this._eventHandlers.set(eventType, handler);
      });
    } else {
      this._eventHandlers.set(eventTypeOrEventTypeList, handler);
    }
  }

  deleteEventHandler(eventType: CozeWsEventType) {
    this._eventHandlers.delete(eventType);
  }

  isOpen() {
    return this._ws?.readyState === WebSocket.OPEN;
  }

  sendEvent(id: string, eventType: CozeWsEventType, data: object = {}) {
    this.sendRaw(JSON.stringify({ ...data, id, event_type: eventType }));
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
    this._ws.onclose = async (event) => {
      Notify.create({
        type: 'negative',
        message: 'WebSocket closed, reconnecting...',
        icon: 'close',
      });
      for (const [, handler] of this._closeHandlers) {
        await handler(event);
      }
      setTimeout(() => {
        this._connect();
      }, 3000);
    };
    this._ws.onmessage = async (event) => {
      const message: CozeWsResponse = JSON.parse(event.data);
      console.log(message);
      const handler = this._eventHandlers.get(message.event_type);
      if (handler) {
        await handler(message as never);
      } else {
        Notify.create({
          type: 'warning',
          message: `Unknown event_type: ${message.event_type}`,
          caption: event.data,
          icon: 'help_outline',
        });
      }
    };
    this._ws.onopen = () => console.log('WebSocket opened!');
  }
}

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
  private _actionHandlers: Map<WsAction, WsHandler<never>> = new Map();
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
    this._actionHandlers.clear();
  }

  addOnOpenHandler(handler: () => void) {
    this._onOpenHandlers.push(handler);
  }

  isOpen() {
    return this._ws?.readyState === WebSocket.OPEN;
  }

  setHandler<T extends WsResponse>(action: WsAction, handler: WsHandler<T>) {
    this._actionHandlers.set(action, handler);
  }

  deleteHandler(action: WsAction) {
    this._actionHandlers.delete(action);
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
      if (this._actionHandlers.has(message.action)) {
        await this._actionHandlers.get(message.action)?.call(this, message as never);
      } else {
        Notify.create({
          type: 'warning',
          message: `Unknown action: ${message.action}`,
          caption: JSON.stringify(message.data),
          icon: 'help_outline',
        });
        console.log(message);
      }
    };
    this._ws.onopen = () => {
      this._onOpenHandlers.forEach((handler) => handler());
    };
  }
}
