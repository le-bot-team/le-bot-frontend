<script setup lang="ts">
import axios from 'axios';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { i18nSubPath } from 'src/utils/common';
import { changePassword } from 'src/utils/api/profile';
import { useAuthStore } from 'stores/auth';

const i18n = i18nSubPath('pages.stack.ChangePasswordPage');

const router = useRouter();
const $q = useQuasar();

const authStore = useAuthStore();
const { accessToken } = storeToRefs(authStore);

const oldPassword = ref<string>('');
const newPassword = ref<string>('');
const confirmPassword = ref<string>('');

const showOld = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

const oldFocused = ref(false);
const newFocused = ref(false);
const confirmFocused = ref(false);

const isSubmitting = ref(false);
const errorMsg = ref<string>('');

watch([oldPassword, newPassword, confirmPassword], () => {
  errorMsg.value = '';
});

const passwordTooShort = computed(() => !!newPassword.value.length && newPassword.value.length < 8);
const passwordMismatch = computed(
  () =>
    !!newPassword.value.length &&
    !!confirmPassword.value.length &&
    newPassword.value !== confirmPassword.value,
);

const canSubmit = computed(
  () =>
    !isSubmitting.value &&
    oldPassword.value.length > 0 &&
    newPassword.value.length >= 8 &&
    confirmPassword.value.length > 0 &&
    newPassword.value === confirmPassword.value,
);

const onSubmit = async () => {
  if (!canSubmit.value) return;

  const token = accessToken.value;
  if (!token) {
    $q.notify({ type: 'negative', message: i18n('notifications.notLoggedIn') });
    return;
  }

  if (passwordTooShort.value) {
    errorMsg.value = i18n('errors.passwordTooShort');
    return;
  }
  if (passwordMismatch.value) {
    errorMsg.value = i18n('errors.passwordMismatch');
    return;
  }

  isSubmitting.value = true;
  errorMsg.value = '';
  try {
    const { data } = await changePassword(token, {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
    });
    if (data.success) {
      $q.notify({ type: 'positive', message: i18n('notifications.success') });
      router.back();
    } else {
      if (data.code === 'wrongOldPassword') {
        errorMsg.value = i18n('errors.wrongOldPassword');
      } else if (data.code === 'passwordMismatch') {
        errorMsg.value = i18n('errors.passwordMismatch');
      } else if (data.code === 'invalidPassword') {
        errorMsg.value = i18n('errors.passwordTooShort');
      } else {
        errorMsg.value = data.message || i18n('notifications.failed');
      }
    }
  } catch (err) {
    const msg = axios.isAxiosError(err) ? err.message : i18n('notifications.failed');
    errorMsg.value = msg;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <q-page class="change-password-page">
    <div class="cpw-container">
      <!-- Old password -->
      <div class="cpw-input-wrap">
        <input
          v-model="oldPassword"
          class="cpw-input cpw-input--with-action"
          :type="showOld ? 'text' : 'password'"
          :placeholder="i18n('labels.oldPassword')"
          autocomplete="current-password"
          :disabled="isSubmitting"
          @focus="oldFocused = true"
          @blur="oldFocused = false"
        />
        <button
          type="button"
          v-if="oldFocused || oldPassword.length"
          class="cpw-action-icon"
          aria-label="Toggle old password visibility"
          @click="showOld = !showOld"
        >
          <svg v-if="showOld" width="20" height="20" viewBox="0 0 20 20" fill="none">
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

      <!-- New password -->
      <div class="cpw-input-wrap">
        <input
          v-model="newPassword"
          class="cpw-input cpw-input--with-action"
          :type="showNew ? 'text' : 'password'"
          :placeholder="i18n('labels.newPassword')"
          autocomplete="new-password"
          :disabled="isSubmitting"
          @focus="newFocused = true"
          @blur="newFocused = false"
        />
        <button
          type="button"
          v-if="newFocused || newPassword.length"
          class="cpw-action-icon"
          aria-label="Toggle new password visibility"
          @click="showNew = !showNew"
        >
          <svg v-if="showNew" width="20" height="20" viewBox="0 0 20 20" fill="none">
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

      <!-- Confirm password -->
      <div class="cpw-input-wrap">
        <input
          v-model="confirmPassword"
          class="cpw-input cpw-input--with-action"
          :type="showConfirm ? 'text' : 'password'"
          :placeholder="i18n('labels.confirmPassword')"
          autocomplete="new-password"
          :disabled="isSubmitting"
          @focus="confirmFocused = true"
          @blur="confirmFocused = false"
        />
        <button
          type="button"
          v-if="confirmFocused || confirmPassword.length"
          class="cpw-action-icon"
          aria-label="Toggle confirm password visibility"
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
        </button>
      </div>

      <!-- Error message -->
      <div v-if="errorMsg" class="cpw-error">{{ errorMsg }}</div>
      <div v-else-if="passwordMismatch" class="cpw-error">
        {{ i18n('errors.passwordMismatch') }}
      </div>
      <div v-else-if="passwordTooShort" class="cpw-error">
        {{ i18n('errors.passwordTooShort') }}
      </div>

      <!-- Submit button -->
      <button
        class="cpw-submit"
        type="button"
        :class="{ 'cpw-submit--disabled': !canSubmit }"
        :disabled="!canSubmit"
        @click="onSubmit"
      >
        {{ isSubmitting ? '...' : i18n('labels.submit') }}
      </button>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.cpw-action-icon {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.cpw-submit--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cpw-input::-ms-reveal,
.cpw-input::-ms-clear,
.cpw-input::-webkit-password-toggle {
  display: none;
}

.cpw-input::placeholder {
  color: var(--clr-placeholder);
  font-weight: 400;
}
</style>
