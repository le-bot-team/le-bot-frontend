<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { i18nSubPath } from 'src/utils/common';
import {
  phoneChallenge,
  verifyPhoneCode,
  changePhone,
} from 'src/utils/api/profile';
import { useAuthStore } from 'stores/auth';
import { useProfileStore } from 'stores/profile';

const i18n = i18nSubPath('pages.stack.ChangePhonePage');

const router = useRouter();
const $q = useQuasar();

const authStore = useAuthStore();
const { accessToken } = storeToRefs(authStore);

const profileStore = useProfileStore();
const { profile } = storeToRefs(profileStore);
const { updateProfile } = profileStore;

// ── Step management ──
type Step = 'verifyOld' | 'bindNew';
const step = ref<Step>(profile.value?.phone ? 'verifyOld' : 'bindNew');
// Track whether user has manually progressed past step 1
const userAdvanced = ref(false);

// Keep step in sync with profile phone state (handles async profile load)
watch(
  () => profile.value?.phone,
  (phone) => {
    if (userAdvanced.value) return;
    step.value = phone ? 'verifyOld' : 'bindNew';
  },
);

// ── Shared state ──
const isSubmitting = ref(false);
const errorMsg = ref('');

// ── Step 1: Verify old phone ──
const oldCode = ref('');
const oldCodeSent = ref(false);
const oldCodeSending = ref(false);
const oldCountdown = ref(0);
let oldCountdownTimer: ReturnType<typeof setInterval> | null = null;

const currentPhone = computed(() => profile.value?.phone ?? '');
const maskedPhone = computed(() => {
  const p = currentPhone.value;
  if (p.length >= 7) return p.slice(0, 3) + '****' + p.slice(-4);
  return p;
});

const canSendOldCode = computed(
  () => !!accessToken.value && !!currentPhone.value && !oldCodeSending.value && oldCountdown.value === 0,
);

const oldSendCodeLabel = computed(() => {
  if (oldCodeSending.value) return i18n('labels.sending');
  if (oldCountdown.value > 0)
    return i18n('labels.resendCooldown', { seconds: oldCountdown.value });
  if (oldCodeSent.value) return i18n('labels.resend');
  return i18n('labels.sendCode');
});

const canVerifyOld = computed(
  () => !!accessToken.value && !isSubmitting.value && !!currentPhone.value && oldCode.value.length >= 4,
);

const startOldCountdown = () => {
  oldCountdown.value = 60;
  if (oldCountdownTimer) clearInterval(oldCountdownTimer);
  oldCountdownTimer = setInterval(() => {
    oldCountdown.value--;
    if (oldCountdown.value <= 0) {
      oldCountdown.value = 0;
      if (oldCountdownTimer) {
        clearInterval(oldCountdownTimer);
        oldCountdownTimer = null;
      }
    }
  }, 1000);
};

const onSendOldCode = async () => {
  if (!canSendOldCode.value) return;
  const token = accessToken.value;
  if (!token || !currentPhone.value) return;

  oldCodeSending.value = true;
  errorMsg.value = '';
  try {
    const { data } = await phoneChallenge(token, currentPhone.value);
    if (data.success) {
      oldCodeSent.value = true;
      startOldCountdown();
      $q.notify({ type: 'positive', message: i18n('notifications.codeSent') });
    } else {
      $q.notify({
        type: 'warning',
        message: data.message || i18n('notifications.sendCodeFailed'),
      });
    }
  } catch {
    $q.notify({ type: 'negative', message: i18n('notifications.sendCodeError') });
  } finally {
    oldCodeSending.value = false;
  }
};

const onVerifyOld = async () => {
  if (!canVerifyOld.value) return;
  const token = accessToken.value;
  if (!token || !currentPhone.value) return;

  isSubmitting.value = true;
  errorMsg.value = '';
  try {
    const { data } = await verifyPhoneCode(token, currentPhone.value, oldCode.value);
    if (data.success) {
      userAdvanced.value = true;
      step.value = 'bindNew';
    } else {
      errorMsg.value = data.message || i18n('errors.invalidCode');
    }
  } catch {
    errorMsg.value = i18n('errors.verifyFailed');
  } finally {
    isSubmitting.value = false;
  }
};

