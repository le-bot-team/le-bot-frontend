import { defineStore } from 'pinia';
import { ref } from 'vue';

/** Serializable subset of ChatMessage — excludes Blob[] and audioUrl */
export interface PersistedChatMessage {
  id: string;
  chatId?: string;
  conversationId?: string;
  role: 'user' | 'assistant';
  text: string;
  isFinished: boolean;
  isStreaming: boolean;
  timestamp: number;
}

const MAX_PERSISTED_MESSAGES = 200;

export const useChatStore = defineStore(
  'chat',
  () => {
    const conversationId = ref('');
    const isMuted = ref(false);
    const muteNotifications = ref(true);
    const autoMute = ref(false);
    const autoMuteStart = ref('22:00');
    const autoMuteEnd = ref('07:00');

    /** Persisted chat messages (text only, no audio blobs) */
    const persistedMessages = ref<PersistedChatMessage[]>([]);

    /** Append or update a message in the persisted list, enforcing the size cap */
    function upsertMessage(msg: PersistedChatMessage) {
      const idx = persistedMessages.value.findIndex((m) => m.id === msg.id);
      if (idx !== -1) {
        persistedMessages.value[idx] = msg;
      } else {
        persistedMessages.value.push(msg);
        // Enforce cap — drop oldest messages
        if (persistedMessages.value.length > MAX_PERSISTED_MESSAGES) {
          persistedMessages.value = persistedMessages.value.slice(
            persistedMessages.value.length - MAX_PERSISTED_MESSAGES,
          );
        }
      }
    }

    /** Bulk replace all persisted messages (used when syncing from useChatSession) */
    function setPersistedMessages(msgs: PersistedChatMessage[]) {
      persistedMessages.value = msgs.slice(-MAX_PERSISTED_MESSAGES);
    }

    /** Clear all persisted messages */
    function clearMessages() {
      persistedMessages.value = [];
    }

    const resetState = () => {
      conversationId.value = '';
      isMuted.value = false;
      muteNotifications.value = true;
      autoMute.value = false;
      autoMuteStart.value = '22:00';
      autoMuteEnd.value = '07:00';
      persistedMessages.value = [];
    };

    return {
      conversationId,
      isMuted,
      muteNotifications,
      autoMute,
      autoMuteStart,
      autoMuteEnd,
      persistedMessages,
      upsertMessage,
      setPersistedMessages,
      clearMessages,
      resetState,
    };
  },
  {
    persist: true,
  },
);
