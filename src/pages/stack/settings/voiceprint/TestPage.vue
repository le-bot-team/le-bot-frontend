<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { onBeforeMount, onBeforeUnmount, ref } from 'vue';

import AudioRecorder from 'components/AudioRecorder.vue';

import { router } from 'src/router';
import { blobToDataUrl, i18nSubPath } from 'src/utils/common';
import { recognize } from 'src/utils/api/voiceprint';
import { useAuthStore } from 'stores/auth';
import type { RecognitionData } from 'src/types/api/voiceprint';

const { accessToken } = storeToRefs(useAuthStore());
const { notify } = useQuasar();

const i18n = i18nSubPath('pages.stack.settings.voiceprint.TestPage');

const audioData = ref<Blob>();
const audioSrc = ref<string>();
const isLoading = ref<boolean>(false);
const recognizeResult = ref<RecognitionData>();

const onAudioRecordData = (blobData: Blob): void => {
  if (!audioData.value) {
    audioData.value = blobData;
  } else {
    audioData.value = new Blob([audioData.value, blobData], { type: 'audio/wav' });
  }
};

const onAudioRecordStop = async () => {
  isLoading.value = true;
  if (audioSrc.value) {
    URL.revokeObjectURL(audioSrc.value);
  }
  if (!audioData.value) {
    audioSrc.value = undefined;
    isLoading.value = false;
    return;
  }
  audioSrc.value = URL.createObjectURL(audioData.value);

  if (!accessToken.value) {
    console.error('No access token available for voiceprint recognition.');
    isLoading.value = false;
    return;
  }
  try {
    const dataUrl = await blobToDataUrl(audioData.value);
    const { data: result } = await recognize(
      accessToken.value,
      dataUrl.substring(dataUrl.indexOf(',') + 1),
    );
    if (!result.success) {
      notify({
        type: 'warning',
        message: i18n('notifications.recognitionFailed'),
        caption: result.message,
      });
    } else {
      notify({
        type: 'positive',
        message: i18n('notifications.recognitionSuccess', {
          personName: result.data.name,
          confidence: result.data.confidence.toFixed(2),
        }),
      });
      recognizeResult.value = result.data;
      console.log('Recognition result:', recognizeResult.value);
    }
  } catch (error) {
    console.error('Error during voiceprint recognition:', error);
    notify({
      type: 'negative',
      message: i18n('notifications.registrationError'),
      caption: (error as Error).message,
    });
  } finally {
    isLoading.value = false;
  }
};

onBeforeMount(async () => {
  if (!accessToken.value) {
    await router.push('/stack/auth?from=/stack/settings/voiceprint/test');
    return;
  }
});

onBeforeUnmount(() => {
  if (audioSrc.value) {
    URL.revokeObjectURL(audioSrc.value);
  }
});
</script>

<template>
  <q-page class="column q-gutter-y-lg q-pa-md">
    <q-card>
      <q-card-section class="text-body1">
        {{ i18n('labels.hint') }}
      </q-card-section>
      <q-card-section>
        <audio class="full-width" controls :src="audioSrc" />
      </q-card-section>
    </q-card>
    <AudioRecorder
      @data="onAudioRecordData"
      @start="audioData = undefined"
      @stop="onAudioRecordStop"
    />
    <q-btn
      color="primary"
      :disable="!audioSrc"
      :label="i18n('labels.finish')"
      no-caps
      @click="router.go(-1)"
    />
  </q-page>
</template>

<style scoped></style>