// ── Step 2: Bind new phone ──
const newPhone = ref('');
const newCode = ref('');
const newCodeSent = ref(false);
const newCodeSending = ref(false);
const newCountdown = ref(0);
let newCountdownTimer: ReturnType<typeof setInterval> | null = null;

const phoneRegex = /^1[3-9]\d{9}$/;
const isValidNewPhone = computed(() => phoneRegex.test(newPhone.value));

const canSendNewCode = computed(
  () => !!accessToken.value && isValidNewPhone.value && !newCodeSending.value && newCountdown.value === 0,
);

const newSendCodeLabel = computed(() => {
  if (newCodeSending.value) return i18n('labels.sending');
  if (newCountdown.value > 0)
    return i18n('labels.resendCooldown', { seconds: newCountdown.value });
  if (newCodeSent.value) return i18n('labels.resend');
  return i18n('labels.sendCode');
});

const canSubmitNew = computed(
  () =>
    !!accessToken.value &&
    !isSubmitting.value &&
    isValidNewPhone.value &&
    newCode.value.length >= 4,
);

const startNewCountdown = () => {
  newCountdown.value = 60;
  if (newCountdownTimer) clearInterval(newCountdownTimer);
  newCountdownTimer = setInterval(() => {
    newCountdown.value--;
    if (newCountdown.value <= 0) {
      newCountdown.value = 0;
      if (newCountdownTimer) {
        clearInterval(newCountdownTimer);
        newCountdownTimer = null;
      }
    }
  }, 1000);
};

const onSendNewCode = async () => {
  if (!canSendNewCode.value) return;
  const token = accessToken.value;
  if (!token || !newPhone.value) return;

  newCodeSending.value = true;
  errorMsg.value = '';
  try {
    const { data } = await phoneChallenge(token, newPhone.value);
    if (data.success) {
      newCodeSent.value = true;
      startNewCountdown();
      $q.notify({ type: 'positive', message: i18n('notifications.codeSent') });
    } else {
      $q.notify({
        type: 'warning',
        message: data.message || i18n('notifications.sendCodeFailed'),
      });
    }
  } catch {
    $q.notify({ type: 'negative', message: i18n('notifications.sendCodeError') });
  } finally {
    newCodeSending.value = false;
  }
};

const onSubmitNew = async () => {
  if (!canSubmitNew.value) return;
  const token = accessToken.value;
  if (!token) return;

  isSubmitting.value = true;
  errorMsg.value = '';
  try {
    const { data } = await changePhone(token, {
      phone: newPhone.value,
      code: newCode.value,
    });
    if (data.success) {
      // Update local profile
      if (profile.value) {
        updateProfile({ ...profile.value, phone: newPhone.value });
      }
      $q.notify({ type: 'positive', message: i18n('notifications.success') });
      router.back();
    } else {
      errorMsg.value = data.message || i18n('errors.submitFailed');
    }
  } catch {
    errorMsg.value = i18n('errors.submitFailed');
  } finally {
    isSubmitting.value = false;
  }
};

// Clear error on input change
watch([oldCode, newPhone, newCode], () => {
  errorMsg.value = '';
});

// Cleanup timers on unmount
onBeforeUnmount(() => {
  if (oldCountdownTimer) {
    clearInterval(oldCountdownTimer);
    oldCountdownTimer = null;
  }
  if (newCountdownTimer) {
    clearInterval(newCountdownTimer);
    newCountdownTimer = null;
  }
});
</script>

