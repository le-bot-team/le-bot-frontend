<script setup lang="ts">
// ChatInputBar — press-to-talk button at the bottom of the chat canvas.
// Design a2096a64: 335×48 white rounded pill, centered mic icon + "按住说话"
// label. All visual tokens come from `.chat-input-bar*` in src/css/app.scss.
//
// Gesture contract:
//   * pointerdown         -> emit('press')
//   * pointerup / leave / cancel -> emit('release') (exactly once per press)
// The parent (ChatPage) wires `press` to `wake()` and relies on the
// useChatSession silence detector to finalize the turn.

import { ref } from 'vue';

const props = defineProps<{
  disabled?: boolean;
  pressing?: boolean;
  label: string;
}>();

const emit = defineEmits<{
  press: [];
  release: [];
}>();

const isDown = ref(false);

function handleDown(event: PointerEvent) {
  if (props.disabled) return;
  isDown.value = true;
  (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  emit('press');
}

function handleUp(event: PointerEvent) {
  if (!isDown.value) return;
  isDown.value = false;
  const el = event.currentTarget as HTMLElement;
  if (el.hasPointerCapture?.(event.pointerId)) {
    el.releasePointerCapture(event.pointerId);
  }
  emit('release');
}
</script>

<template>
  <button
    type="button"
    class="chat-input-bar"
    :class="{ 'chat-input-bar--pressing': pressing }"
    :disabled="disabled"
    :aria-label="label"
    @pointerdown="handleDown"
    @pointerup="handleUp"
    @pointercancel="handleUp"
    @pointerleave="handleUp"
    @contextmenu.prevent
  >
    <span class="chat-input-bar__icon" aria-hidden="true">
      <!-- mic icon built as an inline SVG so we stay independent from Quasar
           icon fonts and match the 24×24 spec exactly. -->
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" />
        <path
          d="M5 11a1 1 0 0 1 2 0 5 5 0 0 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.92V21a1 1 0 1 1-2 0v-3.08A7 7 0 0 1 5 11Z"
          fill="currentColor"
        />
      </svg>
    </span>
    <span>{{ label }}</span>
  </button>
</template>
