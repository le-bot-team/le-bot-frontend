<script setup lang="ts">
import type { IMediaRecorder } from 'extendable-media-recorder';
import { MediaRecorder } from 'extendable-media-recorder';
import { useQuasar } from 'quasar';
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { i18nSubPath } from 'src/utils/common';

const emit = defineEmits<{
  data: [blobData: Blob];
  stop: [];
}>();
withDefaults(
  defineProps<{
    disable: boolean;
  }>(),
  {
    disable: false,
  },
);
const { notify, platform } = useQuasar();

const i18n = i18nSubPath('components.AudioRecorder');

const isRecording = ref(false);
const mediaRecorder = ref<IMediaRecorder>();
const mediaStream = ref<MediaStream>();

const startRecording = () => {
  if (isRecording.value || !mediaStream.value) {
    return;
  }

  try {
    mediaRecorder.value = new MediaRecorder(mediaStream.value, { mimeType: 'audio/wav' });
    mediaRecorder.value.ondataavailable = (event) => {
      emit('data', event.data);
    };
    mediaRecorder.value.onstop = () => {
      if (!mediaStream.value) {
        return;
      }
      // mediaStream.value.getTracks().forEach((track) => track.stop());

      emit('stop');
    };
    mediaRecorder.value.start(200); // 200ms per chunk
    isRecording.value = true;
  } catch (error) {
    notify({
      type: 'negative',
      message: i18n('labels.error'),
      caption: (error as Error).message,
    });
  }
};

const stopRecording = (): void => {
  if (mediaRecorder.value?.state === 'recording') {
    mediaRecorder.value.stop();
    isRecording.value = false;
  }
};

onMounted(async () => {
  mediaStream.value = await navigator.mediaDevices.getUserMedia({
    audio: {
      sampleRate: 16000,
      sampleSize: 16,
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  });
});

onBeforeUnmount(() => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach((track) => track.stop());
  }
});
</script>

<template>
  <div class="column items-center q-gutter-y-sm">
    <div v-if="isRecording" class="row">
      <q-spinner-bars color="red" />
      <div class="text-red">
        {{ i18n('labels.recording') }}
      </div>
    </div>
    <div v-else class="text-italic">
      {{ i18n('labels.hint') }}
    </div>
    <div>
      <q-btn
        v-if="platform.is.mobile"
        color="primary"
        :disable="disable"
        :icon="isRecording ? 'mic_off' : 'mic'"
        outline
        round
        size="xl"
        @touchstart="startRecording"
        @touchend="stopRecording"
        @contextmenu.prevent
      />
      <q-btn
        v-else
        color="primary"
        :disable="disable"
        :icon="isRecording ? 'mic_off' : 'mic'"
        outline
        round
        size="xl"
        @mousedown="startRecording"
        @mouseup="stopRecording"
        @contextmenu.prevent
      />
    </div>
  </div>
</template>
