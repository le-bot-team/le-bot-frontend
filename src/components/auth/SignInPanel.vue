<script setup lang="ts">
// SignInPanel — login panel for existing (registered) users.
// Shows email (readonly) + password login by default, with option
// to switch to verification code login.
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';

import { emailChallenge, emailCode, emailPassword } from 'src/utils/api/auth';
import { mapAuthError, mapAuthBusinessError } from 'src/utils/auth-error';
import iconVisible from 'src/assets/icons/auth/visible/icon_visible_password@2x.png';
import iconInvisible from 'src/assets/icons/auth/invisible/icon_invisible_password@2x.png';
import { useAuthStore } from 'stores/auth';
import { useTracker } from 'src/composables/useTracker';
import { i18nSubPath } from 'src/utils/common';

defineProps<{
  email: string;
  name: string | number;
}>();
const emit = defineEmits<{
  finish: [];
  previous: [];
  forgotPassword: [];
}>();

const authStore = useAuthStore();
const { accessToken, isNeverSendCode, remainedSendCodeCooldownSeconds } = storeToRefs(authStore);
const { trackConversion } = useTracker();
const i18n = i18nSubPath('components.auth.SignInPanel');

const codeOrPassword = ref<string>();
const errorMsg = ref<string>();
const isSendingCode = ref(false);
const isSubmitting = ref(false);
const loginMethod = ref<'password' | 'code'>('password');
const showPassword = ref(false);
const isPasswordFocused = ref(false);

const codeError = computed(
  () => loginMethod.value === 'code' && codeOrPassword.value?.length !== 6,
);
const canSubmit = computed(
  () => !!codeOrPassword.value?.length && !codeError.value && !isSubmitting.value,
);

const sendCodeLabel = computed(() => {
  if (isSendingCode.value) return i18n('labels.sending');
  if (isNeverSendCode.value) return i18n('labels.sendCode');
  if (remainedSendCodeCooldownSeconds.value)
    return i18n('labels.resendCodeCooldown', { seconds: remainedSendCodeCooldownSeconds.value });
  return i18n('labels.resendCode');
});

const canSendCode = computed(
  () => !isSendingCode.value && (isNeverSendCode.value || !remainedSendCodeCooldownSeconds.value),
);

// Clear error on input
watch(codeOrPassword, () => {
  errorMsg.value = undefined;
});

const sendCode = async (email: string) => {
  if (!canSendCode.value || isSendingCode.value) return;
  isSendingCode.value = true;
  try {
    const result = await emailChallenge(email);
    if (!result.data.success) {
      errorMsg.value =
        mapAuthBusinessError(result.data.message || '', 'authErrors.unknownError') ||
        i18n('notifications.sendCodeFailed');
      isSendingCode.value = false;
      return;
    }
    authStore.markCodeSent();
  } catch {
    errorMsg.value = i18n('notifications.sendCodeFailed');
  }
  isSendingCode.value = false;
};

