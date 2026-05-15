<script setup lang="ts">
// NewPasswordPanel — design 2d090f70 (登录页-注册).
// Password setup step: email display (readonly), verification code, new password,
// confirm password, and submit button.
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
const passwordErrorMsg = computed(() => {
  if (newPassword.value === undefined || newPassword.value.length === 0) return '';
  if (newPassword.value.length < 8) return '密码至少 8 位';
  return '';
});

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = newPassword.value ?? '';
  if (!pwd.length) return { level: 0, label: '' };

  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pwd)) score++;

  if (score <= 2) return { level: 1, label: '弱' };
  if (score <= 4) return { level: 2, label: '中' };
  return { level: 3, label: '强' };
});

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

    // Both new and existing users go to profile setup after password is set
    emit('next');
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
    <div class="auth-input-group auth-input-group--readonly">
      <span class="email-text">{{ email }}</span>
    </div>

    <!-- Verification code -->
    <div class="auth-input-row">
      <div class="auth-input-group auth-input-group--code">
        <input
          class="auth-input"
          v-model="code"
          placeholder="请输入验证码"
          maxlength="6"
          autocomplete="one-time-code"
          :disabled="isSubmitting"
        />
      </div>
      <div class="auth-input-group auth-input-group--action">
        <span
          class="auth-action-link"
          :class="{ 'auth-action-link--disabled': !canSendCode || isSubmitting }"
          @click="sendCode"
        >
          {{ sendCodeLabel }}
        </span>
      </div>
    </div>

    <!-- New password -->
    <div class="auth-input-group" :class="{ 'auth-input-group--error': passwordError && newPassword?.length }">
      <div class="auth-input-with-action">
        <input
          class="auth-input auth-input--flex"
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
          class="auth-action-icon"
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

    <!-- Password strength indicator -->
    <div v-if="newPassword?.length" class="password-strength">
      <div class="password-strength__bars">
        <div
          class="password-strength__bar"
          :class="{ 'password-strength__bar--active': passwordStrength.level >= 1 }"
        ></div>
        <div
          class="password-strength__bar"
          :class="{ 'password-strength__bar--active': passwordStrength.level >= 2 }"
        ></div>
        <div
          class="password-strength__bar"
          :class="{ 'password-strength__bar--active': passwordStrength.level >= 3 }"
        ></div>
      </div>
      <div class="password-strength__labels">
        <span :class="{ 'active': passwordStrength.level >= 1 }">弱</span>
        <span :class="{ 'active': passwordStrength.level >= 2 }">中</span>
        <span :class="{ 'active': passwordStrength.level >= 3 }">强</span>
      </div>
    </div>

    <!-- Confirm password -->
    <div class="auth-input-group" :class="{ 'auth-input-group--error': confirmError }">
      <div class="auth-input-with-action">
        <input
          class="auth-input auth-input--flex"
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
          class="auth-action-icon"
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
    <div v-if="errorMsg" class="auth-error-msg">{{ errorMsg }}</div>
    <div v-else-if="passwordErrorMsg" class="auth-error-msg">{{ passwordErrorMsg }}</div>
    <div v-else-if="confirmError" class="auth-error-msg">输入的两次密码不同</div>

    <!-- Primary button -->
    <button
      class="auth-btn-primary auth-btn-primary--mt-lg"
      :class="{ 'auth-btn-primary--disabled': !canSubmit }"
      :disabled="!canSubmit"
      @click="confirmNewPassword"
    >
      {{ isSubmitting ? '处理中...' : isNew ? '完成注册并登录' : '确认新密码' }}
    </button>
  </q-tab-panel>
</template>

<style scoped lang="scss">
// NewPasswordPanel — design 2d090f70 (登录页-注册)
// Shared input/button/error styles from app.scss globals.
// Only component-specific overrides remain here.

.email-text {
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-text);
  padding: 13px 16px;
}

.auth-btn-primary--mt-lg {
  margin-top: 48px;
}

.password-strength {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;

  &__bars {
    display: flex;
    gap: 4px;
  }

  &__bar {
    flex: 1;
    height: 4px;
    background: #E5E6EB;
    border-radius: 2px;
    transition: background-color 0.3s ease;
  }

  &__bar--active:first-of-type {
    background: #FF4D4F;
  }

  &__bar--active:nth-of-type(2) {
    background: #FFA940;
  }

  &__bar--active:last-of-type {
    background: #52C41A;
  }

  &__labels {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #9398A9;
    transition: color 0.3s ease;

    span.active {
      color: #52C41A;
    }
  }
}
</style>
