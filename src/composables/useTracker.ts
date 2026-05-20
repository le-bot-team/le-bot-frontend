/**
 * Lightweight analytics/conversion tracking composable.
 * Currently a no-op stub — wire up a real analytics provider (e.g. Umami, Plausible)
 * when the backend tracking endpoint is ready.
 */
export function useTracker() {
  /**
   * Track a named conversion event.
   * @param event - Semantic event name (e.g. 'profile_setup', 'auth_login_success')
   * @param meta  - Optional key-value metadata attached to the event
   */
  function trackConversion(event: string, meta?: Record<string, unknown>) {
    if (import.meta.env.DEV) {
      console.debug('[Tracker] conversion:', event, meta ?? '');
    }
    // TODO: send to analytics backend
  }

  /**
   * Track a UI click/interaction event.
   * @param element - Identifier for the clicked element (e.g. 'chat_send_btn')
   * @param meta   - Optional key-value metadata attached to the event
   */
  function trackClick(element: string, meta?: Record<string, unknown>) {
    if (import.meta.env.DEV) {
      console.debug('[Tracker] click:', element, meta ?? '');
    }
    // TODO: send to analytics backend
  }

  return { trackConversion, trackClick };
}
