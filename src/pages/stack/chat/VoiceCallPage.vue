<script setup lang="ts">
// VoiceCallPage — full-screen continuous voice chat mode.
// Reuses the same WebSocket/audio session pipeline as ChatPage and adapts it
// to the LanHu voice-call controls: enter page → connect + start listening,
// mic button → pause/resume microphone, close button → teardown call.

import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { bus } from 'src/boot/bus';
import { useChatSession } from 'src/composables/useChatSession';
import { ChatState } from 'src/types/chat/types';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';
import { useChatStore } from 'stores/chat';
import { useDeviceStore } from 'stores/device';

import imgRobot from 'src/assets/lanhu/chat/img-1.png';
import imgBtnUnmute from 'src/assets/lanhu/chat/btn-unmute-chat.png';
import imgBtnMute from 'src/assets/lanhu/chat/btn-mute-mode-chat.png';
import imgBtnClose from 'src/assets/lanhu/chat/btn-close-chat.png';

const i18n = i18nSubPath('pages.stack.chat.VoiceCallPage');
const chatI18n = i18nSubPath('pages.stack.ChatPage');
const route = useRoute();
const router = useRouter();
const { notify } = useQuasar();

const { accessToken } = storeToRefs(useAuthStore());
const { currentDeviceId } = storeToRefs(useDeviceStore());
const chatStore = useChatStore();
const { isMuted } = storeToRefs(chatStore);

const {
  state,
  messages,
  isConnected,
  isMediaReady,
  isAudioPlaying,
  connect,
  wake,
  endTurn,
  destroy,
} = useChatSession();

type CallStatus = 'connecting' | 'connected' | 'ended' | 'failed';

const callStatus = ref<CallStatus>('connecting');
const showTextMode = ref(true);
const currentDotIndex = ref(0);
const messageListRef = ref<HTMLDivElement | null>(null);

let dotTimer: ReturnType<typeof setInterval> | undefined;
let destroyed = false;
let hasRequestedWake = false;
let muteNotify: ReturnType<typeof notify> | null = null;

const visibleMessages = computed(() =>
  messages.value.filter((message) => message.text.trim().length > 0),
);

const statusHint = computed(() => {
  if (callStatus.value === 'failed') return i18n('notifications.callFailed');
  if (callStatus.value === 'connecting' || !isConnected.value || !isMediaReady.value) {
    return i18n('labels.connecting');
  }
  if (isMuted.value) return i18n('labels.mute');
  if (isAudioPlaying.value) return i18n('labels.inCall');
  if (state.value === ChatState.WaitingResponse) return i18n('labels.startSpeaking');
  return i18n('labels.startSpeaking');
});

function startDotAnimation() {
  if (dotTimer !== undefined) return;
  dotTimer = setInterval(() => {
    currentDotIndex.value = (currentDotIndex.value + 1) % 3;
  }, 800);
}

function stopDotAnimation() {
  if (dotTimer === undefined) return;
  clearInterval(dotTimer);
  dotTimer = undefined;
}

async function maybeStartVoiceCapture() {
  if (
    hasRequestedWake ||
    callStatus.value === 'ended' ||
    callStatus.value === 'failed' ||
    !isConnected.value ||
    !isMediaReady.value ||
    isMuted.value
  ) {
    return;
  }

  hasRequestedWake = true;
  try {
    await wake();
  } catch (err) {
    hasRequestedWake = false;
    console.error('[VoiceCallPage] wake failed', err);
    notify({ type: 'negative', message: chatI18n('notifications.wakeFailed') });
  }
}

async function bootstrap() {
  callStatus.value = 'connecting';
  startDotAnimation();

  if (!accessToken.value?.length) {
    notify({ type: 'warning', message: chatI18n('notifications.notLoggedIn') });
    router.replace('/stack/auth?from=/stack/chat/voice-call').catch(console.error);
    return;
  }

  try {
    const q = route.query.session;
    const sessionId = typeof q === 'string' ? q : undefined;
    await connect(accessToken.value, currentDeviceId.value ?? undefined, sessionId);
    await maybeStartVoiceCapture();
  } catch (err) {
    console.error('[VoiceCallPage] connect failed', err);
    callStatus.value = 'failed';
    stopDotAnimation();
    cleanupSession();
    notify({ type: 'negative', message: chatI18n('notifications.connectFailed') });
  }
}

function cleanupSession() {
  if (destroyed) return;
  destroyed = true;
  destroy();
}

