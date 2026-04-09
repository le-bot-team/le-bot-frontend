<script setup lang="ts">
import { computed } from 'vue';

import type { ChatMessage } from 'src/types/chat/types';

const props = defineProps<{
  message: ChatMessage;
}>();

const isUser = computed(() => props.message.role === 'user');
const hasAudio = computed(() => !!props.message.audioUrl);
const hasText = computed(() => props.message.text.length > 0);
const timeLabel = computed(() => {
  const date = new Date(props.message.timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});
</script>

<template>
  <q-chat-message :sent="isUser" :stamp="timeLabel">
    <template #avatar>
      <q-avatar :color="isUser ? 'primary' : 'deep-orange'" size="36px" text-color="white">
        <q-icon :name="isUser ? 'person' : 'smart_toy'" size="20px" />
      </q-avatar>
    </template>

    <div class="chat-message-content">
      <!-- Streaming / processing indicator -->
      <div v-if="!message.isFinished && message.isStreaming" class="row items-center q-gutter-x-sm">
        <q-spinner-dots color="grey-6" size="20px" />
        <span v-if="!hasText" class="text-grey-6 text-caption">
          {{ isUser ? 'Listening...' : 'Thinking...' }}
        </span>
      </div>

      <!-- Text content -->
      <div v-if="hasText" class="chat-text">
        {{ message.text }}
      </div>

      <!-- Audio player (shown when audio URL is available) -->
      <div v-if="hasAudio" class="chat-audio q-mt-xs">
        <audio controls :src="message.audioUrl" preload="metadata" class="chat-audio-player" />
      </div>

      <!-- Finished indicator -->
      <div v-if="message.isFinished && !hasText && !hasAudio" class="text-grey-5 text-caption">
        (empty)
      </div>
    </div>
  </q-chat-message>
</template>

<style lang="scss" scoped>
.chat-message-content {
  max-width: 100%;
  min-width: 80px;
}

.chat-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}

.chat-audio-player {
  width: 100%;
  min-width: 200px;
  max-width: 300px;
  height: 36px;
}
</style>
