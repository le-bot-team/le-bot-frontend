/**
 * useTracker — lightweight analytics tracking composable.
 * Stub implementation that logs events in development and will integrate
 * with a real analytics backend when available.
 */

export function useTracker() {
  function trackClick(eventName: string, payload?: Record<string, unknown>) {
    if (import.meta.env.DEV) {
      console.debug('[tracker:click]', eventName, payload);
    }
  }

  function trackConversion(eventName: string, payload?: Record<string, unknown>) {
    if (import.meta.env.DEV) {
      console.debug('[tracker:conversion]', eventName, payload);
    }
  }

  return { trackClick, trackConversion };
}