function endCall() {
  if (callStatus.value === 'ended') return;
  callStatus.value = 'ended';
  stopDotAnimation();
  cleanupSession();
  notify({ type: 'info', message: i18n('notifications.callEnded') });
  router.back();
}

function toggleMute() {
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
      ? chatI18n('notifications.muteModeEnabled')
      : chatI18n('notifications.muteModeDisabled'),
  });

  if (isMuted.value) {
    hasRequestedWake = false;
    endTurn();
    return;
  }

  maybeStartVoiceCapture().catch(console.error);
}

function toggleTextMode() {
  showTextMode.value = !showTextMode.value;
  bus.emit('chat:text-mode-state', showTextMode.value);
}

async function scrollMessagesToBottom() {
  await nextTick();
  const element = messageListRef.value;
  if (!element) return;
  element.scrollTop = element.scrollHeight;
}

watch(
  [isConnected, isMediaReady],
  () => {
    if (callStatus.value === 'ended' || callStatus.value === 'failed') return;

    if (isConnected.value && isMediaReady.value) {
      callStatus.value = 'connected';
      maybeStartVoiceCapture().catch(console.error);
    } else {
      callStatus.value = 'connecting';
      hasRequestedWake = false;
    }
  },
);

watch(
  state,
  () => {
    if (state.value !== ChatState.Idle) return;
    hasRequestedWake = false;
    maybeStartVoiceCapture().catch(console.error);
  },
);

watch(
  () => {
    const count = visibleMessages.value.length;
    const last = count > 0 ? visibleMessages.value[count - 1] : undefined;
    return last ? `${count}:${last.id}:${last.text}:${last.isFinished}` : '0';
  },
  () => {
    scrollMessagesToBottom().catch(console.error);
  },
);

onMounted(() => {
  bus.on('chat:text-toggle', toggleTextMode);
  bus.emit('chat:text-mode-state', showTextMode.value);
  bootstrap().catch(console.error);
});

onBeforeUnmount(() => {
  stopDotAnimation();
  bus.off('chat:text-toggle', toggleTextMode);
  bus.emit('chat:text-mode-state', true);
  cleanupSession();
});
</script>

<template>
  <q-page class="voice-call-page">
    <!-- Robot Avatar Area (组385) — design raw JSON: w=374 h=367 opacity-60, top=98 -->
    <!-- Contains: 圆形4 (yellow circle bg) + 乐宝正面 (robot 230x334) -->
    <div class="voice-call__robot-area">
      <img class="voice-call__robot-img" :src="imgRobot" alt="乐宝" />
    </div>

    <!-- Chat Messages Area — sourced from the real WebSocket chat session. -->
    <div
      v-if="showTextMode && visibleMessages.length > 0"
      ref="messageListRef"
      class="voice-chat__messages"
    >
      <div
        v-for="message in visibleMessages"
        :key="message.id"
        class="voice-chat__message"
        :class="`voice-chat__message--${message.role}`"
      >
        <p
          class="voice-chat__message-text"
          :class="{
            'voice-chat__message-text--gradient': message.role === 'assistant',
          }"
        >
          {{ message.text }}
        </p>
      </div>
    </div>

    <!-- Bottom Control Area -->
    <div class="voice-call__bottom">
      <!-- Control Buttons — 3 items: mic (left) + dots (center) + hangup (right) -->
      <div class="voice-call__controls">
        <!-- Unmute button — btn_unmute_chat (shown when not muted) -->
        <button
          v-if="!isMuted"
          type="button"
          class="voice-call__btn voice-call__btn--unmute"
          :aria-label="i18n('labels.mute')"
          @click="toggleMute"
        >
          <img :src="imgBtnUnmute" alt="取消静音" class="voice-call__btn-icon" />
        </button>

        <!-- Mute button — btn_mute_mode_chat (shown when muted) -->
        <button
          v-else
          type="button"
          class="voice-call__btn voice-call__btn--mute"
          :aria-label="i18n('labels.speaker')"
          @click="toggleMute"
        >
          <img :src="imgBtnMute" alt="静音模式" class="voice-call__btn-icon" />
        </button>

        <!-- Dot indicators (center position between mic and hangup) -->
        <div class="voice-call__dots" aria-hidden="true">
          <span
            v-for="i in 3"
            :key="i"
            class="voice-call__dot"
            :class="{ 'is-active': i - 1 === currentDotIndex && callStatus !== 'failed' }"
          ></span>
        </div>

        <!-- Close/Hangup button — btn_close_chat: red circle with X -->
        <button
          type="button"
          class="voice-call__btn voice-call__btn--close"
          :aria-label="i18n('labels.endCall')"
          @click="endCall"
        >
          <img :src="imgBtnClose" alt="挂断" class="voice-call__btn-icon" />
        </button>
      </div>

      <!-- Status text — raw JSON: "你可以开始说话" 15px/22px #151717 center at y=718 -->
      <p class="voice-call__hint">{{ statusHint }}</p>

      <!-- AI disclaimer — raw JSON: "内容由AI生成" 12px/16px #151717 opacity-50 at y=748 -->
      <p class="voice-call__disclaimer">{{ i18n('labels.aiGenerated') }}</p>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
