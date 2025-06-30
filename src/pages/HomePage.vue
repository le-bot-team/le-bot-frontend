<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, onBeforeUnmount, ref } from 'vue';

import AudioRecorder from 'components/AudioRecorder.vue';
import { base64ToBlob, blobToDataUrl, i18nSubPath } from 'src/utils/common';
import { WsWrapper } from 'src/types/websocket';
import {
  WsAction,
  WsInputAudioCompleteRequest,
  WsInputAudioStreamRequest,
  WsUpdateConfigRequest,
} from 'src/types/websocket/types';
import { pcmToWav } from 'src/utils/audio';

interface AudioMessage {
  chatId?: string;
  isFinished: boolean;
  isSent: boolean;
  audioChunks: Blob[];
  audioSrc?: string;
  text?: string;
}

const { notify, screen } = useQuasar();

const isMobile = computed(() => screen.lt.md);

const i18n = i18nSubPath('pages.HomePage');

const conversationId = ref<string>('');
const isChatReady = ref<boolean>(false);
const messageList = ref<AudioMessage[]>([]);
const userId = ref<string>('');
const ws = ref<WsWrapper>();

const connect = () => {
  if (!userId.value) {
    console.warn(`userId is empty`);
    return;
  }

  if (ws.value) {
    disconnect();
  }
  ws.value = new WsWrapper('ws://localhost:3000/api/v1/chat/ws?token=test');
  // ws.value.setCloseHandler('chat.disable_recording', () => {
  //   isChatReady.value = false;
  // });
  ws.value.addOnOpenHandler(() => {
    ws.value?.sendAction(
      new WsUpdateConfigRequest({
        conversationId: conversationId.value,
        outputText: true,
      }),
    );
  });
  ws.value.setHandler(WsAction.updateConfig, (message) => {
    isChatReady.value = true;
    conversationId.value = message.data.conversationId;
  });
  ws.value.setHandler(WsAction.outputTextStream, (message) => {
    conversationId.value = message.data.conversationId;
    if (messageList.value.at(-1)?.isSent === true) {
      messageList.value.push({
        isFinished: false,
        isSent: false,
        audioChunks: [],
      });
    }
    const unfinishedMessage = messageList.value.at(-1);
    if (unfinishedMessage) {
      unfinishedMessage.chatId = message.data.chatId;
      unfinishedMessage.text = message.data.text;
    } else {
      console.warn('No unfinished message found to update');
    }
  });
  ws.value.setHandler(WsAction.outputTextComplete, (message) => {
    conversationId.value = message.data.conversationId;
    const unfinishedMessage = messageList.value.at(-1);
    if (unfinishedMessage?.isSent === false) {
      unfinishedMessage.chatId = message.data.chatId;
      unfinishedMessage.text = message.data.text;
    } else {
      console.warn('No unfinished message found to update');
    }
  });
  ws.value.setHandler(WsAction.outputAudioStream, (message) => {
    conversationId.value = message.data.conversationId;
    if (messageList.value.at(-1)?.isSent === true) {
      messageList.value.push({
        isFinished: false,
        isSent: true,
        audioChunks: [],
      });
    }
    const unfinishedMessage = messageList.value.at(-1);
    if (unfinishedMessage) {
      unfinishedMessage.chatId = message.data.chatId;
      unfinishedMessage.audioChunks.push(base64ToBlob(message.data.buffer));
    } else {
      console.warn('No unfinished message found to update');
    }
  });
  ws.value.setHandler(WsAction.outputAudioComplete, async (message) => {
    conversationId.value = message.data.conversationId;
    const unfinishedMessage = messageList.value.at(-1);
    if (unfinishedMessage?.isSent === false) {
      unfinishedMessage.chatId = message.data.chatId;
      unfinishedMessage.audioSrc = URL.createObjectURL(
        await pcmToWav(new Blob(unfinishedMessage.audioChunks)),
      );
    } else {
      console.warn('No unfinished message found to update');
    }
  });
  ws.value.setHandler(WsAction.chatComplete, (message) => {
    conversationId.value = message.data.conversationId;
    const unfinishedMessage = messageList.value.at(-1);
    if (unfinishedMessage?.isSent === false) {
      unfinishedMessage.isFinished = true;
      if (!message.success) {
        notify({
          type: 'negative',
          message: message.data.errors.map((error) => error.message).join(', '),
          caption: message.data.errors.map((error) => error.code).join(', '),
        });
      }
    } else {
      console.warn('No unfinished message found to update');
    }
  });
};

const disconnect = () => {
  if (ws.value) {
    ws.value.destroy();
    ws.value = undefined;
  }
  isChatReady.value = false;
};

const processData = async (blobData: Blob) => {
  const dataUrl = await blobToDataUrl(blobData);

  messageList.value.push({
    isFinished: true,
    isSent: true,
    audioChunks: [blobData],
    audioSrc: URL.createObjectURL(blobData),
  });

  ws.value?.sendAction(new WsInputAudioStreamRequest(dataUrl.substring(dataUrl.indexOf(',') + 1)));
  ws.value?.sendAction(new WsInputAudioCompleteRequest());
};

onBeforeUnmount(() => {
  disconnect();
  messageList.value.forEach((message) => {
    if (message.audioSrc) {
      URL.revokeObjectURL(message.audioSrc);
    }
  });
});
</script>

<template>
  <q-page class="row justify-center q-pa-md-xl q-pa-md">
    <div class="col-grow column items-center justify-center q-gutter-y-md">
      <div class="text-h4 text-weight-regular">Voice Chat Test</div>
      <div
        class="full-width"
        :class="{
          'column q-gutter-y-sm': isMobile,
          'row q-gutter-x-sm': !isMobile,
        }"
      >
        <q-input
          :class="{ 'col-grow': !isMobile }"
          :autofocus="true"
          clearable
          :dense="isMobile"
          :label="i18n('labels.userId')"
          outlined
          v-model="userId"
        />
      </div>
      <q-btn
        v-if="ws"
        color="negative"
        :dense="isMobile"
        icon="link_off"
        :label="i18n('labels.disconnect')"
        @click="disconnect"
      />
      <q-btn
        v-else
        color="primary"
        :dense="isMobile"
        icon="link"
        :label="i18n('labels.connect')"
        @click="connect"
      />
      <q-card class="col-grow full-width" bordered flat>
        <div class="column full-width">
          <q-chat-message
            v-for="(messageItem, messageIndex) in messageList"
            :key="messageIndex"
            :sent="messageItem.isSent"
          >
            <q-list dense separator>
              <q-item v-if="!messageItem.isFinished">
                <q-item-section avatar>
                  <q-spinner-rings />
                </q-item-section>
                <q-item-label>
                  {{ i18n('labels.processing') }}
                </q-item-label>
              </q-item>
              <q-item v-if="messageItem.audioSrc">
                <q-item-section>
                  <audio controls :src="messageItem.audioSrc" />
                </q-item-section>
              </q-item>
              <q-item v-if="messageItem.text">
                <q-item-label>
                  {{ messageItem.text }}
                </q-item-label>
              </q-item>
            </q-list>
          </q-chat-message>
        </div>
      </q-card>
      <div class="column">
        <AudioRecorder
          :disable="
            !isChatReady || !!messageList.find((message) => message.isSent && !message.isFinished)
          "
          @stop="processData"
        />
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
