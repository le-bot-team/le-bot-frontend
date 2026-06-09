<script setup lang="ts">
// ChatMessageList — scrollable list of bubbles. Design a2096a64 uses a plain
// overflow-y container (no q-scroll-area) so the bubble list blends visually
// with the hero decoration sitting behind it.

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import ChatMessageItem from 'src/components/chat/ChatMessageItem.vue';
import type { ChatMessage } from 'src/types/chat/types';

const props = defineProps<{
  messages: ChatMessage[];
  emptyHint?: string;
}>();

/** Filter out messages that have no visible content (no text, no audio, not streaming). */
const visibleMessages = computed(() =>
  props.messages.filter(
    (msg) => msg.text.length > 0 || !!msg.audioUrl || (msg.isStreaming && !msg.isFinished),
  ),
);

const scrollRef = ref<HTMLDivElement | null>(null);

function scrollToBottom() {
  const el = scrollRef.value;
  if (!el) return;
  el.scrollTop = el.scrollHeight;
}

// rAF-throttled scroll scheduler: coalesces multiple scroll requests per frame
let scrollRafId: number | null = null;
function scheduleScroll() {
  if (scrollRafId !== null) return;
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = null;
    scrollToBottom();
  });
}

// Initial scroll to bottom when component mounts (show latest messages)
onMounted(() => {
  void nextTick(() => scrollToBottom());
});

onBeforeUnmount(() => {
  if (scrollRafId !== null) {
    cancelAnimationFrame(scrollRafId);
    scrollRafId = null;
  }
});

// Scroll when a new message is added
watch(
  () => visibleMessages.value.length,
  () => {
    scheduleScroll();
  },
);

// Scroll when the last message text grows or finished state changes (rAF-throttled)
watch(
  () => {
    const last = props.messages[props.messages.length - 1];
    return last ? `${last.text.length}-${last.isFinished}` : '';
  },
  () => {
    scheduleScroll();
  },
);
</script>

<template>
  <div ref="scrollRef" class="chat-page__list">
    <div v-if="visibleMessages.length === 0" class="chat-page__empty">
      {{ emptyHint }}
    </div>
    <ChatMessageItem v-for="msg in visibleMessages" :key="msg.id" :message="msg" />
  </div>
</template>
