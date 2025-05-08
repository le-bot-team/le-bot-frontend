<template>
  <div>
    <button @click="startRecording" :disabled="isRecording">开始录音</button>
    <button @click="stopRecording" :disabled="!isRecording">停止录音</button>
    <div v-if="audioBase64">Base64长度：{{ audioBase64.length }}</div>
    <audio v-if="audioUrl" :src="audioUrl" controls></audio>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface AudioChunkEvent extends Event {
  data: Blob;
}

const isRecording = ref(false);
const audioBase64 = ref<string>('');
const audioUrl = ref<string>('');

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let mediaStream: MediaStream | null = null;

// 获取麦克风权限并初始化录音
const startRecording = async (): Promise<void> => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.ondataavailable = (event: AudioChunkEvent) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      if (!mediaStream) return;

      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      audioChunks = [];

      // 转换为 Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          audioBase64.value = reader.result;
          audioUrl.value = URL.createObjectURL(audioBlob);
        }
      };
      reader.readAsDataURL(audioBlob);

      // 释放媒体流
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;

      console.log(audioBase64);
    };

    mediaRecorder.start();
    isRecording.value = true;
  } catch (error) {
    alert(`麦克风访问失败: ${(error as Error).message}`);
  }
};

// 停止录音
const stopRecording = (): void => {
  if (mediaRecorder?.state === 'recording') {
    mediaRecorder.stop();
    isRecording.value = false;
  }
};
</script>
