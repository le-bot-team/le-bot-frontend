<script setup lang="ts">
// RecordPanel — lanhu designs 4e6ad306 (录制准备) / 1ed5ff10 (朗读短语) / 10d09505 (声纹录制4)
import type { IMediaRecorder } from 'extendable-media-recorder';
import { MediaRecorder } from 'extendable-media-recorder';
import { useQuasar } from 'quasar';
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue';

import iconRead from 'src/assets/lanhu/voiceprint/icon-read.webp';
import recordMicImg from 'src/assets/lanhu/voiceprint/record-mic.webp';
import { i18nSubPath } from 'src/utils/common';

defineProps<{
  name: string | number;
}>();
const emit = defineEmits<{
  next: [data: Blob];
}>();

const i18n = i18nSubPath('components.settings.voiceprint.RecordPanel');
const { notify } = useQuasar();

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
const audioRef = shallowRef<HTMLAudioElement | null>(null);

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
  audioRef.value = e.target as HTMLAudioElement;
};

const togglePlayback = (): void => {
  if (!audioRef.value) return;
  if (isPlaying.value) {
    audioRef.value.pause();
    isPlaying.value = false;
  } else {
    audioRef.value
      .play()
      .then(() => {
        isPlaying.value = true;
      })
      .catch(() => {
        isPlaying.value = false;
      });
  }
};

const onAudioEnded = (): void => {
  isPlaying.value = false;
  playbackProgress.value = 0;
};

const onAudioTimeUpdate = (): void => {
  if (audioRef.value && audioRef.value.duration) {
    playbackProgress.value = (audioRef.value.currentTime / audioRef.value.duration) * 100;
  }
};

const resetRecording = (): void => {
  if (audioRef.value) {
    audioRef.value.pause();
    audioRef.value.currentTime = 0;
  }
  isPlaying.value = false;
  playbackProgress.value = 0;
  audioData.value = undefined;
};

let mediaRecorder: IMediaRecorder | null = null;
let mediaStream: MediaStream | null = null;
let pendingStop = false;
let recordingStartTime = 0;
const MIN_RECORDING_MS = 1000; // Minimum 1 second recording

const startRecording = async (): Promise<void> => {
  if (isRecording.value) return;
  audioData.value = undefined;
  pendingStop = false;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
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
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    mediaStream = stream;
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/wav' });
    mediaRecorder = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioData.value = event.data;
      }
    };
    recorder.onstop = () => {
      // Only clean up if this recorder is still the active one
      if (mediaRecorder === recorder) {
        cleanup();
      } else {
        // Stale recorder — just stop its stream
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    recorder.start();
    isRecording.value = true;
    recordingStartTime = Date.now();
    // Handle race: user released during setup
    if (pendingStop) {
      stopRecording();
    }
  } catch (err) {
    console.error('Failed to start recording:', err);
    notify({
      type: 'negative',
      message: i18n('notifications.recordingFailed'),
    });
    cleanup();
  }
};

const stopRecording = (): void => {
  pendingStop = true;
  if (!isRecording.value) return;
  // Enforce minimum recording duration
  const elapsed = Date.now() - recordingStartTime;
  if (elapsed < MIN_RECORDING_MS) {
    setTimeout(() => {
      mediaRecorder?.stop();
      isRecording.value = false;
    }, MIN_RECORDING_MS - elapsed);
  } else {
    mediaRecorder?.stop();
    isRecording.value = false;
  }
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
  if (audioRef.value) {
    audioRef.value.pause();
    audioRef.value = null;
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
        <img :src="recordMicImg" alt="" aria-hidden="true" class="voiceprint-record-pet-img" />
      </div>

      <p class="voiceprint-record-phrase">
        {{ i18n('labels.readAloudPhrasesDescription') }}
      </p>

      <img :src="iconRead" alt="" aria-hidden="true" class="voiceprint-record-read-icon" />

      <div class="voiceprint-record-waveform" aria-hidden="true">
        <span v-for="n in 21" :key="n" class="voiceprint-record-wave-bar" />
      </div>

      <!-- Audio playback UI (shown after recording) -->
      <div v-if="audioSrc" class="voiceprint-record-playback">
        <audio
          :src="audioSrc"
          preload="auto"
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

      <!-- Recording button (shown when no audio)
           Pointer: press-and-hold (start on pointerdown, stop on pointerup)
           Keyboard: toggle (Enter/Space toggles start/stop) for accessibility -->
      <div v-else>
        <button
          class="voiceprint-record-pulse-ring"
          :class="{ 'voiceprint-record-pulse-ring--recording': isRecording }"
          type="button"
          :aria-label="isRecording ? i18n('labels.stopRecording') : i18n('labels.startRecording')"
          @pointerdown.prevent="($event.currentTarget as HTMLElement).setPointerCapture($event.pointerId); startRecording()"
          @pointerup="stopRecording"
          @pointercancel="stopRecording"
          @lostpointercapture="stopRecording"
          @keydown.enter.prevent="isRecording ? stopRecording() : startRecording()"
          @keydown.space.prevent="isRecording ? stopRecording() : startRecording()"
        >
          <div class="voiceprint-record-pulse-inner" />
        </button>
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
