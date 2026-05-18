<script setup lang="ts">
// ChatMessageItem — bubble rendered inside ChatMessageList.
// Design a2096a64: AI bubble (transparent bg, white text, left-aligned) / user
// bubble (transparent bg, blue #2791EA text, right-aligned). Padding, radius
// and shadow come from the `.chat-bubble*` classes in src/css/app.scss.

import { computed, ref } from 'vue';

import type { ChatMessage } from 'src/types/chat/types';

const props = defineProps<{
  message: ChatMessage;
}>();

const isUser = computed(() => props.message.role === 'user');
const hasText = computed(() => props.message.text.length > 0);
const isTyping = computed(
  () => !props.message.isFinished && props.message.isStreaming && !hasText.value,
);
const hasAudio = computed(() => !!props.message.audioUrl);

const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);

function toggleAudio() {
  const el = audioRef.value;
  if (!el) return;
  if (isPlaying.value) {
    el.pause();
    el.currentTime = 0;
    isPlaying.value = false;
  } else {
    el.play().catch(console.error);
    isPlaying.value = true;
  }
}

function onAudioEnded() {
  isPlaying.value = false;
}
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
    <template v-else>
      {{ message.text }}
      <button
        v-if="hasAudio && message.isFinished"
        class="chat-bubble__audio-btn"
        :class="{ 'chat-bubble__audio-btn--playing': isPlaying }"
        :aria-label="isPlaying ? 'Stop audio' : 'Play audio'"
        @click.stop="toggleAudio"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path v-if="!isPlaying" d="M4 3l10 5-10 5V3z" />
          <path v-else d="M3 2h4v12H3V2zm6 0h4v12H9V2z" />
        </svg>
      </button>
      <audio
        v-if="hasAudio"
        ref="audioRef"
        :src="message.audioUrl"
        preload="none"
        @ended="onAudioEnded"
      />
    </template>
  </div>
</template>
