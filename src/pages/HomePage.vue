<script setup lang="ts">
import { i18nSubPath } from 'src/utils/common';
import AudioRecorder from 'components/AudioRecorder.vue';

const i18n = i18nSubPath('pages.HomePage');

const processData = async (blobData: Blob) => {
  const formData = new FormData();
  formData.append('audio', blobData, 'audio.wav');

  const response = await fetch('/api/audio/recognize', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to process audio');
  }

  const data = await response.json();
  console.log(data);
};
</script>


<template>
  <q-page class="row justify-center q-pa-md-xl q-pa-lg">
    <div class="col-grow column items-center justify-center q-gutter-y-xl">
      <div class="text-h1 text-weight-regular">
        {{ i18n('labels.title') }}
      </div>
      <div>
        <AudioRecorder @stop="processData"/>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.rotate-button {
  transform: rotate(1turn);
  transition: 1s;
}

.rotate-button:active {
  transform: rotate(0);
  transition: 0s;
}
</style>
