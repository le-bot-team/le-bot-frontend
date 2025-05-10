<script setup lang="ts">
import { ref } from 'vue';

import AudioRecorder from 'components/AudioRecorder.vue';
import { blobToDataUrl, i18nSubPath } from 'src/utils/common';
import { WsWrapper } from 'src/types/websocket';

const i18n = i18nSubPath('pages.HomePage');

const accessToken = ref<string>();
const audioBase64 = ref<string>('');
const audioSrc = ref<string>('');
const botId = ref<string>('');
const ws = ref<WsWrapper>();

const connect = () => {
  if (ws.value) {
    ws.value.destroy();
  }
  ws.value = new WsWrapper(
    `wss://ws.coze.cn/v1/chat?authorization=Bearer ${accessToken.value}&bot_id=${botId.value}`,
  );
};

const disconnect = () => {
  if (ws.value) {
    ws.value.destroy();
    ws.value = undefined;
  }
};

const processData = async (blobData: Blob) => {
  const dataUrl = await blobToDataUrl(blobData);
  audioBase64.value = dataUrl.substring(dataUrl.indexOf(',') + 1);
  URL.revokeObjectURL(audioSrc.value);
  audioSrc.value = URL.createObjectURL(blobData);
};
</script>

<template>
  <q-page class="row justify-center q-pa-md-xl q-pa-lg">
    <div class="col-grow column items-center justify-center q-gutter-y-xl">
      <div class="text-h2 text-weight-regular">
        {{ i18n('labels.title') }}
      </div>
      <q-input
        :autofocus="true"
        clearable
        :label="i18n('labels.accessToken')"
        outlined
        v-model="accessToken"
      />
      <q-input :autofocus="true" clearable :label="i18n('labels.botId')" outlined v-model="botId" />
      <q-btn
        v-if="ws"
        color="negative"
        icon="link_off"
        :label="i18n('labels.disconnect')"
        @click="disconnect"
      />
      <q-btn
        v-else
        color="primary"
        :disable="!accessToken || !botId"
        icon="link"
        :label="i18n('labels.connect')"
        @click="connect"
      />
      <q-card class="col-grow full-width" bordered flat></q-card>
      <div class="column">
        <div v-if="audioBase64">Base64长度：{{ audioBase64.length }}</div>
        <audio v-if="audioSrc" :src="audioSrc" controls></audio>
        <AudioRecorder @stop="processData" />
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