<template>
  <q-page class="change-phone-page">
    <div class="cph-container">
      <!-- Step 1: Verify old phone -->
      <template v-if="step === 'verifyOld'">
        <!-- Current phone (read-only) -->
        <div class="cph-input-wrap">
          <input
            class="cph-input"
            :value="maskedPhone"
            readonly
            :placeholder="i18n('labels.noPhone')"
          />
        </div>

        <!-- Old phone verification code -->
        <div class="cph-code-row">
          <div class="cph-input-wrap cph-input-wrap--code">
            <input
              v-model="oldCode"
              class="cph-input"
              :placeholder="i18n('labels.codePlaceholder')"
              maxlength="6"
              autocomplete="one-time-code"
              :disabled="isSubmitting"
            />
          </div>
          <div class="cph-input-wrap cph-input-wrap--action">
            <button
              type="button"
              class="cph-action-link"
              :class="{ 'cph-action-link--disabled': !canSendOldCode }"
              :disabled="!canSendOldCode"
              @click="onSendOldCode"
            >
              {{ oldSendCodeLabel }}
            </button>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="errorMsg" class="cph-error">{{ errorMsg }}</div>

        <!-- Verify old phone button -->
        <button
          class="cph-submit"
          type="button"
          :class="{ 'cph-submit--disabled': !canVerifyOld }"
          :disabled="!canVerifyOld"
          @click="onVerifyOld"
        >
          {{ isSubmitting ? i18n('labels.verifying') : i18n('labels.verifyOld') }}
        </button>
      </template>

      <!-- Step 2: Bind new phone -->
      <template v-else>
        <!-- New phone input -->
        <div class="cph-input-wrap">
          <input
            v-model="newPhone"
            class="cph-input"
            type="tel"
            :placeholder="i18n('labels.newPhonePlaceholder')"
            maxlength="11"
            :disabled="isSubmitting"
          />
        </div>

        <!-- New phone verification code -->
        <div class="cph-code-row">
          <div class="cph-input-wrap cph-input-wrap--code">
            <input
              v-model="newCode"
              class="cph-input"
              :placeholder="i18n('labels.codePlaceholder')"
              maxlength="6"
              autocomplete="one-time-code"
              :disabled="isSubmitting"
            />
          </div>
          <div class="cph-input-wrap cph-input-wrap--action">
            <button
              type="button"
              class="cph-action-link"
              :class="{ 'cph-action-link--disabled': !canSendNewCode }"
              :disabled="!canSendNewCode"
              @click="onSendNewCode"
            >
              {{ newSendCodeLabel }}
            </button>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="errorMsg" class="cph-error">{{ errorMsg }}</div>

        <!-- Submit new phone button -->
        <button
          class="cph-submit"
          type="button"
          :class="{ 'cph-submit--disabled': !canSubmitNew }"
          :disabled="!canSubmitNew"
          @click="onSubmitNew"
        >
          {{ isSubmitting ? i18n('labels.submitting') : i18n('labels.submitNew') }}
        </button>
      </template>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.cph-container {
  width: 311px;
  margin: 0 auto;
  padding-top: 24px;
}

.cph-input-wrap {
  width: 100%;
  height: 48px;
  border: 1px solid rgba(147, 152, 169, 0.2);
  border-radius: 8px;
  background: var(--clr-card-bg);
  display: flex;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
  transition: border-color 0.2s;
  margin-bottom: 12px;

  &:focus-within {
    border-color: var(--clr-link);
  }
}

.cph-input {
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

  &::placeholder {
    font-weight: 400;
    color: var(--clr-placeholder);
  }

  &:read-only {
    font-weight: 500;
  }
}

// Code row: two boxes side-by-side (design: 矩形 2017 172px + 矩形 2014 127px)
.cph-code-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.cph-input-wrap--code {
  width: 172px;
  margin-bottom: 0;
}

.cph-input-wrap--action {
  width: 127px;
  margin-bottom: 0;
  justify-content: center;
}

// Action link (Send Verification Code) — design: rgba(32,204,249,1), Regular 15px
.cph-action-link {
  background: none;
  border: none;
  padding: 0;
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 400;
  line-height: 22px;
  color: rgba(32, 204, 249, 1);
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  text-align: center;

  &--disabled {
    color: var(--clr-placeholder);
    cursor: not-allowed;
  }
}

// Error message — design: rgba(255,93,93,1), Regular 16px
.cph-error {
  font-family: var(--font-family);
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  color: rgba(255, 93, 93, 1);
  margin-bottom: 12px;
}

// Submit button — design: 311×56, radius 28, rgba(18,14,44,1), disabled opacity 50%
.cph-submit {
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 28px;
  background: rgba(18, 14, 44, 1);
  color: #fff;
  font-family: var(--font-family);
  font-size: 17px;
  font-weight: 500;
  line-height: 24px;
  cursor: pointer;
  margin-top: 24px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
