<script setup lang="ts">
// RecordPanel — lanhu designs 4e6ad306 (录制准备) / 1ed5ff10 (朗读短语) / 10d09505 (声纹录制4)
import type { IMediaRecorder } from 'extendable-media-recorder';
import { MediaRecorder } from 'extendable-media-recorder';
import { onBeforeUnmount, ref, watch } from 'vue';

import iconRead from 'src/assets/lanhu/voiceprint/icon-read.webp';
import robotImg from 'src/assets/lanhu/home/icon-robot-set-home.png';
import { i18nSubPath } from 'src/utils/common';

defineProps<{
  name: string | number;
}>();
const emit = defineEmits<{
  next: [data: Blob];
}>();

const i18n = i18nSubPath('components.settings.voiceprint.RecordPanel');

// Two-step flow inside the panel mirroring design 4e6ad306 (tips) → 1ed5ff10 (reading).
const stage = ref<'prepare' | 'recording'>('prepare');

type HintVariant = 'quiet' | 'natural' | 'distance';

const preparationHints: { variant: HintVariant; label: string; caption: string }[] = [
  {
    variant: 'quiet',
    label: i18n('labels.quietEnvironment'),
    caption: i18n('labels.quietEnvironmentDescription'),
  },
  {
    variant: 'natural',
    label: i18n('labels.naturalVoice'),
    caption: i18n('labels.naturalVoiceDescription'),
  },
  {
    variant: 'distance',
    label: i18n('labels.moderateDistance'),
    caption: i18n('labels.moderateDistanceDescription'),
  },
];

const audioData = ref<Blob>();
const audioSrc = ref<string>();
const isRecording = ref(false);
const isPlaying = ref(false);
const playbackProgress = ref(0);
let audioEl: HTMLAudioElement | null = null;

watch(audioData, (val) => {
  if (val) {
    if (audioSrc.value) URL.revokeObjectURL(audioSrc.value);
    audioSrc.value = URL.createObjectURL(val);
  } else {
    if (audioSrc.value) URL.revokeObjectURL(audioSrc.value);
    audioSrc.value = undefined;
    isPlaying.value = false;
    playbackProgress.value = 0;
  }
});

const onAudioLoaded = (e: Event): void => {
  audioEl = e.target as HTMLAudioElement;
};

const togglePlayback = (): void => {
  if (!audioEl) return;
  if (isPlaying.value) {
    audioEl.pause();
    isPlaying.value = false;
  } else {
    void audioEl.play().catch(() => {
      isPlaying.value = false;
    });
    isPlaying.value = true;
  }
};

const onAudioEnded = (): void => {
  isPlaying.value = false;
  playbackProgress.value = 0;
};

const onAudioTimeUpdate = (): void => {
  if (audioEl && audioEl.duration) {
    playbackProgress.value = (audioEl.currentTime / audioEl.duration) * 100;
  }
};

const resetRecording = (): void => {
  audioData.value = undefined;
};

let mediaRecorder: IMediaRecorder | null = null;
let mediaStream: MediaStream | null = null;
let pendingStop = false;

const startRecording = async (): Promise<void> => {
  if (isRecording.value) return;
  audioData.value = undefined;
  pendingStop = false;
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        sampleSize: 16,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    // If user released before getUserMedia resolved, abort immediately
    if (pendingStop) {
      cleanup();
      return;
    }
    mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/wav' });
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioData.value = event.data;
      }
    };
    mediaRecorder.onstop = () => {
      cleanup();
    };
    mediaRecorder.start();
    isRecording.value = true;
    // Handle race: user released during setup
    if (pendingStop) {
      stopRecording();
    }
  } catch (err) {
    console.error('Failed to start recording:', err);
    cleanup();
  }
};

const stopRecording = (): void => {
  pendingStop = true;
  if (!isRecording.value) return;
  mediaRecorder?.stop();
  isRecording.value = false;
};

const cleanup = (): void => {
  mediaStream?.getTracks().forEach((track) => track.stop());
  mediaStream = null;
  mediaRecorder = null;
};

