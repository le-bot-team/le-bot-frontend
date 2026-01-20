<script setup lang="ts">
import { i18nSubPath } from 'src/utils/common';
import AudioRecorder from 'components/AudioRecorder.vue';
import { onBeforeUnmount, ref } from 'vue';

defineProps<{
  name: string | number;
}>();
const emit = defineEmits<{
  next: [data: Blob];
}>();

const i18n = i18nSubPath('components.settings.voiceprint.RecordPanel');

const preparationHints: { icon: string; label: string; caption: string }[] = [
  {
    icon: 'volume_off',
    label: i18n('labels.quietEnvironment'),
    caption: i18n('labels.quietEnvironmentDescription'),
  },
  {
    icon: 'sentiment_neutral',
    label: i18n('labels.naturalVoice'),
    caption: i18n('labels.naturalVoiceDescription'),
  },
  {
    icon: 'straighten',
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
  <q-tab-panel class="column q-gutter-y-md" :name="name">
    <q-card>
      <q-card-section>
        <div class="text-h6 text-center">
          {{ i18n('labels.preparation') }}
        </div>
      </q-card-section>
      <q-list>
        <q-item v-for="(hint, index) in preparationHints" :key="index">
          <q-item-section avatar>
            <q-icon :name="hint.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ hint.label }}</q-item-label>
            <q-item-label caption>{{ hint.caption }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
    <q-card class="q-mt-xl">
      <q-card-section>
        <div class="text-h6 text-center">
          {{ i18n('labels.readAloudPhrases') }}
        </div>
      </q-card-section>
      <q-card-section>
        <div class="text-body1 text-center">
          {{ i18n('labels.readAloudPhrasesDescription') }}
        </div>
      </q-card-section>
    </q-card>
    <audio class="full-width" controls :src="audioSrc" />
    <AudioRecorder @data="onAudioRecordData" @start="audioData = undefined" @stop="onAudioRecordStop" />
    <q-btn
      class="q-mt-xl"
      color="primary"
      :disable="!audioSrc"
      :label="i18n('labels.finish')"
      no-caps
      @click="audioData ? emit('next', audioData) : undefined"
    />
  </q-tab-panel>
</template>

<style scoped></style>
