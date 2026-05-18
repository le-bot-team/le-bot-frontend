<script setup lang="ts">
// SignInOrSignUpPanel — designs 72b3b33f (检测手机号), 4a4704cc (验证码登录),
// 883b0908 (密码登录). Entry panel of the auth flow.
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { emailChallenge, emailCode, emailPassword } from 'src/utils/api/auth';
import { useAuthStore } from 'stores/auth';
import { useTracker } from 'src/composables/useTracker';

defineProps<{
  name: string | number;
}>();
const emit = defineEmits<{
  next: [isNew: boolean, email: string, code: string, needsPassword: boolean];
}>();

const router = useRouter();
const authStore = useAuthStore();
const { accessToken, isNeverSendCode, remainedSendCodeCooldownSeconds } =
  storeToRefs(authStore);
const { notify } = useQuasar();
const { trackConversion } = useTracker();

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

// Navigation to legal pages
const goToTermsOfService = () => router.push('/stack/settings/terms-of-service');
const goToUserAgreement = () => router.push('/stack/settings/user-agreement');
const goToPrivacyPolicy = () => router.push('/stack/settings/privacy-policy');

// Clear error when user types
watch([email, codeOrPassword], () => {
  errorMsg.value = undefined;
});

const sendCode = async () => {
  if (!isValidEmail.value || !email.value?.length || isSendingCode.value) return;
  if (!isNeverSendCode.value && remainedSendCodeCooldownSeconds.value) return;

  trackConversion('auth_code_sent');
  isSendingCode.value = true;
  try {
    const result = await emailChallenge(email.value);
    if (!result.data.success) {
      errorMsg.value = '验证码发送失败';
      isSendingCode.value = false;
      return;
    }
    notify({ type: 'positive', message: '验证码已发送' });
    authStore.markCodeSent();
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
    trackConversion('auth_login_success');

    if (data.data.isNew) {
      // New user: go to password setup first
      emit('next', true, e, p, true);
    } else if (data.data.noPassword) {
      // Existing user without password: set password first, then profile
      emit('next', false, e, p, true);
    } else {
      // Existing user with password: go directly to profile setup
      emit('next', false, e, p, false);
    }
  } catch (err) {
    errorMsg.value = (err as Error).message ?? '未知错误';
  }
};
</script>

<template>
  <q-tab-panel :name="name" class="auth-panel">
    <!-- Email input -->
    <div class="auth-input-group" :class="{ 'auth-input-group--error': email && !isValidEmail }">
      <input
        class="auth-input"
        type="email"
        v-model="email"
        placeholder="请输入邮箱"
        autocomplete="email"
      />
    </div>

    <!-- Verification code input -->
    <div v-if="processMethod === 'code'" class="auth-input-row">
      <div class="auth-input-group auth-input-group--code">
        <input
          class="auth-input"
          v-model="codeOrPassword"
          placeholder="请输入验证码"
          maxlength="6"
          autocomplete="one-time-code"
        />
      </div>
      <div class="auth-input-group auth-input-group--action">
        <span
          class="auth-action-link"
          :class="{
            'auth-action-link--disabled':
              !isValidEmail || (!isNeverSendCode && remainedSendCodeCooldownSeconds),
          }"
          @click="sendCode"
        >
          {{ isSendingCode ? '发送中...' : sendCodeLabel }}
        </span>
      </div>
    </div>

    <!-- Password input -->
    <div v-else class="auth-input-group">
      <div class="auth-input-with-action">
        <input
          class="auth-input auth-input--flex"
          :type="showPassword ? 'text' : 'password'"
          v-model="codeOrPassword"
          placeholder="请输入密码"
          autocomplete="current-password"
          @focus="isPasswordFocused = true"
          @blur="isPasswordFocused = false"
        />
        <span
          v-if="isPasswordFocused || codeOrPassword?.length"
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

    <!-- Error message -->
    <div v-if="errorMsg" class="auth-error-msg">{{ errorMsg }}</div>

    <!-- Primary button -->
    <button
      class="auth-btn-primary auth-btn-primary--mt"
      :class="{ 'auth-btn-primary--disabled': !canSubmit }"
      :disabled="!canSubmit"
      @click="processSignInOrSignUp"
    >
      {{ processMethod === 'code' ? '登录/注册' : '登录' }}
    </button>

    <!-- Weak button - mode toggle -->
    <button
      class="auth-btn-weak"
      @click="processMethod = processMethod === 'code' ? 'password' : 'code'"
    >
      {{ processMethod === 'code' ? '密码登录' : '验证码登录' }}
    </button>

    <!-- Terms agreement checkbox -->
    <div class="auth-terms-row" @click="agreeTerms = !agreeTerms">
      <div class="auth-checkbox">
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
      <span class="auth-terms-text">
        我已阅读并同意<span class="link" @click.stop="goToTermsOfService">《服务条款》</span>、<span
          class="link"
          @click.stop="goToUserAgreement"
          >《用户协议》</span
        >和<span class="link" @click.stop="goToPrivacyPolicy">《隐私政策》</span>
      </span>
    </div>
  </q-tab-panel>
</template>

<style scoped lang="scss">
// SignInOrSignUpPanel — designs 72b3b33f / 4a4704cc / 883b0908
// All shared input/button/error/terms styles come from app.scss globals.
// Only component-specific spacing overrides remain here.

.auth-btn-primary--mt {
  margin-top: 24px;
}
</style>
