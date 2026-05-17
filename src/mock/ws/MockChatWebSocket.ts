/**
 * Mock WebSocket stub for development.
 * Replaces the global WebSocket during mock mode. Currently echoes back
 * a generic acknowledgment on send(); full chat protocol simulation
 * will be implemented in a future PR.
 */
export class MockChatWebSocket extends EventTarget implements Partial<WebSocket> {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSING = 2;
  readonly CLOSED = 3;

  readyState: number = MockChatWebSocket.CONNECTING;
  url: string;
  protocol = '';
  extensions = '';
  bufferedAmount = 0;
  binaryType: BinaryType = 'blob';

  onopen: ((ev: Event) => void) | null = null;
  onclose: ((ev: CloseEvent) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(url: string | URL, protocols?: string | string[]) {
    super();
    this.url = url.toString();

    // Simulate async connection open
    queueMicrotask(() => {
      if (this.readyState !== MockChatWebSocket.CONNECTING) return;
      this.readyState = MockChatWebSocket.OPEN;
      const event = new Event('open');
      this.onopen?.(event);
      this.dispatchEvent(event);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    // Stub: echo back a minimal acknowledgment so chat flows don't hang silently
    queueMicrotask(() => {
      if (this.readyState !== MockChatWebSocket.OPEN) return;
      const response = JSON.stringify({ type: 'echo', message: 'Mock WS received message (stub)' });
      const event = new MessageEvent('message', { data: response });
      this.onmessage?.(event);
      this.dispatchEvent(event);
    });
  }

  close(code?: number, reason?: string): void {
    this.readyState = MockChatWebSocket.CLOSED;
    const event = new CloseEvent('close', { code: code ?? 1000, reason: reason ?? '' });
    this.onclose?.(event);
    this.dispatchEvent(event);
  }
}
