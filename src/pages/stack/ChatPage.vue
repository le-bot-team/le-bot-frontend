<script setup lang="ts">
// ChatPage — design a2096a64 (聊天页, 375×812 artboard).
//
// Strict sync with the LanHu spec:
//   * StackHeader renders the page title via STACK_NAVIGATIONS; mute / call
//     actions are triggered through the global event bus (chat:mute, chat:call).
//   * Canvas is a fixed 375×812 column; the hero decoration (组 385, opacity
//     0.3) sits behind the scrollable bubble list.
//   * Bottom single "按住说话" bar drives the session — pointerdown wakes,
//     pointerup relies on the existing silence detector to end the turn
//     (useChatSession does not expose a direct stop-recording API yet).

import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import ChatInputBar from 'src/components/chat/ChatInputBar.vue';
import ChatMessageList from 'src/components/chat/ChatMessageList.vue';
import { bus } from 'src/boot/bus';
import { useChatSession } from 'src/composables/useChatSession';
import { useTracker } from 'src/composables/useTracker';
import { router } from 'src/router';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';
import { useChatStore } from 'stores/chat';

const i18n = i18nSubPath('pages.stack.ChatPage');
const route = useRoute();
const { accessToken } = storeToRefs(useAuthStore());
const chatStore = useChatStore();
const { isMuted } = storeToRefs(chatStore);
const { notify } = useQuasar();
const { trackClick, trackConversion } = useTracker();

const { messages, isConnected, isMediaReady, connect, wake, destroy } = useChatSession();

const pressing = ref(false);

// --- Session bootstrap ---

async function bootstrap() {
  if (!accessToken.value?.length) {
    notify({ type: 'warning', message: i18n('notifications.notLoggedIn') });
    router.push('/stack/auth?from=/stack/chat').catch(console.error);
    return;
  }
  try {
    const sessionId = route.query.session as string | undefined;
    await connect(accessToken.value, undefined, sessionId);
  } catch (err) {
    console.error('[ChatPage] connect failed', err);
    notify({ type: 'negative', message: i18n('notifications.connectFailed') });
  }
}

// --- Press-to-talk ---

function onPress() {
  if (!isConnected.value || !isMediaReady.value) {
    notify({ type: 'warning', message: i18n('notifications.notReady') });
    return;
  }
  trackConversion('first_voice_input');
  pressing.value = true;
  wake().catch((err) => {
    console.error('[ChatPage] wake failed', err);
    pressing.value = false;
    notify({ type: 'negative', message: i18n('notifications.wakeFailed') });
  });
}

function onRelease() {
  trackClick('btn_click_release_talk');
  pressing.value = false;
}

// --- Header actions (driven by route meta + bus) ---

let muteNotify: ReturnType<typeof notify> | null = null;

function onMute() {
  isMuted.value = !isMuted.value;
  bus.emit('chat:mute-state', isMuted.value);
  if (muteNotify) {
    muteNotify();
    muteNotify = null;
  }
  muteNotify = notify({
    type: 'info',
    group: false,
    message: isMuted.value
      ? i18n('notifications.muteEnabled')
      : i18n('notifications.muteDisabled'),
  });
}

function onCall() {
  router.push('/stack/chat/voice-call').catch(console.error);
}

// --- Lifecycle ---

onMounted(() => {
  bus.on('chat:mute', onMute);
  bus.on('chat:call', onCall);
  bootstrap().catch(console.error);
});

onBeforeUnmount(() => {
  bus.off('chat:mute', onMute);
  bus.off('chat:call', onCall);
  destroy();
});
</script>

<template>
  <q-page class="chat-page">
    <!-- Hero decoration: 组 385, opacity 0.3. Behind the list, does not
         capture pointer events. -->
    <div class="chat-page__hero" aria-hidden="true">
      <div class="chat-page__hero-bg" />
      <div class="chat-page__hero-mascot" />
    </div>

    <!-- Scrollable bubble list -->
    <ChatMessageList :messages="messages" :empty-hint="i18n('labels.emptyHint')" />

    <!-- Bottom press-to-talk bar -->
    <ChatInputBar
      :disabled="!isMediaReady || !isConnected"
      :pressing="pressing"
      :label="i18n('labels.pressToTalk')"
      @press="onPress"
      @release="onRelease"
    />
  </q-page>
</template>
