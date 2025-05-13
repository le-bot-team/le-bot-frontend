<script setup lang="ts">
import type { IMediaRecorder } from 'extendable-media-recorder';
import { MediaRecorder } from 'extendable-media-recorder';
import { useQuasar } from 'quasar';
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { i18nSubPath } from 'src/utils/common';

const emit = defineEmits<{
  stop: [blobData: Blob];
}>();
withDefaults(
  defineProps<{
    disable: boolean;
  }>(),
  {
    disable: false,
  },
);
const { notify } = useQuasar();

const i18n = i18nSubPath('components.AudioRecorder');

const audioChunks = ref<Blob[]>([]);
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
      audioChunks.value.push(event.data);
    };
    mediaRecorder.value.onstop = () => {
      if (!mediaStream.value) {
        return;
      }
      // mediaStream.value.getTracks().forEach((track) => track.stop());

      emit('stop', new Blob(audioChunks.value, { type: 'audio/wav' }));
      audioChunks.value = [];
    };
    mediaRecorder.value.start();
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
  mediaStream.value = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        color="primary"
        :disable="disable"
        :icon="isRecording ? 'mic' : 'mic_off'"
        outline
        round
        size="xl"
        @mousedown="startRecording"
        @mouseup="stopRecording"
        @touchstart="startRecording"
        @touchend="stopRecording"
        @contextmenu.prevent
      />
    </div>
  </div>
</template>
