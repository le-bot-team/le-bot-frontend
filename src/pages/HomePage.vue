<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, onBeforeUnmount, ref } from 'vue';

import AudioRecorder from 'components/AudioRecorder.vue';
import { base64ToBlob, blobToDataUrl, i18nSubPath } from 'src/utils/common';
import { CozeWsWrapper } from 'src/types/websocket';
import { constructChatConfig } from 'src/utils/network/coze';
import type { CozeWsResponse } from 'src/types/websocket/types';
import { CozeWsEventType } from 'src/types/websocket/types';
import { pcmToWav } from 'src/utils/audio';

interface AudioMessage {
  isFinished: boolean;
  isSent: boolean;
  audioChunks: Blob[];
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
      data: { conversation_id: string };
    }
  >(CozeWsEventType.conversationChatCreated, (message) => {
    console.log(`Received ${message.event_type}: ${message.data.conversation_id}`);
    messageList.value.push({
      isFinished: false,
      isSent: false,
      audioChunks: [],
    });
  });
  ws.value.setEventHandler<
    CozeWsResponse & {
      data: {
        conversation_id: string;
        last_error?: {
          Code: number;
          Msg: string;
        };
      };
    }
  >(CozeWsEventType.conversationChatInProgress, async (message) => {
    console.log(`Received ${message.event_type}: ${message.data.conversation_id}`);
    await processLastUnfinishedMessage(
      false,
      () => {
        if (message.data.last_error) {
          notify({
            type: 'negative',
            message: message.data.last_error.Msg,
            caption: message.data.last_error.Code.toString(),
          });
        }
      },
      message.event_type,
    );
  });
  ws.value.setEventHandler<
    CozeWsResponse & {
      data: {
        conversation_id: string;
        role: 'assistant' | 'user';
        content: string;
        content_type: 'card' | 'object_string' | 'text';
        type: 'answer' | 'function_call' | 'question' | 'tool_output' | 'tool_response' | 'verbose';
      };
    }
  >(
    [CozeWsEventType.conversationMessageDelta, CozeWsEventType.conversationMessageCompleted],
    async (message) =>
      await processLastUnfinishedMessage(
        false,
        (unfinishedMessage) => {
          if (message.data.type === 'answer') {
            unfinishedMessage.text = message.data.content;
          } else {
            console.log(message);
          }
        },
        message.event_type,
      ),
  );
  ws.value.setEventHandler<
    CozeWsResponse & {
      data: {
        conversation_id: string;
        role: 'assistant' | 'user';
        content: string;
        type: 'answer' | 'function_call' | 'question' | 'tool_output' | 'tool_response' | 'verbose';
      };
    }
  >(
    CozeWsEventType.conversationAudioDelta,
    async (message) =>
      await processLastUnfinishedMessage(
        false,
        (unfinishedMessage) => {
          if (message.data.type === 'answer') {
            unfinishedMessage.audioChunks?.push(base64ToBlob(message.data.content));
          } else {
            console.log(message);
          }
        },
        message.event_type,
      ),
  );
  ws.value.setEventHandler<
    CozeWsResponse & {
      data: {
        conversation_id: string;
        role: 'assistant' | 'user';
        content: string;
        type: 'answer' | 'function_call' | 'question' | 'tool_output' | 'tool_response' | 'verbose';
      };
    }
  >(
    CozeWsEventType.conversationAudioCompleted,
    async (message) =>
      await processLastUnfinishedMessage(
        false,
        async (unfinishedMessage) => {
          if (message.data.type === 'answer') {
            unfinishedMessage.audioSrc = URL.createObjectURL(
              await pcmToWav(new Blob(unfinishedMessage.audioChunks)),
            );
          } else {
            console.log(message);
          }
        },
        message.event_type,
      ),
  );
  ws.value.setEventHandler<
    CozeWsResponse & {
      data: {
        conversation_id: string;
        last_error?: {
          Code: number;
          Msg: string;
        };
      };
    }
  >(
    CozeWsEventType.conversationChatCompleted,
    async (message) =>
      await processLastUnfinishedMessage(
        false,
        (unfinishedMessage) => {
          if (message.data.last_error) {
            notify({
              type: 'negative',
              message: message.data.last_error.Msg,
              caption: message.data.last_error.Code.toString(),
            });
          }
          unfinishedMessage.isFinished = true;
          console.log(messageList.value);
        },
        message.event_type,
      ),
  );
  ws.value.setEventHandler(CozeWsEventType.inputAudioBufferCompleted, () => {});
  ws.value.setEventHandler<
    CozeWsResponse & {
      data: { content: string };
    }
  >(
    CozeWsEventType.conversationAudioTranscriptUpdate,
    async (message) =>
      await processLastUnfinishedMessage(
        true,
        (unfinishedMessage) => {
          unfinishedMessage.text = message.data.content;
        },
        message.event_type,
      ),
  );
  ws.value.setEventHandler<
    CozeWsResponse & {
      data: { content: string };
    }
  >(
    CozeWsEventType.conversationAudioTranscriptCompleted,
    async (message) =>
      await processLastUnfinishedMessage(
        true,
        (unfinishedMessage) => {
          unfinishedMessage.text = message.data.content;
          unfinishedMessage.isFinished = true;
        },
        message.event_type,
      ),
  );
};

const disconnect = () => {
  if (ws.value) {
    ws.value.destroy();
    ws.value = undefined;
  }
  isChatReady.value = false;
};

const processLastUnfinishedMessage = async (
  isSent: boolean,
  handler: (message: AudioMessage) => void | Promise<void>,
  errorCaption: string = '',
) => {
  const message = messageList.value.findLast(
    (message) => !message.isFinished && message.isSent === isSent,
  );
  if (!message) {
    notify({
      type: 'negative',
      message: i18n('labels.noUnfinishedMessage'),
      caption: errorCaption,
    });
  } else {
    await handler(message);
  }
};

const processData = async (blobData: Blob) => {
  const dataUrl = await blobToDataUrl(blobData);

  messageList.value.push({
    isFinished: false,
    isSent: true,
    audioChunks: [blobData],
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
