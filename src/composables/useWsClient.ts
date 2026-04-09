import { ref, type Ref } from 'vue';

import { WsWrapper } from 'src/types/websocket';
import type { WsAction, WsHandler, WsRequest, WsResponseMapping } from 'src/types/websocket/types';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected';

export interface UseWsClientReturn {
  /** Reactive connection state */
  connectionState: Ref<ConnectionState>;
  /** Connect to the WebSocket server */
  connect: (url: string) => void;
  /** Disconnect and destroy the WebSocket */
  disconnect: () => void;
  /** Register a typed action handler */
  onAction: <T extends WsAction>(action: T, handler: WsHandler<WsResponseMapping[T]>) => void;
  /** Remove an action handler */
  offAction: (action: WsAction) => void;
  /** Send a typed request */
  sendAction: <T extends WsRequest>(request: T) => void;
  /** Whether the WebSocket is currently open */
  isConnected: () => boolean;
}

/**
 * Reactive wrapper around WsWrapper for Vue composable usage.
 * Manages WebSocket lifecycle with auto-reconnect inherited from WsWrapper.
 */
export function useWsClient(): UseWsClientReturn {
  const connectionState = ref<ConnectionState>('disconnected');

  let ws: WsWrapper | undefined;
  // Pending handlers registered before connect — will be applied on connect
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingHandlers = new Map<WsAction, WsHandler<any>>();

  function connect(url: string) {
    if (ws) {
      disconnect();
    }

    connectionState.value = 'connecting';
    ws = new WsWrapper(url);

    // WsWrapper fires onOpen handlers when connected (including reconnects)
    ws.addOnOpenHandler(() => {
      connectionState.value = 'connected';
    });

    // Apply any handlers registered before connect
    for (const [action, handler] of pendingHandlers) {
      ws.setHandler(action, handler);
    }
    pendingHandlers.clear();
  }

  function disconnect() {
    if (ws) {
      ws.destroy();
      ws = undefined;
    }
    connectionState.value = 'disconnected';
  }

  function onAction<T extends WsAction>(action: T, handler: WsHandler<WsResponseMapping[T]>) {
    if (ws) {
      ws.setHandler(action, handler);
    } else {
      // Queue handler for when connect() is called
      pendingHandlers.set(action, handler);
    }
  }

  function offAction(action: WsAction) {
    if (ws) {
      ws.deleteHandler(action);
    }
    pendingHandlers.delete(action);
  }

  function sendAction<T extends WsRequest>(request: T) {
    if (ws) {
      ws.sendAction(request);
    } else {
      console.warn('[useWsClient] Cannot send — not connected');
    }
  }

  function isConnected(): boolean {
    return ws?.isOpen() ?? false;
  }

  return {
    connectionState,
    connect,
    disconnect,
    onAction,
    offAction,
    sendAction,
    isConnected,
  };
}
