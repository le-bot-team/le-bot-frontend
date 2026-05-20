<script setup lang="ts">
// OnboardingCompletePage — Post-registration landing page.
// User can choose: add a virtual device OR scan to join an existing family group.
import { useQuasar } from 'quasar';

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.OnboardingCompletePage');
const { notify } = useQuasar();

const scanJoin = () => {
  notify({ type: 'info', message: i18n('notifications.scanComingSoon') });
};
</script>

<template>
  <q-page class="onboarding-complete-page">
    <div class="onboarding-complete-container">
      <div class="onboarding-complete-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="32" fill="#E8F9EE" />
          <path
            d="M20 32L28 40L44 24"
            stroke="#34C759"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h2 class="onboarding-complete-title">{{ i18n('labels.title') }}</h2>
      <p class="onboarding-complete-desc">{{ i18n('labels.subtitle') }}</p>

      <div class="onboarding-complete-actions">
        <button class="auth-btn-primary" @click="$router.replace({ name: 'home' })">
          {{ i18n('options.addDevice.title') }}
        </button>
        <button class="auth-btn-weak" @click="scanJoin">
          {{ i18n('options.scanJoin.title') }}
        </button>
      </div>

      <p class="onboarding-complete-footer">{{ i18n('labels.footerHint') }}</p>
    </div>
  </q-page>
</template>

<style scoped>
.onboarding-complete-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.onboarding-complete-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  max-width: 375px;
  width: 100%;
}

.onboarding-complete-icon {
  margin-bottom: 24px;
}

.onboarding-complete-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--clr-text, #120e2c);
  margin: 0 0 8px;
}

.onboarding-complete-desc {
  font-size: 15px;
  color: var(--clr-text-secondary, #9398a9);
  margin: 0 0 40px;
}

.onboarding-complete-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.onboarding-complete-footer {
  font-size: 13px;
  color: var(--clr-text-secondary, #9398a9);
  margin: 16px 0 0;
  text-align: center;
}
</style>
