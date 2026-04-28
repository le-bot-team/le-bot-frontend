<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';

import { emailChallenge, emailCode, emailPassword } from 'src/utils/api/auth';
import { useAuthStore } from 'stores/auth';

defineProps<{
  name: string | number;
}>();
const emit = defineEmits<{
  finish: [];
  next: [isNew: boolean, email: string, code: string];
}>();

const { accessToken, isNeverSendCode, remainedSendCodeCooldownSeconds } =
  storeToRefs(useAuthStore());
const { notify } = useQuasar();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const processFunctionsMatrix = {
  code: emailCode,
  password: emailPassword,
};

const agreeTerms = ref(false);
const codeOrPassword = ref<string>();
const email = ref<string>();
const errorMsg = ref<string>();
const isSendingCode = ref(false);
const processMethod = ref<'code' | 'password'>('code');
const showPassword = ref(false);
const isPasswordFocused = ref(false);

const codeError = computed(
  () => processMethod.value === 'code' && codeOrPassword.value?.length !== 6,
);
const isValidEmail = computed(() => emailRegex.test(email.value ?? ''));
const canSubmit = computed(
  () =>
    isValidEmail.value && !!codeOrPassword.value?.length && !codeError.value && agreeTerms.value,
);

const sendCodeLabel = computed(() => {
  if (isNeverSendCode.value) return '发送验证码';
  if (remainedSendCodeCooldownSeconds.value)
    return `重新发送(${remainedSendCodeCooldownSeconds.value}s)`;
  return '重新发送';
});

// Clear error when user types
watch([email, codeOrPassword], () => {
  errorMsg.value = undefined;
});

const sendCode = async () => {
  if (!isValidEmail.value || !email.value?.length || isSendingCode.value) return;
  if (!isNeverSendCode.value && remainedSendCodeCooldownSeconds.value) return;

  isSendingCode.value = true;
  try {
    const result = await emailChallenge(email.value);
    if (!result.data.success) {
      errorMsg.value = '验证码发送失败';
      isSendingCode.value = false;
      return;
    }
    notify({ type: 'positive', message: '验证码已发送' });
  } catch (err) {
    errorMsg.value = (err as Error).message || '验证码发送失败';
  }
  isSendingCode.value = false;
};

const processSignInOrSignUp = async () => {
  if (!canSubmit.value) return;

  const processFunction = processFunctionsMatrix[processMethod.value];
  if (!processFunction) return;

  try {
    const e = email.value ?? '';
    const p = codeOrPassword.value ?? '';
    const { data } = await processFunction(e, p);
    if (!data.success) {
      errorMsg.value = data.message ?? '未知错误';
      return;
    }

    accessToken.value = data.data.accessToken;

    if (data.data.isNew) {
      emit('next', true, e, p);
    } else if (data.data.noPassword) {
      emit('next', false, e, p);
    } else {
      emit('finish');
    }
  } catch (err) {
    errorMsg.value = (err as Error).message ?? '未知错误';
  }
};
</script>

<template>
  <q-tab-panel :name="name" class="auth-panel">
    <!-- Email input -->
    <div class="input-group" :class="{ 'input-group--error': email && !isValidEmail }">
      <input
        class="design-input"
        type="email"
        v-model="email"
        placeholder="请输入邮箱"
        autocomplete="email"
      />
    </div>

    <!-- Verification code input -->
    <div v-if="processMethod === 'code'" class="input-row">
      <div class="input-group input-group--code">
        <input
          class="design-input"
          v-model="codeOrPassword"
          placeholder="请输入验证码"
          maxlength="6"
          autocomplete="one-time-code"
        />
      </div>
      <div class="input-group input-group--action">
        <span
          class="action-link"
          :class="{
            'action-link--disabled':
              !isValidEmail || (!isNeverSendCode && remainedSendCodeCooldownSeconds),
          }"
          @click="sendCode"
        >
          {{ isSendingCode ? '发送中...' : sendCodeLabel }}
        </span>
      </div>
    </div>

    <!-- Password input -->
    <div v-else class="input-group">
      <div class="input-with-action">
        <input
          class="design-input design-input--flex"
          :type="showPassword ? 'text' : 'password'"
          v-model="codeOrPassword"
          placeholder="请输入密码"
          autocomplete="current-password"
          @focus="isPasswordFocused = true"
          @blur="isPasswordFocused = false"
        />
        <span
          v-if="isPasswordFocused || codeOrPassword?.length"
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

    <!-- Error message -->
    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <!-- Primary button -->
    <button
      class="btn-max"
      :class="{ 'btn-max--disabled': !canSubmit }"
      :disabled="!canSubmit"
      @click="processSignInOrSignUp"
    >
      {{ processMethod === 'code' ? '登录/注册' : '登录' }}
    </button>

    <!-- Weak button - mode toggle -->
    <button
      class="btn-weak"
      @click="processMethod = processMethod === 'code' ? 'password' : 'code'"
    >
      {{ processMethod === 'code' ? '密码登录' : '验证码登录' }}
    </button>

    <!-- Terms agreement checkbox -->
    <div class="terms-row" @click="agreeTerms = !agreeTerms">
      <div class="checkbox" :class="{ 'checkbox--checked': agreeTerms }">
        <svg v-if="agreeTerms" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect width="14" height="14" rx="4" fill="#20CCF9" />
          <path
            d="M3 7L6 10L11 4"
            stroke="white"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect width="14" height="14" rx="4" stroke="#9398A9" stroke-width="1" fill="none" />
        </svg>
      </div>
      <span class="terms-text">
        我已阅读并同意<span class="link">《服务条款》</span>、<span class="link">《用户协议》</span
        >和<span class="link">《隐私政策》</span>
      </span>
    </div>
  </q-tab-panel>
</template>

<style scoped>
/* ===== Design token colors ===== */
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

/* ===== Input row (verification code: two independent boxes) ===== */
.input-row {
  display: flex;
  gap: 12px;
  width: 311px;
  margin-top: 12px;
}

/* ===== Input group ===== */
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

/* Spacing between stacked inputs (design: ~12px gap) */
/* Only apply to top-level input-groups, not siblings inside .input-row */
.input-group + .input-group:not(.input-group--action) {
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

/* ===== Input with right action (password mode: eye icon) ===== */
.input-with-action {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

/* ===== Action link (inside independent action box) ===== */
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

/* ===== Error message ===== */
.error-msg {
  width: 311px;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-error);
  margin-top: 8px;
  text-align: left;
}

/* ===== Max button ===== */
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
  margin-top: 24px;
  transition: opacity 0.2s;
}
.btn-max:hover {
  opacity: 0.9;
}
.btn-max--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== Weak button ===== */
.btn-weak {
  width: 311px;
  height: 56px;
  border: 1px solid rgba(33, 186, 69, 1);
  border-radius: 28px;
  background: transparent;
  color: var(--clr-weak);
  font-family: var(--font-family);
  font-size: 17px;
  font-weight: 400;
  line-height: 24px;
  cursor: pointer;
  margin-top: 8px;
}

/* ===== Terms row ===== */
.terms-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 311px;
  margin-top: 16px;
  cursor: pointer;
  user-select: none;
}
.checkbox {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-top: 1px;
}
.terms-text {
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--clr-placeholder);
}
.terms-text .link {
  color: var(--clr-link);
}
</style>
