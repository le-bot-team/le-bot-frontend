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
  audioContext?: AudioContext;
  nextStartTime?: number;
  isPlaying?: boolean;
  hasStreamPlayed?: boolean; // 标记是否已经流式播放过
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
  ws.value = new WsWrapper(
    `${
      process.env.DEPLOY_GITHUB_PAGE
        ? 'wss://cafuuchino.studio26f.org:10580'
        : process.env.DEPLOY_ELYSIA
          ? ''
          : 'ws://localhost:3000'
    }/api/v1/chat/ws?token=test`,
  );
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
      unfinishedMessage.text = (unfinishedMessage.text ?? '') + message.data.text;
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
  ws.value.setHandler(WsAction.outputAudioStream, async (message) => {
    console.log(message);
    conversationId.value = message.data.conversationId;

    let unfinishedMessage = messageList.value.at(-1);

    // 如果最后一条消息是发送的，创建新的接收消息
    if (unfinishedMessage?.isSent === true) {
      messageList.value.push({
        isFinished: false,
        isSent: false,
        audioChunks: [],
      });
      unfinishedMessage = messageList.value.at(-1);
    }

    if (unfinishedMessage) {
      unfinishedMessage.chatId = message.data.chatId;
      const audioBlob = base64ToBlob(message.data.buffer);
      unfinishedMessage.audioChunks.push(audioBlob);

      // 初始化音频上下文（仅在第一次）
      if (!unfinishedMessage.audioContext) {
        unfinishedMessage.audioContext = new AudioContext();
        unfinishedMessage.nextStartTime = unfinishedMessage.audioContext.currentTime;
      }

      // 直接播放每个音频块，使用时间调度避免重叠
      await playAudioChunk(unfinishedMessage, await pcmToWav(audioBlob));
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

const onData = async (blobData: Blob) => {
  if (!ws.value) {
    console.warn('WebSocket connection not available');
    return;
  }

  const dataUrl = await blobToDataUrl(blobData);
  ws.value?.sendAction(new WsInputAudioStreamRequest(dataUrl.substring(dataUrl.indexOf(',') + 1)));

  const sentMessage = messageList.value.at(-1);
  if (sentMessage?.isSent === true && !sentMessage.isFinished) {
    sentMessage.audioChunks.push(blobData);
  } else {
    messageList.value.push({
      isFinished: false,
      isSent: true,
      audioChunks: [blobData],
    });
  }
};

const onStop = () => {
  if (!ws.value) {
    console.warn('WebSocket connection not available');
    return;
  }

  ws.value?.sendAction(new WsInputAudioCompleteRequest(''));

  const sentMessage = messageList.value.at(-1);
  if (sentMessage?.isSent === true && !sentMessage.isFinished) {
    sentMessage.isFinished = true;
    sentMessage.audioSrc = URL.createObjectURL(new Blob(sentMessage.audioChunks));
  }
};

const playAudioChunk = async (message: AudioMessage, audioData: Blob) => {
  if (!message.audioContext) {
    console.warn('Audio context not initialized');
    return;
  }

  try {
    // 标记消息已经开始流式播放
    message.hasStreamPlayed = true;

    // Convert audio blob to AudioBuffer
    const arrayBuffer = await audioData.arrayBuffer();
    const audioBuffer = await message.audioContext.decodeAudioData(arrayBuffer);

    const source = message.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(message.audioContext.destination);

    // Schedule playback
    const startTime = Math.max(message.audioContext.currentTime, message.nextStartTime || 0);
    source.start(startTime);
    message.nextStartTime = startTime + audioBuffer.duration;

    // Update message to indicate playback has started
    message.isPlaying = true;

    // Set up onended callback
    source.onended = () => {
      message.isPlaying = false;
    };
  } catch (error) {
    console.warn('Failed to decode or play audio data:', error);
  }
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
                  <audio
                    :autoplay="!messageItem.isSent && !messageItem.hasStreamPlayed"
                    controls
                    :src="messageItem.audioSrc"
                  />
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
      <div class="row">
        <AudioRecorder :disable="!isChatReady" @data="onData" @stop="onStop" />
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
