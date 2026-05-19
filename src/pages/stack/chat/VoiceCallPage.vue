<script setup lang="ts">
// VoiceCallPage — voice call page
// Design: 蓝湖 64d5ecc8 (idle/standby) + 98751f24 (with chat messages)
// Raw JSON verified:
//   Page: 375 width
//   Nav bar: StackHeader renders title "语音通话" via STACK_NAVIGATIONS
//   Robot avatar area (组385): w=374 h=367 opacity-60, inner robot image 230x334
//   Bottom control bar: 3 circular buttons w=64 h=64 each:
//     - btn_unmute_chat: microphone (unmuted state)
//     - btn_mute_mode_chat: muted mic + red indicator line (矩形2142 w=2 h=28)
//     - btn_close_chat: red circle with white X
//   Bottom text: "你可以开始说话" 15px/22px Regular #151717 center-aligned at y=718
//   Sub-text: "内容由AI生成" 12px/16px Regular #151717 opacity-50 at y=748
//   Dot indicators (圆形258-260): 8x8px each
//
// Design 98751f24 adds:
//   - Chat message bubbles above the bottom control area (矩形2140: 375x160)
//   - AI messages: 15px/22px Regular rgba(74,74,74,1) with gradient fade overlay
//   - User reply: same style solid color

import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { i18nSubPath } from 'src/utils/common';
import { bus } from 'src/boot/bus';

import imgRobot from 'src/assets/lanhu/chat/img-1.png';
import imgBtnUnmute from 'src/assets/lanhu/chat/btn-unmute-chat.png';
import imgBtnMute from 'src/assets/lanhu/chat/btn-mute-mode-chat.png';
import imgBtnClose from 'src/assets/lanhu/chat/btn-close-chat.png';

const i18n = i18nSubPath('pages.stack.chat.VoiceCallPage');
const router = useRouter();

type CallStatus = 'connecting' | 'connected' | 'ended' | 'failed' | 'coming-soon';

const isMockMode = process.env.VITE_MOCK_WS_ENABLED === 'true';
const isDevMode = process.env.NODE_ENV === 'development';
const callStatus = ref<CallStatus>(isDevMode ? 'connecting' : 'coming-soon');
const isMuted = ref(false);
const showTextMode = ref(true);
const currentDotIndex = ref(0);
let dotTimer: ReturnType<typeof setInterval> | null = null;
let connectTimer: ReturnType<typeof setTimeout> | null = null;

function startCall() {
  callStatus.value = 'connecting';

  // TODO: Wire to real voice call session via useChatSession or dedicated
  // voice call composable. Current implementation is mock-only for UI layout
  // verification during development.
  connectTimer = setTimeout(() => {
    callStatus.value = 'connected';
    startDotAnimation();
  }, 1500);
}

function startDotAnimation() {
  dotTimer = setInterval(() => {
    currentDotIndex.value = (currentDotIndex.value + 1) % 3;
  }, 800);
}

function endCall() {
  if (connectTimer) {
    clearTimeout(connectTimer);
    connectTimer = null;
  }
  if (dotTimer) {
    clearInterval(dotTimer);
    dotTimer = null;
  }
  callStatus.value = 'ended';
  router.back();
}

function toggleMute() {
  isMuted.value = !isMuted.value;
}

function toggleTextMode() {
  showTextMode.value = !showTextMode.value;
  bus.emit('chat:text-mode-state', showTextMode.value);
}

onMounted(() => {
  startCall();
  bus.on('chat:text-toggle', toggleTextMode);
});

onBeforeUnmount(() => {
  if (connectTimer) {
    clearTimeout(connectTimer);
  }
  if (dotTimer) {
    clearInterval(dotTimer);
  }
  bus.off('chat:text-toggle', toggleTextMode);
});
</script>