const handleLogin = async (email: string) => {
  if (!canSubmit.value || isSubmitting.value) return;

  isSubmitting.value = true;
  errorMsg.value = undefined;

  try {
    const code = codeOrPassword.value ?? '';

    if (loginMethod.value === 'code') {
      // Code login
      let data: Awaited<ReturnType<typeof emailCode>>['data'];
      try {
        ({ data } = await emailCode(email, code));
      } catch (codeErr) {
        errorMsg.value = mapAuthError(codeErr, 'authErrors.invalidCode');
        return;
      }
      if (!data.success) {
        errorMsg.value = mapAuthBusinessError(data.message || '', 'authErrors.invalidCode');
        return;
      }
      accessToken.value = data.data.accessToken;
      trackConversion('auth_login_success');
      emit('finish');
    } else {
      // Password login
      const { data } = await emailPassword(email, code);
      if (!data.success) {
        errorMsg.value = mapAuthBusinessError(data.message || '', 'authErrors.unknownError');
        return;
      }
      accessToken.value = data.data.accessToken;
      trackConversion('auth_login_success');
      emit('finish');
    }
  } catch (err) {
    errorMsg.value = mapAuthError(err, 'authErrors.unknownError');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <q-tab-panel :name="name" class="auth-panel">
    <!-- Email display (read-only) -->
    <div class="auth-input-group auth-input-group--readonly">
      <span class="email-text">{{ email }}</span>
    </div>

    <!-- Verification code login mode -->
    <div v-if="loginMethod === 'code'" class="auth-input-row">
      <div class="auth-input-group auth-input-group--code">
        <input
          class="auth-input"
          v-model="codeOrPassword"
          :placeholder="i18n('labels.codePlaceholder')"
          maxlength="6"
          autocomplete="one-time-code"
          :disabled="isSubmitting"
        />
      </div>
      <div class="auth-input-group auth-input-group--action">
        <button
          type="button"
          class="auth-action-link"
          :class="{
            'auth-action-link--disabled': !canSendCode || isSubmitting,
          }"
          :disabled="!canSendCode || isSubmitting"
          @click="sendCode(email)"
        >
          {{ sendCodeLabel }}
        </button>
      </div>
    </div>

    <!-- Password login mode -->
    <div v-else class="auth-input-group">
      <div class="auth-input-with-action">
        <input
          class="auth-input auth-input--flex"
          :type="showPassword ? 'text' : 'password'"
          v-model="codeOrPassword"
          :placeholder="i18n('labels.passwordPlaceholder')"
          autocomplete="current-password"
          :disabled="isSubmitting"
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
          <img
            :src="showPassword ? iconVisible : iconInvisible"
            alt=""
            class="password-toggle-icon"
          />
        </button>
      </div>
    </div>

    <!-- Forgot password link (only in password mode) -->
    <div v-if="loginMethod === 'password'" class="forgot-password-row">
      <button
        type="button"
        class="forgot-password-link"
        :disabled="isSubmitting"
        @click="emit('forgotPassword')"
      >
        {{ i18n('labels.forgotPassword') }}
      </button>
    </div>

    <!-- Error message -->
    <div v-if="errorMsg" class="auth-error-msg">{{ errorMsg }}</div>

    <!-- Primary button -->
    <button
      class="auth-btn-primary auth-btn-primary--mt"
      :class="{ 'auth-btn-primary--disabled': !canSubmit }"
      :disabled="!canSubmit"
      @click="handleLogin(email)"
    >
      <q-spinner v-if="isSubmitting" size="20px" class="q-mr-sm" />
      {{ isSubmitting ? i18n('labels.signingIn') : i18n('labels.signIn') }}
    </button>

    <!-- Weak button - mode toggle -->
    <button
      class="auth-btn-weak"
      :disabled="isSubmitting"
      @click="
        codeOrPassword = undefined;
        loginMethod = loginMethod === 'password' ? 'code' : 'password';
      "
    >
      {{ loginMethod === 'password' ? i18n('labels.useCode') : i18n('labels.usePassword') }}
    </button>
  </q-tab-panel>
</template>

<style scoped lang="scss">
// SignInPanel — login for existing users
// All shared input/button/error styles come from app.scss globals.

.email-text {
  font-family: var(--font-family), sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-text);
  padding: 13px 16px;
}

.auth-btn-primary--mt {
  margin-top: 24px;
}

.password-toggle-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: block;
}

.forgot-password-row {
  display: flex;
  justify-content: flex-end;
  width: 311px;
  margin-top: var(--spacing-sm);
}

.forgot-password-link {
  background: transparent;
  border: none;
  padding: 4px 0;
  font-family: var(--font-family), sans-serif;
  font-size: var(--font-size-caption);
  font-weight: 400;
  line-height: var(--line-height-caption);
  color: var(--clr-text-secondary);
  cursor: pointer;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  transition:
    color 0.2s ease,
    opacity 0.2s ease;

  &:hover {
    color: var(--clr-primary);
  }

  &:active {
    color: var(--clr-primary);
    opacity: 0.7;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
