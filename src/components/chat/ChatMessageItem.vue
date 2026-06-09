<script setup lang="ts">
// ChatMessageItem — bubble rendered inside ChatMessageList.
// Design a2096a64: AI bubble (white bg, dark #151717 text, left-aligned) / user
// bubble (blue #2791EA bg, white text, right-aligned). Padding, radius
// and shadow come from the `.chat-bubble*` classes in src/css/app.scss.

import { computed, ref } from 'vue';

import type { ChatMessage } from 'src/types/chat/types';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('components.chat.ChatMessageItem');

const props = defineProps<{
  message: ChatMessage;
}>();

const isUser = computed(() => props.message.role === 'user');
const hasText = computed(() => props.message.text.length > 0);
const isTyping = computed(
  () => !isUser.value && !props.message.isFinished && props.message.isStreaming && !hasText.value,
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
    el.currentTime = 0;
    el.play()
      .then(() => {
        isPlaying.value = true;
      })
      .catch((err) => {
        console.error('[ChatMessageItem] audio play failed:', err);
        isPlaying.value = false;
      });
  }
}

function onAudioEnded() {
  isPlaying.value = false;
}

function onAudioError() {
  isPlaying.value = false;
}
</script>

<template>
  <div class="chat-bubble" :class="isUser ? 'chat-bubble--user' : 'chat-bubble--ai'">
    <template v-if="isTyping">
      <span class="chat-bubble__typing" :aria-label="i18n('labels.typing')">
        <span class="chat-bubble__typing-dot" />
        <span class="chat-bubble__typing-dot" />
        <span class="chat-bubble__typing-dot" />
      </span>
    </template>
    <template v-else>
      {{ message.text }}
      <button
        v-if="hasAudio && message.isFinished"
        type="button"
        class="chat-bubble__audio-btn"
        :class="{ 'chat-bubble__audio-btn--playing': isPlaying }"
        :aria-label="isPlaying ? i18n('labels.stopAudio') : i18n('labels.playAudio')"
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
        @error="onAudioError"
      />
    </template>
  </div>
</template>
