<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import type { QScrollArea } from 'quasar';

import ChatMessageItem from 'src/components/chat/ChatMessageItem.vue';
import type { ChatMessage } from 'src/types/chat/types';

const props = defineProps<{
  messages: ChatMessage[];
}>();

const scrollAreaRef = ref<InstanceType<typeof QScrollArea>>();

// Auto-scroll to bottom when new messages arrive or existing messages update
watch(
  () => props.messages.length,
  async () => {
    await nextTick();
    scrollToBottom();
  },
);

// Also watch for text updates on the last message (streaming text)
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

function scrollToBottom() {
  const scrollArea = scrollAreaRef.value;
  if (scrollArea) {
    const scrollTarget = scrollArea.getScrollTarget();
    scrollTarget.scrollTop = scrollTarget.scrollHeight;
  }
}
</script>

<template>
  <q-scroll-area ref="scrollAreaRef" class="col-grow full-width">
    <!-- Empty state -->
    <div
      v-if="messages.length === 0"
      class="fit column items-center justify-center text-grey-5 q-pa-xl"
    >
      <q-icon name="chat_bubble_outline" size="64px" class="q-mb-md" />
      <div class="text-subtitle1">Ready to chat</div>
      <div class="text-caption">
        Press the wake button or say "Hi LeBot" to start
      </div>
    </div>

    <!-- Message list -->
    <div v-else class="q-pa-md">
      <ChatMessageItem
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
      />
    </div>
  </q-scroll-area>
</template>