// ===== VoiceCallPage — design 64d5ecc8 (standby) & 98751f24 (chat) =====
// All pixel values from raw JSON unless noted.

.voice-call-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
  background: #f5f5f0;
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
}

.voice-call__coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 40px 20px;
}

/* === Robot Avatar Area (组385) === */
// Design a2096a64 raw JSON: w=375 h=367 opacity-60
// Position: starts below nav bar
.voice-call__robot-area {
  flex-shrink: 0;
  width: 375px; // design w=375
  height: 367px; // design h=367
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  opacity: 0.6; // design: 组385 opacity-60
  margin-top: 20px; // push robot + text down slightly
}

.voice-call__robot-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* === Chat Messages Area (OVERLAP on robot lower portion) === */
// Design a2096a64 raw JSON — texts positioned inside/bottom of robot area:
//   text1 top=142, text2 top=262, text3 top=406... (within robot h=367 visual space)
// Use negative margin-top to pull messages UP into robot bottom area
.voice-chat__messages {
  flex-shrink: 0;
  width: 100%;
  padding: 0 20px 16px 36px; // design left=36 for AI text start
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: -100px; // pull up into robot bottom area (robot h=367, ~1/4 overlaps)
  position: relative;
  z-index: 2; // above robot image
  max-height: 280px;
  overflow-y: auto;

  // Top fade effect — oldest messages at top gradually fade out (scrolling chat effect)
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 60px,
    black 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 60px,
    black 100%
  );
}

.voice-chat__message {
  max-width: 303px; // raw JSON message width=303
}

// AI messages with gradient fade — TOP of message LIST fades out (old messages scroll away)
// Applied per-message for the fade effect on oldest visible content
.voice-chat__message-text--gradient {
  // No per-message mask needed — gradient is on container
}

.voice-chat__message-text {
  font-family: var(--font-family); // AlibabaPuHuiTi
  font-size: 15px; // raw JSON size=15
  font-weight: 400; // raw JSON Regular
  line-height: 22px; // raw JSON lineHeight=22
  color: rgba(74, 74, 74, 1); // raw JSON #4A4A4A
  margin: 0;
  word-break: break-word;
}

/* === Bottom Control Area === */
.voice-call__bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-bottom: 20px;
  width: 100%;
}

/* --- Control Buttons --- */
// raw JSON: 3 containers each w=64 h=64
.voice-call__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px; // spacing between buttons (visual estimation from layout)
}

.voice-call__btn {
  width: 64px; // raw JSON container w=64
  height: 64px; // raw JSON container h=64
  border: none;
  border-radius: 50%; // circular from raw JSON 圆形 path
  background: none;
  padding: 0;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;

  &:active {
    transform: scale(0.92);
  }
}

.voice-call__btn-icon {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

/* --- Hint Text --- */
// raw JSON "你可以开始说话": size=15 lineHeight=22 color=#151717 center-aligned
.voice-call__hint {
  font-family: var(--font-family); // AlibabaPuHuiTi
  font-size: 15px;
  font-weight: 400; // Regular
  line-height: 22px;
  color: rgba(21, 23, 23, 1); // #151717
  text-align: center;
  margin: 0;
  padding-top: 4px;
}

/* --- AI Disclaimer --- */
// raw JSON "内容由AI生成": size=12 lineHeight=16 color=#151717 opacity-50
.voice-call__disclaimer {
  font-family: var(--font-family); // AlibabaPuHuiTi
  font-size: 12px;
  font-weight: 400; // Regular
  line-height: 16px;
  color: rgba(21, 23, 23, 1); // #151717
  opacity: 0.5; // raw JSON opacity-50
  text-align: center;
  margin: 0;
}

/* --- Dot Indicators (inside controls, between mic and hangup) --- */
// raw JSON 圆形258/259/260: w=8 h=8 each
.voice-call__dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.voice-call__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--clr-divider);
  transition: all 0.3s ease;

  &.is-active {
    background: var(--clr-link);
  }
}
</style>
