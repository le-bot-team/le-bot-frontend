import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { SEND_CODE_COOLDOWN_INTERVAL } from 'stores/auth/constants';

export const useAuthStore = defineStore(
  'auth',
  () => {
    const accessToken = ref<string>();
    const sendCodeTime = ref<number>(0);

    const isNeverSendCode = computed(() => sendCodeTime.value === 0);
    const remainedSendCodeCooldownSeconds = computed(() => {
      const diff = SEND_CODE_COOLDOWN_INTERVAL - (Date.now() - sendCodeTime.value);
      return diff > 0 ? Math.ceil(diff / 1000) : 0;
    });

    const tryResetSendCodeCooldown = () => {
      if (!remainedSendCodeCooldownSeconds.value) {
        sendCodeTime.value = 0;
      }
    };

    return {
      accessToken,
      isNeverSendCode,
      remainedSendCodeCooldownSeconds,
      tryResetSendCodeCooldown,
    };
  },
  {
    persist: true,
  },
);
