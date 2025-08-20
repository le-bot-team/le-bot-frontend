<script setup lang="ts">
import { storeToRefs } from 'pinia';
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
import { useChatStore } from 'stores/chat';

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

const { conversationId } = storeToRefs(useChatStore());
const { notify, screen } = useQuasar();

const isMobile = computed(() => screen.lt.md);

const i18n = i18nSubPath('pages.HomePage');

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
  ws.value = new WsWrapper(`${process.env.LE_BOT_BACKEND_WS_BASE_URL}/api/v1/chat/ws?token=test`);
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
    switch (message.data.role) {
      case 'assistant': {
        let unfinishedMessage = messageList.value.findLast(
          (message) => !message.isFinished && !message.isSent,
        );
        if (!unfinishedMessage) {
          unfinishedMessage = {
            isFinished: false,
            isSent: false,
            audioChunks: [],
            chatId: message.data.chatId,
            text: message.data.text,
          };
          messageList.value.push(unfinishedMessage);
        } else {
          unfinishedMessage.text = message.data.text;
        }
        break;
      }
      case 'user': {
        let unfinishedMessage = messageList.value.findLast(
          (message) => !message.isFinished && message.isSent,
        );
        if (!unfinishedMessage) {
          unfinishedMessage = {
            isFinished: false,
            isSent: true,
            audioChunks: [],
            chatId: message.data.chatId,
            text: message.data.text,
          };
          messageList.value.push(unfinishedMessage);
        } else {
          unfinishedMessage.text = message.data.text;
        }
        break;
      }
    }
  });
  ws.value.setHandler(WsAction.outputTextComplete, (message) => {
    conversationId.value = message.data.conversationId;
    switch (message.data.role) {
      case 'assistant': {
        let unfinishedMessage = messageList.value.findLast(
          (message) => !message.isFinished && !message.isSent,
        );
        if (!unfinishedMessage) {
          unfinishedMessage = {
            isFinished: false,
            isSent: false,
            audioChunks: [],
            chatId: message.data.chatId,
            text: message.data.text,
          };
          messageList.value.push(unfinishedMessage);
        }
        unfinishedMessage.text = message.data.text;
        break;
      }
      case 'user': {
        let unfinishedMessage = messageList.value.findLast(
          (message) => !message.isFinished && message.isSent,
        );
        if (!unfinishedMessage) {
          unfinishedMessage = {
            isFinished: false,
            isSent: true,
            audioChunks: [],
            chatId: message.data.chatId,
            text: message.data.text,
          };
          messageList.value.push(unfinishedMessage);
        }
        unfinishedMessage.text = message.data.text;
        unfinishedMessage.isFinished = true;
        break;
      }
    }
  });
  ws.value.setHandler(WsAction.outputAudioStream, async (message) => {
    conversationId.value = message.data.conversationId;
    const audioBlob = base64ToBlob(message.data.buffer);

    let unfinishedMessage = messageList.value.findLast(
      (message) => !message.isFinished && !message.isSent,
    );
    if (unfinishedMessage) {
      unfinishedMessage.audioChunks.push(audioBlob);
      unfinishedMessage.chatId = message.data.chatId;

      // 初始化音频上下文（仅在第一次）
      if (!unfinishedMessage.audioContext) {
        unfinishedMessage.audioContext = new AudioContext();
        unfinishedMessage.nextStartTime = unfinishedMessage.audioContext.currentTime;
      }

      await playAudioChunk(unfinishedMessage, await pcmToWav(audioBlob));
    } else {
      unfinishedMessage = {
        isFinished: false,
        isSent: false,
        audioChunks: [audioBlob],
        audioContext: new AudioContext(),
        nextStartTime: 0,
        chatId: message.data.chatId,
      };
      await playAudioChunk(unfinishedMessage, await pcmToWav(audioBlob));
      messageList.value.push(unfinishedMessage);
    }
  });
  ws.value.setHandler(WsAction.outputAudioComplete, async (message) => {
    conversationId.value = message.data.conversationId;
    const unfinishedMessage = messageList.value.findLast(
      (message) => !message.isFinished && !message.isSent,
    );
    if (unfinishedMessage) {
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
    const unfinishedMessage = messageList.value.findLast(
      (message) => !message.isFinished && !message.isSent,
    );
    if (unfinishedMessage) {
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

  let unfinishedMessage = messageList.value.findLast(
    (message) => !message.isFinished && message.isSent,
  );
  if (!unfinishedMessage) {
    unfinishedMessage = {
      isFinished: false,
      isSent: true,
      audioChunks: [blobData],
    };
    messageList.value.push(unfinishedMessage);
  } else {
    unfinishedMessage.audioChunks.push(blobData);
  }
};

const onStop = () => {
  if (!ws.value) {
    console.warn('WebSocket connection not available');
    return;
  }

  ws.value?.sendAction(new WsInputAudioCompleteRequest(''));

  const unfinishedMessage = messageList.value.findLast(
    (message) => !message.isFinished && message.isSent,
  );
  if (unfinishedMessage) {
    unfinishedMessage.audioSrc = URL.createObjectURL(new Blob(unfinishedMessage.audioChunks));
  } else {
    console.warn('No unfinished message found to finalize');
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
      <div>Conversation ID: {{ conversationId.length ? conversationId : 'Not available' }}</div>
      <q-input
        class="full-width"
        :autofocus="true"
        clearable
        :dense="isMobile"
        :label="i18n('labels.userId')"
        name="user-id-input"
        outlined
        v-model="userId"
      />
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
      <q-card class="col-grow full-width column" bordered flat>
        <q-scroll-area class="col-grow full-width">
          <q-chat-message
            class="q-mx-md"
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
        </q-scroll-area>
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
