<script setup lang="ts">
import { computed } from 'vue';

import { ChatState } from 'src/types/chat/types';

const props = defineProps<{
  /** Current chat state machine state */
  state: ChatState;
  /** Whether WebSocket is connected */
  isConnected: boolean;
  /** Whether the mic is ready */
  isMediaReady: boolean;
  /** Whether the browser supports wake word */
  isWakeWordSupported: boolean;
  /** Whether wake word listener is active */
  isWakeWordListening: boolean;
  /** Whether audio is being recorded */
  isRecording: boolean;
  /** Whether assistant audio is playing */
  isAudioPlaying: boolean;
}>();

const emit = defineEmits<{
  wake: [];
  interrupt: [];
  connect: [];
  disconnect: [];
}>();

/** Main action button config based on current state */
const mainButton = computed(() => {
  if (!props.isConnected) {
    return {
      icon: 'link',
      color: 'primary',
      label: 'Connect',
      action: () => emit('connect'),
      disabled: false,
      pulse: false,
    };
  }

  switch (props.state) {
    case ChatState.Idle:
      return {
        icon: 'mic',
        color: 'primary',
        label: props.isWakeWordListening ? 'Listening for wake word...' : 'Tap to wake',
        action: () => emit('wake'),
        disabled: !props.isMediaReady,
        pulse: props.isWakeWordListening,
      };
    case ChatState.WaitingResponse:
      return {
        icon: 'stop',
        color: 'deep-orange',
        label: props.isAudioPlaying ? 'Playing response...' : 'Waiting for response...',
        action: () => emit('interrupt'),
        disabled: false,
        pulse: true,
      };
    case ChatState.Active:
      return {
        icon: 'graphic_eq',
        color: 'red',
        label: 'Conversation active',
        action: () => emit('interrupt'),
        disabled: false,
        pulse: true,
      };
    default:
      return {
        icon: 'mic',
        color: 'grey',
        label: 'Not ready',
        action: () => {},
        disabled: true,
        pulse: false,
      };
  }
});

/** Status bar text */
const statusText = computed(() => {
  if (!props.isConnected) return 'Disconnected';
  if (!props.isMediaReady) return 'Initializing microphone...';

  switch (props.state) {
    case ChatState.Idle:
      if (props.isWakeWordSupported && props.isWakeWordListening) {
        return 'Say "Hi LeBot" or tap the button';
      }
      return 'Tap the button to start';
    case ChatState.WaitingResponse:
      if (props.isAudioPlaying) return 'LeBot is speaking...';
      if (props.isRecording) return 'Recording... waiting for response';
      return 'Processing...';
    case ChatState.Active:
      return 'Conversation active — speak freely';
    default:
      return '';
  }
});
</script>

<template>
  <div class="chat-controls column items-center q-pa-md q-gutter-y-sm">
    <!-- Status text -->
    <div class="text-caption text-grey-6 text-center">
      {{ statusText }}
    </div>

    <!-- Main action button -->
    <div class="row items-center q-gutter-x-md">
      <q-btn
        :icon="mainButton.icon"
        :color="mainButton.color"
        :disable="mainButton.disabled"
        round
        size="xl"
        :class="{ 'pulse-animation': mainButton.pulse }"
        @click="mainButton.action"
      />
    </div>

    <!-- Secondary controls -->
    <div class="row items-center q-gutter-x-sm">
      <q-btn
        v-if="isConnected"
        icon="link_off"
        color="negative"
        flat
        dense
        size="sm"
        label="Disconnect"
        @click="$emit('disconnect')"
      />

      <!-- Recording indicator -->
      <q-badge
        v-if="isRecording"
        color="red"
        rounded
        class="q-px-sm"
      >
        <q-icon name="fiber_manual_record" size="10px" class="q-mr-xs recording-dot" />
        REC
      </q-badge>

      <!-- Wake word indicator -->
      <q-badge
        v-if="isWakeWordSupported && isWakeWordListening && state === 'idle'"
        color="blue-grey"
        rounded
        class="q-px-sm"
      >
        <q-icon name="hearing" size="12px" class="q-mr-xs" />
        Wake word active
      </q-badge>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-controls {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(0, 0, 0, 0.02);
}

.body--dark .chat-controls {
  border-top-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
}

.pulse-animation {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--q-primary-rgb, 25, 118, 210), 0.4);
  }
  70% {
    box-shadow: 0 0 0 16px rgba(var(--q-primary-rgb, 25, 118, 210), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--q-primary-rgb, 25, 118, 210), 0);
  }
}

.recording-dot {
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