onBeforeUnmount(() => {
  if (isRecording.value) {
    stopRecording();
  }
  cleanup();
  if (audioEl) {
    audioEl.pause();
    audioEl = null;
  }
  if (audioSrc.value) {
    URL.revokeObjectURL(audioSrc.value);
    audioSrc.value = undefined;
  }
});
</script>

<template>
  <q-tab-panel :name="name" class="voiceprint-record-stage q-pa-none">
    <!-- Stage 1: preparation tips (design 4e6ad306) -->
    <template v-if="stage === 'prepare'">
      <div class="voiceprint-record-page-title">
        {{ i18n('labels.preparation') }}
      </div>

      <div v-for="(hint, index) in preparationHints" :key="index" class="voiceprint-record-section">
        <div
          class="voiceprint-record-section-icon"
          :class="`voiceprint-record-section-icon--${hint.variant}`"
          aria-hidden="true"
        />
        <div class="voiceprint-record-section-body">
          <p class="voiceprint-record-section-title">{{ hint.label }}</p>
          <p class="voiceprint-record-section-desc">{{ hint.caption }}</p>
        </div>
      </div>

      <button
        class="auth-btn-primary voiceprint-record-cta"
        type="button"
        @click="stage = 'recording'"
      >
        {{ i18n('labels.startRecording') }}
      </button>
    </template>

    <!-- Stage 2: read aloud + record (design 1ed5ff10 / 10d09505) -->
    <template v-else>
      <div class="voiceprint-record-page-title">
        {{ i18n('labels.readAloudPhrases') }}
      </div>

      <div class="voiceprint-record-pet-stage">
        <img :src="robotImg" alt="aipet" class="voiceprint-record-pet-img" />
      </div>

      <p class="voiceprint-record-phrase">
        {{ i18n('labels.readAloudPhrasesDescription') }}
      </p>

      <img :src="iconRead" alt="read" class="voiceprint-record-read-icon" />

      <div class="voiceprint-record-waveform" aria-hidden="true">
        <span v-for="n in 21" :key="n" class="voiceprint-record-wave-bar" />
      </div>

      <!-- Audio playback UI (shown after recording) -->
      <div v-if="audioSrc" class="voiceprint-record-playback">
        <audio
          :src="audioSrc"
          @loadedmetadata="onAudioLoaded"
          @ended="onAudioEnded"
          @timeupdate="onAudioTimeUpdate"
        />
        <button
          class="voiceprint-record-playback-btn"
          type="button"
          @click="togglePlayback"
        >
          <q-icon :name="isPlaying ? 'pause' : 'play_arrow'" size="24px" />
        </button>
        <div class="voiceprint-record-progress">
          <div
            class="voiceprint-record-progress-bar"
            :style="{ width: playbackProgress + '%' }"
          />
        </div>
        <button
          class="voiceprint-record-reset-btn"
          type="button"
          @click="resetRecording"
        >
          {{ i18n('labels.rerecord') }}
        </button>
      </div>

      <!-- Recording button (shown when no audio) -->
      <div v-else>
        <div
          class="voiceprint-record-pulse-ring"
          :class="{ 'voiceprint-record-pulse-ring--recording': isRecording }"
          role="button"
          tabindex="0"
          aria-label="record"
          @mousedown.prevent="startRecording"
          @mouseup="stopRecording"
          @mouseleave="stopRecording"
          @touchstart.prevent="startRecording"
          @touchend.prevent="stopRecording"
          @touchcancel="stopRecording"
          @keydown.enter.prevent="isRecording ? stopRecording() : startRecording()"
          @keydown.space.prevent="isRecording ? stopRecording() : startRecording()"
        >
          <div class="voiceprint-record-pulse-inner" />
        </div>
      </div>

      <button
        class="auth-btn-primary voiceprint-record-cta"
        type="button"
        :disabled="!audioData"
        @click="audioData ? emit('next', audioData) : undefined"
      >
        {{ i18n('labels.finish') }}
      </button>
    </template>
  </q-tab-panel>
</template>

<style scoped>
/* All structural styles live in src/css/app.scss under
   "===== Voiceprint Recording module patterns, designs =====". */
</style>
