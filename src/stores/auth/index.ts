import { defineStore } from 'pinia';
import { computed, onScopeDispose, ref, watch } from 'vue';

import { SEND_CODE_COOLDOWN_INTERVAL } from 'stores/auth/constants';

export const useAuthStore = defineStore(
  'auth',
  () => {
    const accessToken = ref<string>();
    const sendCodeTime = ref<number>(0);

    // Reactive clock that ticks every second while cooldown is active
    const now = ref<number>(Date.now());
    let tickTimer: ReturnType<typeof setInterval> | undefined;

    const startTick = () => {
      if (tickTimer) return;
      tickTimer = setInterval(() => {
        now.value = Date.now();
        // Stop ticking once cooldown expires
        if (now.value - sendCodeTime.value >= SEND_CODE_COOLDOWN_INTERVAL) {
          stopTick();
        }
      }, 1000);
    };

    const stopTick = () => {
      if (tickTimer) {
        clearInterval(tickTimer);
        tickTimer = undefined;
      }
    };

    const isNeverSendCode = computed(() => sendCodeTime.value === 0);
    const remainedSendCodeCooldownSeconds = computed(() => {
      const diff = SEND_CODE_COOLDOWN_INTERVAL - (now.value - sendCodeTime.value);
      return diff > 0 ? Math.ceil(diff / 1000) : 0;
    });

    const tryResetSendCodeCooldown = () => {
      if (!remainedSendCodeCooldownSeconds.value) {
        sendCodeTime.value = 0;
      }
    };

    const markCodeSent = () => {
      sendCodeTime.value = Date.now();
      now.value = Date.now();
      startTick();
    };

    // If store is hydrated from persistence with an active cooldown, resume ticking
    watch(sendCodeTime, (val) => {
      if (val > 0 && Date.now() - val < SEND_CODE_COOLDOWN_INTERVAL) {
        now.value = Date.now();
        startTick();
      }
    }, { immediate: true });

    onScopeDispose(() => stopTick());

    return {
      accessToken,
      isNeverSendCode,
      markCodeSent,
      remainedSendCodeCooldownSeconds,
      tryResetSendCodeCooldown,
    };
  },
  {
    persist: true,
  },
);
