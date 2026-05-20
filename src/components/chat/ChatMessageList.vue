<script setup lang="ts">
// ChatMessageList — scrollable list of bubbles. Design a2096a64 uses a plain
// overflow-y container (no q-scroll-area) so the bubble list blends visually
// with the hero decoration sitting behind it.

import { nextTick, ref, watch } from 'vue';

import ChatMessageItem from 'src/components/chat/ChatMessageItem.vue';
import type { ChatMessage } from 'src/types/chat/types';

const props = defineProps<{
  messages: ChatMessage[];
  emptyHint?: string;
}>();

const scrollRef = ref<HTMLDivElement | null>(null);

function scrollToBottom() {
  const el = scrollRef.value;
  if (!el) return;
  el.scrollTop = el.scrollHeight;
}

watch(
  () => props.messages.length,
  async () => {
    await nextTick();
    scrollToBottom();
  },
);

watch(
  () => {
    const last = props.messages[props.messages.length - 1];
    return last ? `${last.text}-${last.isFinished}` : '';
  },
  async () => {
    await nextTick();
    scrollToBottom();
  },
);
</script>

<template>
  <div ref="scrollRef" class="chat-page__list">
    <div v-if="messages.length === 0" class="chat-page__empty">
      {{ emptyHint }}
    </div>
    <ChatMessageItem v-for="msg in messages" :key="msg.id" :message="msg" />
  </div>
</template>
