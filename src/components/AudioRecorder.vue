<script setup lang="ts">
import type { IMediaRecorder } from 'extendable-media-recorder';
import { MediaRecorder } from 'extendable-media-recorder';
import { ref } from 'vue';

interface AudioChunkEvent extends Event {
  data: Blob;
}

const emit = defineEmits<{
  stop: [blobData: Blob]
}>()

const isRecording = ref(false);
const audioBase64 = ref<string>('');
const audioUrl = ref<string>('');

const mediaRecorder = ref<IMediaRecorder>();
const mediaStream = ref<MediaStream>();
let audioChunks: Blob[] = [];

const startRecording = async (): Promise<void> => {
  try {
    mediaStream.value = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.value = new MediaRecorder(mediaStream.value, { mimeType: 'audio/wav' });

    mediaRecorder.value.ondataavailable = (event: AudioChunkEvent) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.value.onstop = () => {
      if (!mediaStream.value) {
        return;
      }

      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      emit('stop', audioBlob);


      audioChunks = [];

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          audioBase64.value = reader.result;
          audioUrl.value = URL.createObjectURL(audioBlob);
        }
      };
      reader.readAsDataURL(audioBlob);

      mediaStream.value.getTracks().forEach((track) => track.stop());
      mediaStream.value = undefined;

      console.log(audioBase64);
    };

    mediaRecorder.value.start();
    isRecording.value = true;
  } catch (error) {
    alert(`麦克风访问失败: ${(error as Error).message}`);
  }
};

const stopRecording = (): void => {
  if (mediaRecorder.value?.state === 'recording') {
    mediaRecorder.value.stop();
    isRecording.value = false;
  }
};

const onAudioError = (e: Event) => {
  console.error('音频播放错误:', e);
};
</script>

<template>
  <div>
    <q-btn v-if="isRecording" color="negative" label="Stop Recording" @click="stopRecording" />
    <q-btn v-else color="primary" label="Start Recording" @click="startRecording" />
    <div v-if="audioBase64">Base64长度：{{ audioBase64.length }}</div>
    <audio v-if="audioUrl" :src="audioUrl" controls @error="onAudioError"></audio>
  </div>
</template>
