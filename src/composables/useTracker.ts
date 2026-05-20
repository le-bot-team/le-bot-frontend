/**
 * useTracker — lightweight analytics event tracker.
 *
 * Provides `trackClick` for UI interaction events and `trackConversion` for
 * one-time milestone events (deduplicated per session). Currently logs to
 * console in development; replace with a real analytics SDK when available.
 */

const firedConversions = new Set<string>();

export function useTracker() {
  function trackClick(eventName: string, payload?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Tracker] click:', eventName, payload);
    }
    // TODO: integrate with analytics SDK
  }

  function trackConversion(eventName: string, payload?: Record<string, unknown>) {
    if (firedConversions.has(eventName)) return;
    firedConversions.add(eventName);

    if (process.env.NODE_ENV === 'development') {
      console.debug('[Tracker] conversion:', eventName, payload);
    }
    // TODO: integrate with analytics SDK
  }

  return { trackClick, trackConversion };
}
