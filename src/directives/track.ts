/**
 * v-track — 声明式点击埋点 Vue 指令
 *
 * 用法：
 * ```html
 * <q-btn v-track="{ event: 'btn_click_start_chat' }">开始聊天</q-btn>
 * <q-btn v-track="{ event: 'btn_switch_device', data: { deviceType: 'virtual' } }">切换设备</q-btn>
 * ```
 *
 * 支持指令参数形式：
 * ```html
 * <q-btn v-track:click="{ event: 'btn_click_start_chat' }">开始聊天</q-btn>
 * <div v-track:longpress="{ event: 'card_longpress', data: { type: 'device' } }">设备卡片</div>
 * ```
 */

import type { Directive, DirectiveBinding } from 'vue';

import type { VTrackBinding } from 'src/types/api/telemetry';

import { getTelemetryEngine } from 'src/utils/telemetry/engine';
import { useTelemetryStore } from 'stores/telemetry';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Long-press detection threshold (ms) */
const LONGPRESS_THRESHOLD = 500;

/** Event type to DOM event name mapping (excluding longpress which needs special handling) */
const SIMPLE_EVENT_MAP: Record<string, string> = {
  click: 'click',
  tap: 'click',
};

// ---------------------------------------------------------------------------
// Directive implementation
// ---------------------------------------------------------------------------

/** Resolve binding value (supports shorthand string form) */
function resolveBinding(binding: DirectiveBinding<VTrackBinding | string>): VTrackBinding | null {
  if (!binding.value) {
    if (process.env.DEV) {
      console.warn('[v-track] Directive used without a value, skipping.');
    }
    return null;
  }
  if (typeof binding.value === 'string') {
    return { event: binding.value };
  }
  return binding.value;
}

/** Determine the directive arg (defaults to 'click') */
function resolveArg(binding: DirectiveBinding<VTrackBinding | string>): string {
  return binding.arg || 'click';
}

/** Fire the tracking event */
function fireTrackEvent(target: HTMLElement, trackBinding: VTrackBinding): void {
  const engine = getTelemetryEngine();

  // Refresh session activity on user interaction
  try {
    const telemetryStore = useTelemetryStore();
    telemetryStore.refreshActivity();
  } catch {
    // Store may not be available yet
  }

  const doTrack = () => {
    void engine.trackClick(trackBinding.event, {
      elementId: target.id || undefined,
      elementClass: target.className?.toString().slice(0, 100) || undefined,
      elementTag: target.tagName?.toLowerCase() || undefined,
      ...trackBinding.data,
    });
  };

  // Support debounce: defer to next microtask to avoid duplicate events from bubbling
  if (trackBinding.debounce) {
    queueMicrotask(doTrack);
  } else {
    doTrack();
  }
}

// ---------------------------------------------------------------------------
// Long-press gesture handler
// ---------------------------------------------------------------------------

interface LongpressState {
  timer: ReturnType<typeof setTimeout> | null;
  fired: boolean;
  startX: number;
  startY: number;
}

function setupLongpress(
  el: HTMLElement,
  trackBinding: VTrackBinding,
): { cleanup: () => void } {
  const state: LongpressState = { timer: null, fired: false, startX: 0, startY: 0 };
  const MOVE_TOLERANCE = 10; // px

  const onPointerDown = (e: PointerEvent) => {
    state.fired = false;
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.timer = setTimeout(() => {
      state.fired = true;
      fireTrackEvent(el, trackBinding);
    }, LONGPRESS_THRESHOLD);
  };

  const cancel = () => {
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = null;
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    if (state.timer) {
      const dx = Math.abs(e.clientX - state.startX);
      const dy = Math.abs(e.clientY - state.startY);
      if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) {
        cancel();
      }
    }
  };

  const onPointerUp = () => cancel();
  const onPointerCancel = () => cancel();

  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup', onPointerUp);
  el.addEventListener('pointercancel', onPointerCancel);

  return {
    cleanup: () => {
      cancel();
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerCancel);
    },
  };
}

// ---------------------------------------------------------------------------
// Bind/unbind helpers
// ---------------------------------------------------------------------------

interface TrackMeta {
  cleanup: () => void;
  arg: string;
}

function bindDirective(el: HTMLElement, binding: DirectiveBinding<VTrackBinding | string>): void {
  const resolved = resolveBinding(binding);
  if (!resolved) return; // No-op if binding value is missing

  const arg = resolveArg(binding);

  let cleanup: () => void;

  if (arg === 'longpress') {
    // Long-press gesture
    const lp = setupLongpress(el, resolved);
    cleanup = lp.cleanup;
  } else {
    // Simple event (click, tap, or custom DOM event)
    const domEvent = SIMPLE_EVENT_MAP[arg] || arg;
    const handler = (event: Event) => {
      fireTrackEvent(event.currentTarget as HTMLElement, resolved);
    };
    el.addEventListener(domEvent, handler);
    cleanup = () => el.removeEventListener(domEvent, handler);
  }

  // Store metadata for update/unmount
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (el as any).__vTrackMeta = { cleanup, arg } satisfies TrackMeta;
}

function unbindDirective(el: HTMLElement): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = (el as any).__vTrackMeta as TrackMeta | undefined;
  if (meta) {
    meta.cleanup();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (el as any).__vTrackMeta;
}

// ---------------------------------------------------------------------------
// Exported directive
// ---------------------------------------------------------------------------

/**
 * v-track 指令
 *
 * 支持：
 * - `v-track="{ event: 'xxx' }"` — 点击事件
 * - `v-track:click="{ event: 'xxx' }"` — 显式指定 click
 * - `v-track:longpress="{ event: 'xxx' }"` — 长按事件 (500ms threshold)
 * - `v-track="'xxx'"` — 简写形式
 */
export const vTrackDirective: Directive<HTMLElement> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<VTrackBinding | string>) {
    bindDirective(el, binding);
  },

  updated(el: HTMLElement, binding: DirectiveBinding<VTrackBinding | string>) {
    // Fully rebind: remove old listener(s), attach new ones
    // This handles both value changes and arg changes (e.g. click → tap)
    unbindDirective(el);
    bindDirective(el, binding);
  },

  unmounted(el: HTMLElement) {
    unbindDirective(el);
  },
};
