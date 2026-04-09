<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { copyToClipboard, useQuasar } from 'quasar';
import { onBeforeUnmount, onMounted } from 'vue';

import ChatControls from 'src/components/chat/ChatControls.vue';
import ChatMessageList from 'src/components/chat/ChatMessageList.vue';
import { useChatSession } from 'src/composables/useChatSession';
import { router } from 'src/router';
import { ChatState } from 'src/types/chat/types';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';
import { useChatStore } from 'stores/chat';

const i18n = i18nSubPath('pages.stack.ChatPage');

const { accessToken } = storeToRefs(useAuthStore());
const chatStore = useChatStore();
const { notify } = useQuasar();

const {
  state,
  messages,
  isConnected,
  isMediaReady,
  isWakeWordSupported,
  isWakeWordListening,
  isRecording,
  isAudioPlaying,
  connect,
  disconnect,
  wake,
  interrupt,
  clearContext,
  destroy,
} = useChatSession();

// --- Actions ---

async function handleConnect() {
  if (!accessToken.value) {
    notify({ type: 'warning', message: i18n('notifications.notLoggedIn') });
    return;
  }
  try {
    await connect(accessToken.value);
  } catch (err) {
    console.error('Failed to connect:', err);
    notify({ type: 'negative', message: 'Failed to connect to chat server' });
  }
}

function handleDisconnect() {
  disconnect();
}

function handleWake() {
  wake().catch((err) => {
    console.error('Wake failed:', err);
    notify({ type: 'negative', message: 'Failed to start conversation' });
  });
}

function handleInterrupt() {
  interrupt();
}

function handleClearContext() {
  clearContext();
  notify({ type: 'positive', message: 'Context cleared' });
}

function copyAccessToken() {
  if (accessToken.value) {
    copyToClipboard(accessToken.value)
      .then(() => notify({ type: 'positive', message: i18n('notifications.copiedAccessToken') }))
      .catch(() => notify({ type: 'negative', message: i18n('notifications.copyAccessTokenFailed') }));
  }
}

// --- Lifecycle ---

onMounted(() => {
  if (!accessToken.value?.length) {
    notify({ type: 'warning', message: i18n('notifications.notLoggedIn') });
    router.push('/stack/auth?from=/stack/chat').catch(console.error);
  }
});

onBeforeUnmount(() => {
  destroy();
});
</script>

<template>
  <q-page class="column" style="height: 100%">
    <!-- Header bar: connection info + conversation ID -->
    <div class="chat-header row items-center q-px-md q-py-sm q-gutter-x-sm">
      <!-- Connection status dot -->
      <q-icon
        :name="isConnected ? 'circle' : 'radio_button_unchecked'"
        :color="isConnected ? 'positive' : 'grey-5'"
        size="10px"
      />
      <span class="text-caption" :class="isConnected ? 'text-positive' : 'text-grey-5'">
        {{ isConnected ? 'Connected' : 'Disconnected' }}
      </span>

      <q-space />

      <!-- Conversation ID (if available) -->
      <q-chip
        v-if="chatStore.conversationId"
        dense
        outline
        size="sm"
        icon="chat"
        :label="chatStore.conversationId.slice(0, 8) + '...'"
        clickable
        @click="copyAccessToken"
      >
        <q-tooltip>{{ chatStore.conversationId }}</q-tooltip>
      </q-chip>

      <!-- State badge -->
      <q-badge
        :color="state === ChatState.Active ? 'red' : state === ChatState.WaitingResponse ? 'orange' : 'grey'"
        :label="state"
        rounded
        class="text-capitalize"
      />

      <!-- Clear context button -->
      <q-btn
        v-if="isConnected"
        icon="delete_sweep"
        flat
        dense
        round
        size="sm"
        color="negative"
        @click="handleClearContext"
      >
        <q-tooltip>Clear conversation context</q-tooltip>
      </q-btn>
    </div>

    <!-- Message area (flex grow) -->
    <ChatMessageList :messages="messages" class="col-grow" />

    <!-- Controls area (bottom) -->
    <ChatControls
      :state="state"
      :is-connected="isConnected"
      :is-media-ready="isMediaReady"
      :is-wake-word-supported="isWakeWordSupported"
      :is-wake-word-listening="isWakeWordListening"
      :is-recording="isRecording"
      :is-audio-playing="isAudioPlaying"
      @connect="handleConnect"
      @disconnect="handleDisconnect"
      @wake="handleWake"
      @interrupt="handleInterrupt"
    />
  </q-page>
</template>

<style lang="scss" scoped>
.chat-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  min-height: 40px;
  flex-shrink: 0;
}

.body--dark .chat-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}
</style>
