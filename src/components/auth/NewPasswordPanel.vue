<script setup lang="ts">
// NewPasswordPanel — design 2d090f70 (登录页-注册).
// Password setup step: email display (readonly), verification code,
// new password, confirm password, and submit button.
// User must manually click "Send Code" to request verification code.
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import { emailChallenge, emailCode, emailPassword, emailReset } from 'src/utils/api/auth';
import { changePassword } from 'src/utils/api/profile';
import iconVisible from 'src/assets/icons/auth/visible/icon_visible_password@2x.png';
import iconInvisible from 'src/assets/icons/auth/invisible/icon_invisible_password@2x.png';
import { useAuthStore } from 'stores/auth';
import { i18nSubPath } from 'src/utils/common';

const props = defineProps<{
  email: string;
  isNew: boolean;
  name: string | number;
}>();
const emit = defineEmits<{
  next: [];
  previous: [];
}>();

const authStore = useAuthStore();
const { accessToken, isNeverSendCode, remainedSendCodeCooldownSeconds } = storeToRefs(authStore);
const i18n = i18nSubPath('components.auth.NewPasswordPanel');

const localCode = ref<string>();
const newPassword = ref<string>();
const confirmPassword = ref<string>();
const errorMsg = ref<string>();
const isSendingCode = ref(false);
const isSubmitting = ref(false);
const showPassword = ref(false);
const showConfirm = ref(false);
const isNewPasswordFocused = ref(false);
const isConfirmFocused = ref(false);

// Effective code: use local input
const effectiveCode = computed(() => localCode.value ?? '');
const codeError = computed(() => effectiveCode.value.length !== 6);
const passwordError = computed(
  () => newPassword.value === undefined || newPassword.value.length < 8,
);
const passwordErrorMsg = computed(() => {
  if (newPassword.value === undefined || newPassword.value.length === 0) return '';
  if (newPassword.value.length < 8) return i18n('errors.passwordTooShort');
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

  if (score <= 2) return { level: 1, label: i18n('labels.strengthWeak') };
  if (score <= 4) return { level: 2, label: i18n('labels.strengthMedium') };
  return { level: 3, label: i18n('labels.strengthStrong') };
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
    !!effectiveCode.value?.length &&
    !!newPassword.value?.length &&
    !!confirmPassword.value?.length &&
    !isSubmitting.value,
);

const sendCodeLabel = computed(() => {
  if (isSendingCode.value) return i18n('labels.sending');
  if (isNeverSendCode.value) return i18n('labels.sendCode');
  if (remainedSendCodeCooldownSeconds.value)
    return i18n('labels.resendCodeCooldown', { seconds: remainedSendCodeCooldownSeconds.value });
  return i18n('labels.resendCode');
});

const canSendCode = computed(
  () =>
    !!props.email?.length &&
    !isSendingCode.value &&
    (isNeverSendCode.value || !remainedSendCodeCooldownSeconds.value),
);

// Clear error on input
watch([localCode, newPassword, confirmPassword], () => {
  errorMsg.value = undefined;
});

const sendCode = async () => {
  if (!canSendCode.value) return;
  isSendingCode.value = true;
  try {
    const result = await emailChallenge(props.email);
    if (!result.data.success) {
      errorMsg.value = i18n('notifications.sendCodeFailed');
      isSendingCode.value = false;
      return;
    }
    authStore.markCodeSent();
  } catch {
    errorMsg.value = i18n('notifications.sendCodeFailed');
  }
  isSendingCode.value = false;
};

const confirmNewPassword = async () => {
  if (!canSubmit.value || isSubmitting.value) return;

  // Snapshot reactive values before async operations (#5 TOCTOU guard)
  const snapshotCode = effectiveCode.value;
  const snapshotPassword = newPassword.value ?? '';
  const snapshotEmail = props.email;

  isSubmitting.value = true;
  errorMsg.value = undefined;

  try {
    if (props.isNew) {
      // New user registration flow:
      // Step 1: Register via verification code (creates user in backend, returns token)
      const { data: codeData } = await emailCode(snapshotEmail, snapshotCode);
      if (!codeData.success) {
        errorMsg.value = codeData.message || i18n('notifications.setPasswordFailed');
        isSubmitting.value = false;
        return;
      }
      // Write access token from registration
      if (codeData.success && 'data' in codeData && codeData.data) {
        accessToken.value = codeData.data.accessToken;
      }

      // Step 2: Set initial password via authenticated endpoint
      // Code was consumed by emailCode, so use /profiles/password with empty oldPassword
      if (accessToken.value) {
        try {
          const { data: pwdData } = await changePassword(accessToken.value, {
            oldPassword: '',
            newPassword: snapshotPassword,
          });
          if (!pwdData.success) {
            console.warn('Initial password set via /profiles/password failed:', pwdData.message);
          }
        } catch {
          console.warn('Initial password set failed, user can set later via settings');
        }
      }
    } else {
      // Existing user (noPassword=true) — set password via email reset
      const { data: resetData } = await emailReset(snapshotEmail, snapshotCode, snapshotPassword);
      if (!resetData.success) {
        errorMsg.value = resetData.message || i18n('notifications.setPasswordFailed');
        isSubmitting.value = false;
        return;
      }
    }

    // Step 3: Auto-login with the new password (skip if token already valid)
    if (!accessToken.value) {
      try {
        const { data } = await emailPassword(snapshotEmail, snapshotPassword);
        if (data.success) {
          accessToken.value = data.data.accessToken;
        }
      } catch {
        // Auto-login failed but password set succeeded — proceed
      }
    }

    emit('next');
  } catch (err) {
    errorMsg.value = (err as Error).message || i18n('notifications.unknownError');
  } finally {
    isSubmitting.value = false;
  }
};

let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  if (!props.email?.length) {
    errorMsg.value = i18n('notifications.invalidEmail');
    fallbackTimer = setTimeout(() => emit('previous'), 3000);
    return;
  }
  // Do NOT auto-send verification code — let user click "Send Code" manually.
});

