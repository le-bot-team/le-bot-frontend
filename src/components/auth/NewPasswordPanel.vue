<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';

import { emailChallenge, emailPassword, emailReset } from 'src/utils/api/auth';
import { useAuthStore } from 'stores/auth';

const props = defineProps<{
  email: string;
  isNew: boolean;
  name: string | number;
}>();
const emit = defineEmits<{
  finish: [];
  next: [];
  previous: [];
}>();

const { accessToken, isNeverSendCode, remainedSendCodeCooldownSeconds } =
  storeToRefs(useAuthStore());

const code = ref<string>();
const newPassword = ref<string>();
const confirmPassword = ref<string>();
const errorMsg = ref<string>();
const isSendingCode = ref(false);
const isSubmitting = ref(false);
const showPassword = ref(false);
const showConfirm = ref(false);
const isNewPasswordFocused = ref(false);
const isConfirmFocused = ref(false);

const codeError = computed(() => code.value?.length !== 6);
const passwordError = computed(
  () => newPassword.value === undefined || newPassword.value.length < 8,
);
const confirmError = computed(
  () =>
    !!newPassword.value?.length &&
    !!confirmPassword.value?.length &&
    newPassword.value !== confirmPassword.value,
);
const canSubmit = computed(
  () =>
    !codeError.value &&
    !passwordError.value &&
    !confirmError.value &&
    !!code.value?.length &&
    !!newPassword.value?.length &&
    !!confirmPassword.value?.length &&
    !isSubmitting.value,
);

const sendCodeLabel = computed(() => {
  if (isSendingCode.value) return '发送中...';
  if (isNeverSendCode.value) return '发送验证码';
  if (remainedSendCodeCooldownSeconds.value)
    return `重新发送(${remainedSendCodeCooldownSeconds.value}s)`;
  return '重新发送';
});

const canSendCode = computed(
  () =>
    !!props.email?.length &&
    !isSendingCode.value &&
    (isNeverSendCode.value || !remainedSendCodeCooldownSeconds.value),
);

// Clear error on input
watch([code, newPassword, confirmPassword], () => {
  errorMsg.value = undefined;
});

const sendCode = async () => {
  if (!canSendCode.value) return;
  isSendingCode.value = true;
  try {
    const result = await emailChallenge(props.email);
    if (!result.data.success) {
      errorMsg.value = '验证码发送失败';
      isSendingCode.value = false;
      return;
    }
  } catch (err) {
    errorMsg.value = (err as Error).message || '验证码发送失败';
  }
  isSendingCode.value = false;
};

const confirmNewPassword = async () => {
  if (!canSubmit.value || isSubmitting.value) return;

  isSubmitting.value = true;
  errorMsg.value = undefined;

  try {
    // Step 1: Reset password with verification code
    {
      const c = code.value ?? '';
      const p = newPassword.value ?? '';
      const { data } = await emailReset(props.email, c, p);
      if (!data.success) {
        errorMsg.value = data.message || '设置密码失败';
        isSubmitting.value = false;
        return;
      }
    }

    // Step 2: Auto-login with the new password
    const p = newPassword.value ?? '';
    const { data } = await emailPassword(props.email, p);
    if (!data.success) {
      errorMsg.value = data.message || '自动登录失败';
      isSubmitting.value = false;
      return;
    }

    accessToken.value = data.data.accessToken;

    if (props.isNew) {
      emit('next');
    } else {
      emit('finish');
    }
  } catch (err) {
    errorMsg.value = (err as Error).message || '操作失败，请稍后重试';
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  if (!props.email?.length) {
    errorMsg.value = '邮箱地址无效，请返回重新输入';
    setTimeout(() => emit('previous'), 3000);
  }
});
</script>

