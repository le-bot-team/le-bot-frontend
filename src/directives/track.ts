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

// ---------------------------------------------------------------------------
// 指令实现
// ---------------------------------------------------------------------------

/** 事件类型到 DOM 事件名的映射 */
const EVENT_TYPE_MAP: Record<string, string> = {
  click: 'click',
  longpress: 'pointerdown',
  tap: 'click',
};

/** 获取指令绑定值（支持简写） */
function resolveBinding(binding: DirectiveBinding<VTrackBinding | string>): VTrackBinding {
  if (typeof binding.value === 'string') {
    return { event: binding.value };
  }
  return binding.value;
}

/** 处理 DOM 事件并上报 */
function handleTrackEvent(event: Event, binding: VTrackBinding): void {
  const engine = getTelemetryEngine();
  const target = event.currentTarget as HTMLElement;

  void engine.trackClick(binding.event, {
    elementId: target.id || undefined,
    elementClass: target.className?.toString().slice(0, 100) || undefined,
    elementTag: target.tagName?.toLowerCase() || undefined,
    ...binding.data,
  });
}

/**
 * v-track 指令
 *
 * 支持：
 * - `v-track="{ event: 'xxx' }"` — 点击事件
 * - `v-track:click="{ event: 'xxx' }"` — 显式指定 click
 * - `v-track="'xxx'"` — 简写形式
 */
export const vTrackDirective: Directive<HTMLElement> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<VTrackBinding | string>) {
    const resolved = resolveBinding(binding);

    // 确定监听的 DOM 事件类型
    const arg = binding.arg || 'click';
    const domEvent = EVENT_TYPE_MAP[arg] || arg;

    // 创建处理函数并绑定
    const handler = (event: Event) => handleTrackEvent(event, resolved);

    // 将 handler 存储在元素上，以便 unmounted 时移除
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (el as any).__vTrackHandler = handler;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (el as any).__vTrackDomEvent = domEvent;

    el.addEventListener(domEvent, handler);
  },

  updated(el: HTMLElement, binding: DirectiveBinding<VTrackBinding | string>) {
    // 值变化时重新绑定
    const resolved = resolveBinding(binding);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const oldHandler = (el as any).__vTrackHandler;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const domEvent = (el as any).__vTrackDomEvent;

    if (oldHandler && domEvent) {
      el.removeEventListener(domEvent, oldHandler);
    }

    const newHandler = (event: Event) => handleTrackEvent(event, resolved);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (el as any).__vTrackHandler = newHandler;
    el.addEventListener(domEvent, newHandler);
  },

  unmounted(el: HTMLElement) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (el as any).__vTrackHandler;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const domEvent = (el as any).__vTrackDomEvent;

    if (handler && domEvent) {
      el.removeEventListener(domEvent, handler);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (el as any).__vTrackHandler;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (el as any).__vTrackDomEvent;
  },
};
