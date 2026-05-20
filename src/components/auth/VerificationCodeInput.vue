<script setup lang="ts">
import { emailChallenge } from 'src/utils/api/auth';
import { i18nSubPath } from 'src/utils/common';
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useAuthStore } from 'stores/auth';

const props = defineProps<{
  email?: string | undefined;
}>();
const modelValue = defineModel<string | undefined>();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const i18n = i18nSubPath('components.auth.VerificationCodeInput');

const { isNeverSendCode, remainedSendCodeCooldownSeconds } = storeToRefs(useAuthStore());
const { notify } = useQuasar();

const isSendingCode = ref(false);

const isValidEmail = computed(() => emailRegex.test(props.email ?? ''));

const canSendCode = computed(
  () =>
    isValidEmail.value &&
    !!props.email?.length &&
    !isSendingCode.value &&
    (isNeverSendCode.value || !remainedSendCodeCooldownSeconds.value),
);

const sendCodeLabel = computed(() => {
  if (isSendingCode.value) return i18n('labels.sending');
  if (isNeverSendCode.value) return i18n('labels.sendCode');
  if (remainedSendCodeCooldownSeconds.value)
    return i18n('labels.resendCodeCooldown', {
      seconds: remainedSendCodeCooldownSeconds.value,
    });
  return i18n('labels.resendCode');
});

const sendCode = async () => {
  if (!canSendCode.value || !props.email) return;

  isSendingCode.value = true;
  try {
    const result = await emailChallenge(props.email);
    if (!result.data.success) {
      notify({
        type: 'warning',
        message: i18n('notifications.sendCodeFailed'),
        caption: result.data.message,
      });
      isSendingCode.value = false;
      return;
    }
    notify({
      type: 'positive',
      message: i18n('notifications.sendCodeSuccess'),
    });
  } catch (error) {
    notify({
      type: 'negative',
      message: i18n('notifications.sendCodeError'),
      caption: (error as Error).message,
    });
  }
  isSendingCode.value = false;
};
</script>

<template>
  <div class="input-row">
    <div class="input-group input-group--code">
      <input
        class="design-input"
        v-model="modelValue"
        :placeholder="i18n('labels.codePlaceholder')"
        maxlength="6"
        autocomplete="one-time-code"
      />
    </div>
    <div class="input-group input-group--action">
      <button
        type="button"
        class="action-link"
        :class="{ 'action-link--disabled': !canSendCode }"
        :disabled="!canSendCode"
        @click="sendCode"
      >
        {{ sendCodeLabel }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ===== Input row (two independent boxes side-by-side) ===== */
.input-row {
  display: flex;
  gap: 12px;
  width: 311px;
}

/* ===== Shared input-group base ===== */
.input-group {
  height: 48px;
  position: relative;
  border: 1px solid var(--clr-input-border, rgba(147, 152, 169, 0.2));
  border-radius: var(--input-radius, 8px);
  transition: border-color 0.2s;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
  background: var(--clr-input-bg, rgba(255, 255, 255, 1));
}

.input-group:focus-within {
  border-color: var(--clr-link);
}

/* ===== Code input box (172px per design spec 矩形 2013) ===== */
.input-group--code {
  width: 172px;
}

/* ===== Send code button box (127px per design spec 矩形 2014) ===== */
.input-group--action {
  width: 127px;
  justify-content: center;
}

.design-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-text);
  padding: 13px 16px;
  box-sizing: border-box;
}

.design-input::placeholder {
  font-weight: 400;
  color: var(--clr-placeholder);
}

/* ===== Action link (Send Verification Code) ===== */
.action-link {
  font-family: var(--font-family, 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif);
  font-size: var(--font-size-action-link, 15px);
  font-weight: var(--font-weight-action-link, 400);
  line-height: var(--line-height-action-link, 22px);
  color: var(--clr-action-link, rgba(32, 204, 249, 1));
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  text-align: center;
  border: none;
  background: none;
  padding: 0;
  font-family: inherit;
}

.action-link--disabled {
  color: var(--clr-action-link-disabled, rgba(147, 152, 169, 1));
  cursor: not-allowed;
}
</style>