onUnmounted(() => {
  if (fallbackTimer !== undefined) clearTimeout(fallbackTimer);
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
          v-model="localCode"
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
          :class="{ 'auth-action-link--disabled': !canSendCode || isSubmitting }"
          :disabled="!canSendCode || isSubmitting"
          @click="sendCode"
        >
          {{ sendCodeLabel }}
        </button>
      </div>
    </div>

    <!-- New password -->
    <div
      class="auth-input-group"
      :class="{ 'auth-input-group--error': passwordError && newPassword?.length }"
    >
      <div class="auth-input-with-action">
        <input
          class="auth-input auth-input--flex"
          :type="showPassword ? 'text' : 'password'"
          v-model="newPassword"
          :placeholder="i18n('labels.newPasswordPlaceholder')"
          autocomplete="new-password"
          :disabled="isSubmitting"
          @focus="isNewPasswordFocused = true"
          @blur="isNewPasswordFocused = false"
        />
        <button
          v-if="isNewPasswordFocused || newPassword?.length"
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
        <span :class="{ active: passwordStrength.level >= 1 }">{{
          i18n('labels.strengthWeak')
        }}</span>
        <span :class="{ active: passwordStrength.level >= 2 }">{{
          i18n('labels.strengthMedium')
        }}</span>
        <span :class="{ active: passwordStrength.level >= 3 }">{{
          i18n('labels.strengthStrong')
        }}</span>
      </div>
    </div>

    <!-- Confirm password -->
    <div class="auth-input-group" :class="{ 'auth-input-group--error': confirmError }">
      <div class="auth-input-with-action">
        <input
          class="auth-input auth-input--flex"
          :type="showConfirm ? 'text' : 'password'"
          v-model="confirmPassword"
          :placeholder="i18n('labels.confirmPasswordPlaceholder')"
          autocomplete="new-password"
          :disabled="isSubmitting"
          @focus="isConfirmFocused = true"
          @blur="isConfirmFocused = false"
        />
        <button
          v-if="isConfirmFocused || confirmPassword?.length"
          type="button"
          class="auth-action-icon"
          @click="showConfirm = !showConfirm"
          aria-label="Toggle password visibility"
        >
          <img
            :src="showConfirm ? iconVisible : iconInvisible"
            alt=""
            class="password-toggle-icon"
          />
        </button>
      </div>
    </div>

    <!-- Combined error message -->
    <div v-if="errorMsg" class="auth-error-msg">{{ errorMsg }}</div>
    <div v-else-if="passwordErrorMsg" class="auth-error-msg">{{ passwordErrorMsg }}</div>
    <div v-else-if="confirmError" class="auth-error-msg">{{ i18n('errors.passwordMismatch') }}</div>

    <!-- Primary button -->
    <button
      class="auth-btn-primary auth-btn-primary--mt-lg"
      :class="{ 'auth-btn-primary--disabled': !canSubmit }"
      :disabled="!canSubmit"
      @click="confirmNewPassword"
    >
      <q-spinner v-if="isSubmitting" size="20px" class="q-mr-sm" />
      {{
        isSubmitting
          ? i18n('labels.processing')
          : isNew
            ? i18n('labels.completeRegistration')
            : i18n('labels.confirmNewPassword')
      }}
    </button>
  </q-tab-panel>
</template>

<style scoped lang="scss">
// NewPasswordPanel — design 2d090f70 (登录页-注册)
// Shared input/button/error styles from app.scss globals.
// Only component-specific overrides remain here.

.email-text {
  font-family: var(--font-family), sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-text);
  padding: 13px 16px;
}

.auth-btn-primary--mt-lg {
  margin-top: 48px;
}

.password-toggle-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: block;
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
    background: #e5e6eb;
    border-radius: 2px;
    transition: background-color 0.3s ease;
  }

  &__bar--active:first-of-type {
    background: #ff4d4f;
  }

  &__bar--active:nth-of-type(2) {
    background: #ffa940;
  }

  &__bar--active:last-of-type {
    background: #52c41a;
  }

  &__labels {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #9398a9;
    transition: color 0.3s ease;

    span.active {
      color: #52c41a;
    }
  }
}
</style>
