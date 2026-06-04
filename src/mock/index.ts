import MockAdapter from 'axios-mock-adapter';
import { api } from 'boot/axios';

import { setupDeviceMock } from 'src/mock/handlers/device';
import { setupFamilyGroupMock } from 'src/mock/handlers/family-group';
import { setupProfileMock } from 'src/mock/handlers/profile';
import { setupVoiceprintMock } from 'src/mock/handlers/voiceprint';
import { MockChatWebSocket } from 'src/mock/ws/MockChatWebSocket';

import type { MockSetupFn } from 'src/mock/utils';
import { MOCK_DELAY_MS } from 'src/mock/utils';

let mock: MockAdapter | null = null;
let originalWebSocket: typeof WebSocket | null = null;

const handlers: MockSetupFn[] = [
  // Auth mock removed — auth endpoints now hit the real backend
  setupDeviceMock,
  setupFamilyGroupMock,
  setupProfileMock,
  setupVoiceprintMock,
];

/**
 * Initialize all HTTP API mocks by registering handlers on the axios instance.
 */
export function setupMock(): void {
  if (mock) return;

  mock = new MockAdapter(api, { delayResponse: MOCK_DELAY_MS, onNoMatch: 'passthrough' });

  for (const handler of handlers) {
    handler(mock);
  }

  console.warn('[Mock] HTTP API mocking enabled — handlers are stubs, no routes registered yet');
}

/**
 * Replace global WebSocket with MockChatWebSocket for development.
 */
export function setupWsMock(): void {
  if (originalWebSocket) return;

  originalWebSocket = window.WebSocket;
  (window as { WebSocket: unknown }).WebSocket = MockChatWebSocket;

  console.warn('[Mock] WebSocket mocking enabled — send() returns a stub echo response only');
}

/**
 * Restore the original WebSocket constructor.
 */
export function teardownWsMock(): void {
  if (!originalWebSocket) return;

  window.WebSocket = originalWebSocket;
  originalWebSocket = null;

  console.log('[Mock] WebSocket mocking disabled');
}

/**
 * Remove all mock handlers and restore the original axios adapter.
 */
export function teardownMock(): void {
  if (!mock) return;

  mock.restore();
  mock = null;

  console.log('[Mock] HTTP API mocking disabled');
}

/**
 * Check whether mock mode is currently active.
 */
export function isMockEnabled(): boolean {
  return mock !== null;
}
