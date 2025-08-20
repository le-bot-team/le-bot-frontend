import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useChatStore = defineStore(
  'chat',
  () => {
    const conversationId = ref('');

    return {
      conversationId,
    };
  },
  {
    persist: true,
  },
);
