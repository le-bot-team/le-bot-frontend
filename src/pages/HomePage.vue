<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, onBeforeUnmount, ref } from 'vue';

import AudioRecorder from 'components/AudioRecorder.vue';
import { blobToDataUrl, i18nSubPath } from 'src/utils/common';
import { CozeWsWrapper } from 'src/types/websocket';
import { constructChatConfig } from 'src/utils/network/coze';
import type { CozeWsResponse } from 'src/types/websocket/types';
import { CozeWsEventType } from 'src/types/websocket/types';

interface AudioMessage {
  id: string;
  isSent: boolean;
  audioBlob?: Blob;
  audioSrc?: string;
  text?: string;
}

const { notify, screen } = useQuasar();

const isMobile = computed(() => screen.lt.md);

const i18n = i18nSubPath('pages.HomePage');

const accessToken = ref<string>('');
const botId = ref<string>('');
const conversationId = ref<string>('');
const isChatReady = ref<boolean>(false);
const messageList = ref<AudioMessage[]>([]);
const userId = ref<string>('');
const ws = ref<CozeWsWrapper>();

const connect = () => {
  if (!userId.value) {
    console.warn(`userId is empty`);
    return;
  }
  const chatConfig = constructChatConfig(userId.value);

  if (ws.value) {
    disconnect();
  }
  ws.value = new CozeWsWrapper(accessToken.value, botId.value);
  ws.value.setCloseHandler('chat.disable_recording', () => {
    isChatReady.value = false;
  });
  ws.value.setEventHandler(CozeWsEventType.chatCreated, () => {
    ws.value?.sendEvent(
      'chat.update_config',
      CozeWsEventType.chatUpdate,
      conversationId.value?.length
        ? {
            ...chatConfig,
            conversation_id: conversationId,
          }
        : chatConfig,
    );
  });
  ws.value.setEventHandler<
    CozeWsResponse & {
      data: { chat_config: { conversation_id: string } };
    }
  >(CozeWsEventType.chatUpdated, (message) => {
    isChatReady.value = true;
    conversationId.value = message.data.chat_config.conversation_id;
  });
  ws.value.setEventHandler<
    CozeWsResponse & {
      data: { id: string };
    }
  >(CozeWsEventType.conversationChatCreated, (message) => {
    messageList.value.push({
      id: message.data.id,
      isSent: false,
    });
  });
  ws.value.setEventHandler<
    CozeWsResponse & {
      data: {
        id: string;
        last_error?: {
          Code: number;
          Msg: string;
        };
      };
    }
  >(CozeWsEventType.conversationChatInProgress, (message) => {
    if (message.data.last_error) {
      notify({
        type: 'negative',
        message: message.data.last_error.Msg,
        caption: message.data.last_error.Code.toString(),
      });
      return;
    }
    if (!messageList.value.find((item) => item.id === message.data.id)) {
      notify({
        type: 'negative',
        message: i18n('labels.invalidDownstreamMessage'),
      });
    }
  });
  ws.value.setEventHandler<
    CozeWsResponse & {
      data: {
        id: string;
        role: 'assistant' | 'user';
        content: string;
        content_type: 'card' | 'object_string' | 'text';
        type: 'answer' | 'function_call' | 'question' | 'tool_output' | 'tool_response' | 'verbose';
      };
    }
  >(CozeWsEventType.conversationMessageDelta, (message) => {
    console.log(message);
  });
  ws.value.setEventHandler<
    CozeWsResponse & {
      data: {
        id: string;
        role: 'assistant' | 'user';
        content: string;
        type: 'answer' | 'function_call' | 'question' | 'tool_output' | 'tool_response' | 'verbose';
      };
    }
  >(CozeWsEventType.conversationAudioDelta, (message) => {
    console.log(message);
  });
  ws.value.setEventHandler<
    CozeWsResponse & {
      data: {
        id: string;
        role: 'assistant' | 'user';
        content: string;
        content_type: 'card' | 'object_string' | 'text';
        type: 'answer' | 'function_call' | 'question' | 'tool_output' | 'tool_response' | 'verbose';
      };
    }
  >(CozeWsEventType.conversationMessageCompleted, (message) => {
    console.log(message);
  });
  ws.value.setEventHandler<
    CozeWsResponse & {
      data: {
        id: string;
        role: 'assistant' | 'user';
        content: string;
        type: 'answer' | 'function_call' | 'question' | 'tool_output' | 'tool_response' | 'verbose';
      };
    }
  >(CozeWsEventType.conversationAudioCompleted, (message) => {
    console.log(message);
  });
  ws.value.setEventHandler(CozeWsEventType.inputAudioBufferCompleted, () => {});
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
    id: `${userId.value}_${Date.now().toString()}`,
    isSent: true,
    audioBlob: blobData,
    audioSrc: URL.createObjectURL(blobData),
  });

  ws.value?.sendEvent('chat.input_audio_append', CozeWsEventType.inputAudioBufferAppend, {
    data: {
      delta: dataUrl.substring(dataUrl.indexOf(',') + 1),
    },
  });
  ws.value?.sendEvent('chat.input_audio_complete', CozeWsEventType.inputAudioBufferComplete);
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
          :label="i18n('labels.accessToken')"
          outlined
          v-model="accessToken"
        />
        <q-input
          :class="{ 'col-grow': !isMobile }"
          :autofocus="true"
          clearable
          :dense="isMobile"
          :label="i18n('labels.botId')"
          outlined
          v-model="botId"
        />
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
        :disable="!accessToken || !botId"
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
            <audio v-if="messageItem.audioSrc" controls :src="messageItem.audioSrc" />
            <div v-else class="row q-gutter-x-sm">
              <q-spinner-rings />
              <div>
                {{ i18n('labels.thinking') }}
              </div>
            </div>
          </q-chat-message>
        </div>
      </q-card>
      <div class="column">
        <AudioRecorder :disable="!isChatReady" @stop="processData" />
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
