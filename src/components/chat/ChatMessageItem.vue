<script setup lang="ts">
// ChatMessageItem — bubble rendered inside ChatMessageList.
// Design a2096a64: AI bubble (white bg, dark text, left-aligned) / user
// bubble (rgba(39,145,234,1), white text, right-aligned). Padding, radius
// and shadow come from the `.chat-bubble*` classes in src/css/app.scss.

import { computed } from 'vue';

import type { ChatMessage } from 'src/types/chat/types';

const props = defineProps<{
  message: ChatMessage;
}>();

const isUser = computed(() => props.message.role === 'user');
const hasText = computed(() => props.message.text.length > 0);
const isTyping = computed(
  () => !props.message.isFinished && props.message.isStreaming && !hasText.value,
);
</script>

<template>
  <div class="chat-bubble" :class="isUser ? 'chat-bubble--user' : 'chat-bubble--ai'">
    <template v-if="isTyping">
      <span class="chat-bubble__typing" aria-label="typing">
        <span class="chat-bubble__typing-dot" />
        <span class="chat-bubble__typing-dot" />
        <span class="chat-bubble__typing-dot" />
      </span>
    </template>
    <template v-else>{{ message.text }}</template>
  </div>
</template>
