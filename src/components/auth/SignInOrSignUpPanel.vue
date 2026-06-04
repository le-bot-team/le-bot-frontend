<script setup lang="ts">
// SignInOrSignUpPanel — initial entry panel of the auth flow.
// Contains: email input + privacy checkbox + continue button.
// On submit: calls emailCheck to determine if email is registered (isNew),
// then routes to registration (new user) or login (existing user).
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { emailCheck } from 'src/utils/api/auth';
import { mapAuthError, mapAuthBusinessError } from 'src/utils/auth-error';
import { i18nSubPath } from 'src/utils/common';

defineProps<{
  name: string | number;
}>();
const emit = defineEmits<{
  next: [isNew: boolean, email: string, code: string, needsPassword: boolean];
  finish: [];
}>();

const router = useRouter();
const i18n = i18nSubPath('components.auth.SignInOrSignUpPanel');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const agreeTerms = ref(false);
const email = ref<string>();
const errorMsg = ref<string>();
const isSubmitting = ref(false);

const isValidEmail = computed(() => emailRegex.test(email.value ?? ''));
const canSubmit = computed(() => isValidEmail.value && agreeTerms.value && !isSubmitting.value);

// Navigation to legal pages
const goToTermsOfService = () => router.push('/stack/settings/terms-of-service');
const goToUserAgreement = () => router.push('/stack/settings/user-agreement');
const goToPrivacyPolicy = () => router.push('/stack/settings/privacy-policy');

// Clear error when user types
watch(email, () => {
  errorMsg.value = undefined;
});

const handleSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return;

  isSubmitting.value = true;
  errorMsg.value = undefined;

  try {
    const e = email.value ?? '';

    // Check if email is registered
    const { data } = await emailCheck(e);
    if (!data.success) {
      errorMsg.value = mapAuthBusinessError(data.message || '', 'authErrors.unknownError');
      isSubmitting.value = false;
      return;
    }

    // Route based on registration status
    const isNew = data.data.isNew;
    if (isNew) {
      // New user → registration page (will send verification code there)
      emit('next', true, e, '', true);
    } else {
      // Existing user → login page
      emit('next', false, e, '', false);
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
    <!-- Email input -->
    <div class="auth-input-group" :class="{ 'auth-input-group--error': email && !isValidEmail }">
      <input
        class="auth-input"
        type="email"
        v-model="email"
        :placeholder="i18n('labels.email')"
        autocomplete="email"
        :disabled="isSubmitting"
      />
    </div>

    <!-- Error message -->
    <div v-if="errorMsg" class="auth-error-msg">{{ errorMsg }}</div>

    <!-- Primary button -->
    <button
      class="auth-btn-primary auth-btn-primary--mt"
      :class="{ 'auth-btn-primary--disabled': !canSubmit }"
      :disabled="!canSubmit"
      @click="handleSubmit"
    >
      <q-spinner v-if="isSubmitting" size="20px" class="q-mr-sm" />
      {{ isSubmitting ? i18n('labels.signingIn') : i18n('labels.continue') }}
    </button>

    <!-- Terms agreement checkbox -->
    <label class="auth-terms-row">
      <input type="checkbox" v-model="agreeTerms" class="auth-checkbox-input" />
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
        {{ i18n('labels.termsPrefix')
        }}<a class="link" href="#" @click.stop.prevent="goToTermsOfService">{{
          i18n('labels.termsOfService')
        }}</a
        >{{ i18n('labels.termsSeparator')
        }}<a class="link" href="#" @click.stop.prevent="goToUserAgreement">{{
          i18n('labels.userAgreement')
        }}</a
        >{{ i18n('labels.termsAnd')
        }}<a class="link" href="#" @click.stop.prevent="goToPrivacyPolicy">{{
          i18n('labels.privacyPolicy')
        }}</a>
      </span>
    </label>
  </q-tab-panel>
</template>

<style scoped lang="scss">
// SignInOrSignUpPanel — initial entry panel
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