<template>
  <q-tab-panel :name="name" class="auth-panel">
    <!-- Email display (read-only, styled as input-group per design spec) -->
    <div class="input-group input-group--readonly">
      <span class="email-text">{{ email }}</span>
    </div>

    <!-- Verification code -->
    <div class="input-row">
      <div class="input-group input-group--code">
        <input
          class="design-input"
          v-model="code"
          placeholder="请输入验证码"
          maxlength="6"
          autocomplete="one-time-code"
          :disabled="isSubmitting"
        />
      </div>
      <div class="input-group input-group--action">
        <span
          class="action-link"
          :class="{ 'action-link--disabled': !canSendCode || isSubmitting }"
          @click="sendCode"
        >
          {{ sendCodeLabel }}
        </span>
      </div>
    </div>

    <!-- New password -->
    <div class="input-group">
      <div class="input-with-action">
        <input
          class="design-input design-input--flex"
          :type="showPassword ? 'text' : 'password'"
          v-model="newPassword"
          placeholder="请设置密码"
          autocomplete="new-password"
          :disabled="isSubmitting"
          @focus="isNewPasswordFocused = true"
          @blur="isNewPasswordFocused = false"
        />
        <span
          v-if="isNewPasswordFocused || newPassword?.length"
          class="action-icon"
          @click="showPassword = !showPassword"
        >
          <svg v-if="showPassword" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 4C4 4 1 10 1 10C1 10 4 16 10 16C16 16 19 10 19 10C19 10 16 4 10 4Z"
              stroke="#9398A9"
              stroke-width="1.5"
            />
            <circle cx="10" cy="10" r="3" stroke="#9398A9" stroke-width="1.5" />
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 4C4 4 1 10 1 10C1 10 4 16 10 16C16 16 19 10 19 10C19 10 16 4 10 4Z"
              stroke="#9398A9"
              stroke-width="1.5"
            />
            <line x1="3" y1="3" x2="17" y2="17" stroke="#9398A9" stroke-width="1.5" />
          </svg>
        </span>
      </div>
    </div>

    <!-- Confirm password -->
    <div class="input-group" :class="{ 'input-group--error': confirmError }">
      <div class="input-with-action">
        <input
          class="design-input design-input--flex"
          :type="showConfirm ? 'text' : 'password'"
          v-model="confirmPassword"
          placeholder="请再次输入设置的密码"
          autocomplete="new-password"
          :disabled="isSubmitting"
          @focus="isConfirmFocused = true"
          @blur="isConfirmFocused = false"
        />
        <span
          v-if="isConfirmFocused || confirmPassword?.length"
          class="action-icon"
          @click="showConfirm = !showConfirm"
        >
          <svg v-if="showConfirm" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 4C4 4 1 10 1 10C1 10 4 16 10 16C16 16 19 10 19 10C19 10 16 4 10 4Z"
              stroke="#9398A9"
              stroke-width="1.5"
            />
            <circle cx="10" cy="10" r="3" stroke="#9398A9" stroke-width="1.5" />
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 4C4 4 1 10 1 10C1 10 4 16 10 16C16 16 19 10 19 10C19 10 16 4 10 4Z"
              stroke="#9398A9"
              stroke-width="1.5"
            />
            <line x1="3" y1="3" x2="17" y2="17" stroke="#9398A9" stroke-width="1.5" />
          </svg>
        </span>
      </div>
    </div>

    <!-- Combined error message -->
    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
    <div v-else-if="confirmError" class="error-msg">输入的两次密码不同</div>

    <!-- Primary button -->
    <button
      class="btn-max"
      :class="{ 'btn-max--disabled': !canSubmit }"
      :disabled="!canSubmit"
      @click="confirmNewPassword"
    >
      {{ isSubmitting ? '处理中...' : isNew ? '完成注册并登录' : '确认新密码' }}
    </button>
  </q-tab-panel>
</template>

<style scoped>
/* ===== Shared design tokens ===== */
.auth-panel {
  --clr-text: rgba(21, 23, 23, 1);
  --clr-placeholder: rgba(147, 152, 169, 1);
  --clr-link: rgba(32, 204, 249, 1);
  --clr-error: rgba(255, 93, 93, 1);
  --clr-weak: rgba(99, 104, 104, 1);
  --clr-white: rgba(255, 255, 255, 1);
  --font-family: 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;

  font-family: var(--font-family);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 0 32px;
}

/* Email display — styled as input-group */
.input-group--readonly {
  background: var(--clr-input-bg, rgba(255, 255, 255, 1));
}

.email-text {
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-text);
  padding: 13px 16px;
}

/* ===== Input row (verification code: two independent boxes) ===== */
.input-row {
  display: flex;
  gap: 12px;
  width: 311px;
  margin-top: 12px;
}

/* Input group */
.input-group {
  width: 311px;
  height: 48px;
  position: relative;
  border: 1px solid var(--clr-input-border, rgba(147, 152, 169, 0.2));
  border-radius: 8px;
  transition: border-color 0.2s;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
}
.input-group:focus-within {
  border-color: var(--clr-link);
}
.input-group--error {
  border-color: var(--clr-error);
}
.input-group--code {
  width: 172px;
}
.input-group--action {
  width: 127px;
  justify-content: center;
}

/* Spacing between stacked inputs (design: 12px gap) */
/* Only apply to top-level input-groups, not siblings inside .input-row */
.input-group + .input-group:not(.input-group--action) {
  margin-top: 12px;
}
.input-row + .input-group {
  margin-top: 12px;
}

.design-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: var(--clr-input-bg, rgba(255, 255, 255, 1));
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
/* Hide browser-native password reveal/clear buttons */
.design-input::-ms-reveal,
.design-input::-ms-clear,
.design-input::-webkit-password-toggle {
  display: none;
}
.design-input--flex {
  width: calc(100% - 40px);
}

.input-with-action {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

.action-link {
  font-size: 15px;
  font-weight: 400;
  line-height: 22px;
  color: var(--clr-link);
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  text-align: center;
}
.action-link--disabled {
  color: var(--clr-placeholder);
  cursor: not-allowed;
}

.action-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

/* Error */
.error-msg {
  width: 311px;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-error);
  margin-top: 8px;
  text-align: left;
}

/* Max button */
.btn-max {
  width: 311px;
  height: 56px;
  border: none;
  border-radius: 28px;
  background: rgba(18, 14, 44, 1);
  color: var(--clr-white);
  font-family: var(--font-family);
  font-size: 17px;
  font-weight: 500;
  line-height: 24px;
  cursor: pointer;
  margin-top: 48px;
  transition: opacity 0.2s;
}
.btn-max:hover {
  opacity: 0.9;
}
.btn-max--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