<template>
  <q-page class="voice-call-page">
    <!-- Coming soon state for production -->
    <div v-if="callStatus === 'coming-soon'" class="voice-call__coming-soon">
      <img class="voice-call__robot-img" :src="imgRobot" alt="乐宝" />
      <p class="voice-call__hint">{{ i18n('labels.comingSoon') }}</p>
    </div>

    <template v-else>
    <!-- Robot Avatar Area (组385) — design raw JSON: w=374 h=367 opacity-60, top=98 -->
    <!-- Contains: 圆形4 (yellow circle bg) + 乐宝正面 (robot 230x334) -->
    <div class="voice-call__robot-area">
      <img
        class="voice-call__robot-img"
        :src="imgRobot"
        alt="乐宝"
      />
    </div>

    <!-- Chat Messages Area — design a2096a64 raw JSON -->
    <!-- Text nodes OVERLAP on top of robot area (组385: h=367, top≈98, bottom≈465) -->
    <!-- Raw text positions (relative to page): left=36, tops at 142/262/406/550... -->
    <!-- Messages span from inside robot area down past robot base (to ~634) -->
    <!-- NOTE: Mock transcript for layout verification only; real implementation
         should source messages from the chat session state. -->
    <div v-if="callStatus === 'connected' && showTextMode && isMockMode" class="voice-chat__messages">
      <div class="voice-chat__message voice-chat__message--ai">
        <p class="voice-chat__message-text voice-chat__message-text--gradient">
          这个坏蛋太坏了！我们得想个办法把中中救出来，小新你有什么好主意吗？
        </p>
      </div>
      <div class="voice-chat__message voice-chat__message--user">
        <p class="voice-chat__message-text">不去，我们去找警察吧。</p>
      </div>
      <div class="voice-chat__message voice-chat__message--ai">
        <p class="voice-chat__message-text voice-chat__message-text--gradient">
          这个坏蛋太坏了！我们得想个办法把中中救出来，小新你有什么好主意吗？
        </p>
      </div>
      <div class="voice-chat__message voice-chat__message--user">
        <p class="voice-chat__message-text">不去，我们去找警察吧不去，我们去找警察吧。不去，我们去找警察吧。不去，我们去找警察吧。不去，我们去找警察吧。</p>
      </div>
      <div class="voice-chat__message voice-chat__message--ai">
        <p class="voice-chat__message-text voice-chat__message-text--gradient">
          不去，我们去找警察吧不去，我们去找警察吧。不去，我们去找警察吧。不去，我们去找警察吧。
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
          @click="toggleMute"
        >
          <img
            :src="imgBtnUnmute"
            alt="取消静音"
            class="voice-call__btn-icon"
          />
        </button>

        <!-- Mute button — btn_mute_mode_chat (shown when muted) -->
        <button
          v-else
          type="button"
          class="voice-call__btn voice-call__btn--mute"
          @click="toggleMute"
        >
          <img
            :src="imgBtnMute"
            alt="静音模式"
            class="voice-call__btn-icon"
          />
        </button>

        <!-- Dot indicators (center position between mic and hangup) -->
        <div class="voice-call__dots">
          <span
            v-for="i in 3"
            :key="i"
            class="voice-call__dot"
            :class="{ 'is-active': i - 1 === currentDotIndex }"
          ></span>
        </div>

        <!-- Close/Hangup button — btn_close_chat: red circle with X -->
        <button type="button" class="voice-call__btn voice-call__btn--close" @click="endCall">
          <img
            :src="imgBtnClose"
            alt="挂断"
            class="voice-call__btn-icon"
          />
        </button>
      </div>

      <!-- Status text — raw JSON: "你可以开始说话" 15px/22px #151717 center at y=718 -->
      <p class="voice-call__hint">{{ i18n('labels.startSpeaking') }}</p>

      <!-- AI disclaimer — raw JSON: "内容由AI生成" 12px/16px #151717 opacity-50 at y=748 -->
      <p class="voice-call__disclaimer">{{ i18n('labels.aiGenerated') }}</p>
    </div>
    </template>
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
