import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useChatStore = defineStore(
  'chat',
  () => {
    const conversationId = ref('');
    const isMuted = ref(false);
    const muteNotifications = ref(true);
    const autoMute = ref(false);
    const autoMuteStart = ref('22:00');
    const autoMuteEnd = ref('07:00');

    return {
      conversationId,
      isMuted,
      muteNotifications,
      autoMute,
      autoMuteStart,
      autoMuteEnd,
    };
  },
  {
    persist: true,
  },
);
