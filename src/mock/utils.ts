import type MockAdapter from 'axios-mock-adapter';

/**
 * Simulate network latency for mock responses.
 * Default delay is 300ms to feel realistic but not sluggish.
 */
export const mockDelay = (ms = 300): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate a mock success response matching the backend's uniform format.
 */
export const mockSuccess = <T>(data: T) => ({ success: true as const, data });

/**
 * Generate a mock error response matching the backend's uniform format.
 */
export const mockError = (message: string) => ({ success: false as const, message });

/**
 * Generate a random UUID-like string for mock entity IDs.
 */
export const mockId = (): string =>
  crypto.randomUUID?.() ?? `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;

/**
 * Helper type: a function that sets up mock routes on the given MockAdapter.
 */
export type MockSetupFn = (mock: MockAdapter) => void;
