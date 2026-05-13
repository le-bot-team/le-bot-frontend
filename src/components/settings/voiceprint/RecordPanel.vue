<script setup lang="ts">
// RecordPanel — lanhu designs 4e6ad306 (录制准备) / 1ed5ff10 (朗读短语)
import { onBeforeUnmount, ref } from 'vue';

import AudioRecorder from 'components/AudioRecorder.vue';
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

const onAudioRecordData = (blobData: Blob): void => {
  if (!audioData.value) {
    audioData.value = blobData;
  } else {
    audioData.value = new Blob([audioData.value, blobData], { type: 'audio/wav' });
  }
};

const onAudioRecordStop = (): void => {
  if (audioSrc.value) {
    URL.revokeObjectURL(audioSrc.value);
  }
  audioSrc.value = audioData.value ? URL.createObjectURL(audioData.value) : undefined;
};

onBeforeUnmount(() => {
  if (audioSrc.value) {
    URL.revokeObjectURL(audioSrc.value);
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

    <!-- Stage 2: read aloud + record (design 1ed5ff10) -->
    <template v-else>
      <div class="voiceprint-record-page-title">
        {{ i18n('labels.readAloudPhrases') }}
      </div>

      <div class="voiceprint-record-pet-stage">
        <q-icon name="pets" size="80px" color="primary" />
      </div>

      <p class="voiceprint-record-phrase">
        {{ i18n('labels.readAloudPhrasesDescription') }}
      </p>

      <div class="voiceprint-record-waveform" aria-hidden="true">
        <span v-for="n in 21" :key="n" class="voiceprint-record-wave-bar" />
      </div>

      <div class="voiceprint-record-mic" aria-hidden="true" />

      <audio v-if="audioSrc" class="full-width q-mb-md" controls :src="audioSrc" />

      <AudioRecorder
        @data="onAudioRecordData"
        @start="audioData = undefined"
        @stop="onAudioRecordStop"
      />

      <button
        class="auth-btn-primary voiceprint-record-cta"
        type="button"
        :disabled="!audioSrc"
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
