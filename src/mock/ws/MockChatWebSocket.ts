import { uid } from 'quasar';

import { WsAction } from 'src/types/websocket/types';

interface MockMessageEvent {
  data: string;
}

type EventHandler = (event?: MockMessageEvent) => void;

export class MockChatWebSocket {
  // Static constants matching the native WebSocket API
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readonly url: string;
  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSING = 2;
  readonly CLOSED = 3;

  readyState: number = 0;
  onopen: ((event?: MockMessageEvent) => void) | null = null;
  onmessage: EventHandler | null = null;
  onclose: ((event?: MockMessageEvent) => void) | null = null;
  onerror: ((event?: MockMessageEvent) => void) | null = null;

  private _conversationId: string;
  private _inputStarted = false;
  private _timers: ReturnType<typeof setTimeout>[] = [];

  constructor(url: string) {
    this.url = url;
    this._conversationId = '';

    setTimeout(() => {
      this.readyState = 1;
      this.onopen?.();

      this._dispatch({
        id: uid(),
        action: WsAction.establishConnection,
        success: true,
        message: 'Connection established',
      });
    }, 100);
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (this.readyState !== 1) {
      console.warn('[MockChatWebSocket] Cannot send — not open');
      return;
    }

    if (typeof data !== 'string') return;

    let request: { id: string; action: string; data?: Record<string, unknown> };
    try {
      request = JSON.parse(data);
    } catch {
      return;
    }

    const action = request.action as WsAction;
    switch (action) {
      case WsAction.updateConfig:
        this._handleUpdateConfig(request);
        break;
      case WsAction.inputAudioStream:
        this._handleInputAudioStream();
        break;
      case WsAction.inputAudioComplete:
        this._handleInputAudioComplete();
        break;
      case WsAction.cancelOutput:
        this._handleCancelOutput(request);
        break;
      case WsAction.clearContext:
        this._handleClearContext();
        break;
    }
  }

  close(): void {
    this.readyState = 3;
    for (const t of this._timers) clearTimeout(t);
    this._timers = [];
    this.onclose?.();
  }

  private _handleUpdateConfig(request: { id: string; data?: Record<string, unknown> }): void {
    const data = request.data as { conversationId?: string } | undefined;
    this._conversationId = data?.conversationId || uid();
    this._dispatch({
      id: uid(),
      action: WsAction.updateConfig,
      success: true,
      data: { conversationId: this._conversationId },
    });
  }

  private _handleInputAudioStream(): void {
    if (this._inputStarted) return;
    this._inputStarted = true;

    this._addTimer(
      setTimeout(() => {
        this._simulateChatTurn();
      }, 1500),
    );
  }

  private _handleInputAudioComplete(): void {
    // Acknowledge audio complete — no action needed in mock
  }

  private _handleCancelOutput(request: { id: string; data?: Record<string, unknown> }): void {
    const data = request.data as { cancelType?: string } | undefined;
    for (const t of this._timers) clearTimeout(t);
    this._timers = [];
    this._inputStarted = false;

    this._dispatch({
      id: uid(),
      action: WsAction.cancelOutput,
      success: true,
      data: { cancelType: data?.cancelType ?? 'manual' },
    });
  }

  private _handleClearContext(): void {
    this._conversationId = '';
    this._dispatch({
      id: uid(),
      action: WsAction.clearContext,
      success: true,
    });
  }

  // ==========================================================================
  // Simulated chat turn
  // ==========================================================================

  private _simulateChatTurn(): void {
    const chatId = uid();
    const conversationId = this._conversationId;

    const chunks = [0, 1, 2];
    const assistantText = '你好！我是乐宝AI助手。今天有什么可以帮你的吗？';

    for (let i = 0; i < chunks.length; i++) {
      this._addTimer(
        setTimeout(() => {
          this._dispatch({
            id: uid(),
            action: WsAction.outputAudioStream,
            success: true,
            data: {
              chatId,
              conversationId,
              buffer: generateMockAudioChunk(),
            },
          });

          const partialText = assistantText.slice(
            0,
            Math.floor(((i + 1) / chunks.length) * assistantText.length),
          );
          this._dispatch({
            id: uid(),
            action: WsAction.outputTextStream,
            success: true,
            data: {
              chatId,
              conversationId,
              role: 'assistant',
              text: partialText,
            },
          });
        }, i * 800),
      );
    }

    const totalDelay = chunks.length * 800 + 300;

    this._addTimer(
      setTimeout(() => {
        this._dispatch({
          id: uid(),
          action: WsAction.outputAudioComplete,
          success: true,
          data: { chatId, conversationId },
        });
      }, totalDelay),
    );

    this._addTimer(
      setTimeout(() => {
        this._dispatch({
          id: uid(),
          action: WsAction.outputTextComplete,
          success: true,
          data: {
            chatId,
            conversationId,
            role: 'assistant',
            text: assistantText,
          },
        });
      }, totalDelay),
    );

    this._addTimer(
      setTimeout(() => {
        this._inputStarted = false;
        this._dispatch({
          id: uid(),
          action: WsAction.chatComplete,
          success: true,
          data: {
            chatId,
            conversationId,
            createdAt: Date.now() - 5000,
            completedAt: Date.now(),
          },
        });
      }, totalDelay + 500),
    );
  }

  private _dispatch(message: Record<string, unknown>): void {
    if (this.readyState === 1 && this.onmessage) {
      this.onmessage({ data: JSON.stringify(message) });
    }
  }

  private _addTimer(timer: ReturnType<typeof setTimeout>): void {
    this._timers.push(timer);
  }
}

// ============================================================================
// Mock audio generation
// ============================================================================

function generateMockAudioChunk(): string {
  const sampleRate = 16000;
  const durationMs = 200;
  const numSamples = Math.floor(sampleRate * (durationMs / 1000));
  const frequency = 440;
  const amplitude = 0.05;

  const buffer = new ArrayBuffer(numSamples * 2);
  const view = new DataView(buffer);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t) * amplitude * 32767;
    view.setInt16(i * 2, Math.floor(sample), true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }

  return btoa(binary);
}
