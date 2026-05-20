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
import { i18nSubPath } from 'src/utils/common';

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
const i18n = i18nSubPath('components.auth.SignInOrSignUpPanel');

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
  if (isNeverSendCode.value) return i18n('labels.sendCode');
  if (remainedSendCodeCooldownSeconds.value)
    return i18n('labels.resendCodeCooldown', { seconds: remainedSendCodeCooldownSeconds.value });
  return i18n('labels.resendCode');
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
      errorMsg.value = i18n('notifications.sendCodeFailed');
      isSendingCode.value = false;
      return;
    }
    notify({ type: 'positive', message: i18n('notifications.codeSent') });
    authStore.markCodeSent();
  } catch (err) {
    errorMsg.value = i18n('notifications.sendCodeFailed');
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
      errorMsg.value = i18n('notifications.unknownError');
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
    errorMsg.value = (err as Error).message ?? i18n('notifications.unknownError');
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
        :placeholder="i18n('labels.email')"
        autocomplete="email"
      />
    </div>

    <!-- Verification code input -->
    <div v-if="processMethod === 'code'" class="auth-input-row">
      <div class="auth-input-group auth-input-group--code">
        <input
          class="auth-input"
          v-model="codeOrPassword"
          :placeholder="i18n('labels.codePlaceholder')"
          maxlength="6"
          autocomplete="one-time-code"
        />
      </div>
      <div class="auth-input-group auth-input-group--action">
        <button
          type="button"
          class="auth-action-link"
          :class="{
            'auth-action-link--disabled':
              !isValidEmail || (!isNeverSendCode && remainedSendCodeCooldownSeconds),
          }"
          :disabled="isSendingCode || !isValidEmail || (!isNeverSendCode && !!remainedSendCodeCooldownSeconds)"
          @click="sendCode"
        >
          {{ isSendingCode ? i18n('labels.sending') : sendCodeLabel }}
        </button>
      </div>
    </div>

    <!-- Password input -->
    <div v-else class="auth-input-group">
      <div class="auth-input-with-action">
        <input
          class="auth-input auth-input--flex"
          :type="showPassword ? 'text' : 'password'"
          v-model="codeOrPassword"
          :placeholder="i18n('labels.passwordPlaceholder')"
          autocomplete="current-password"
          @focus="isPasswordFocused = true"
          @blur="isPasswordFocused = false"
        />
        <button
          v-if="isPasswordFocused || codeOrPassword?.length"
          type="button"
          class="auth-action-icon"
          @click="showPassword = !showPassword"
          aria-label="Toggle password visibility"
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
        </button>
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
      {{ processMethod === 'code' ? i18n('labels.signInOrSignUp') : i18n('labels.signIn') }}
    </button>

    <!-- Weak button - mode toggle -->
    <button
      class="auth-btn-weak"
      @click="codeOrPassword = undefined; processMethod = processMethod === 'code' ? 'password' : 'code'"
    >
      {{ processMethod === 'code' ? i18n('labels.usePassword') : i18n('labels.useCode') }}
    </button>

    <!-- Terms agreement checkbox -->
    <label class="auth-terms-row">
      <input
        type="checkbox"
        v-model="agreeTerms"
        class="auth-checkbox-input"
      />
      <span class="auth-checkbox-visual">
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
      </span>
      <span class="auth-terms-text">
        {{ i18n('labels.termsPrefix') }}<a class="link" href="#" @click.stop.prevent="goToTermsOfService">{{ i18n('labels.termsOfService') }}</a>{{ i18n('labels.termsSeparator') }}<a
          class="link"
          href="#"
          @click.stop.prevent="goToUserAgreement"
          >{{ i18n('labels.userAgreement') }}</a
        >{{ i18n('labels.termsAnd') }}<a class="link" href="#" @click.stop.prevent="goToPrivacyPolicy">{{ i18n('labels.privacyPolicy') }}</a>
      </span>
    </label>
  </q-tab-panel>
</template>

<style scoped lang="scss">
// SignInOrSignUpPanel — designs 72b3b33f / 4a4704cc / 883b0908
// All shared input/button/error/terms styles come from app.scss globals.
// Only component-specific spacing overrides remain here.

.auth-btn-primary--mt {
  margin-top: 24px;
}

.auth-checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}
</style>
