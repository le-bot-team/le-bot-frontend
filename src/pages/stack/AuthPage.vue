<script setup lang="ts">
// AuthPage — Container page for the full auth flow:
// Panel 0: SignInOrSignUpPanel (email + privacy check → route by isNew)
// Panel 1: NewPasswordPanel (registration: code + password setup)
// Panel 2: SetupProfilePanel (profile setup for new users)
// Panel 3: SignInPanel (login for existing users: password or code)
// Page background uses the shared auth gradient (--gradient-page-bg).

import { ref } from 'vue';
import { useRoute } from 'vue-router';

import appLogo from 'src/assets/logo.png';
import NewPasswordPanel from 'components/auth/NewPasswordPanel.vue';
import SetupProfilePanel from 'components/auth/SetupProfilePanel.vue';
import SignInOrSignUpPanel from 'components/auth/SignInOrSignUpPanel.vue';
import SignInPanel from 'components/auth/SignInPanel.vue';
import { router } from 'src/router';
import { retrieveProfile } from 'src/utils/account';
import { retrieveDevices } from 'src/utils/device';
import { i18nSubPath } from 'src/utils/common';
import { useDeviceStore } from 'stores/device';
import { useProfileStore } from 'stores/profile';

const i18n = i18nSubPath('pages.main.AuthPage');

const route = useRoute();

const email = ref<string>('');
const isFinishing = ref<boolean>(false);
const isNew = ref<boolean>(false);
const panelIndex = ref<number>(0);

function onProfileFinish() {
  // After profile setup, navigate to the onboarding complete guide page
  // where user can choose: add a virtual device OR scan to join an existing family group
  void router.replace({ name: 'onboarding-complete' });
}

async function onDirectFinish() {
  // Existing user with password: load data and navigate directly to home
  isFinishing.value = true;
  try {
    const deviceStore = useDeviceStore();
    const profileStore = useProfileStore();
    deviceStore.updateDevices(await retrieveDevices());
    profileStore.updateProfile(await retrieveProfile());
  } catch (error) {
    console.warn('Failed to load user data on direct login', error);
  }
  await router
    .replace(typeof route.query.from === 'string' ? route.query.from : '/')
    .catch((error) => console.warn(error));
}

function goBack() {
  // Panel 1 (registration) and 3 (login) go back to panel 0
  // Panel 2 (profile setup) goes back to panel 0 (skipping registration)
  if (panelIndex.value > 0) {
    panelIndex.value = 0;
  }
}
</script>

<template>
  <q-page class="auth-page">
    <!-- Finishing overlay: shown while loading user data on direct login -->
    <div v-if="isFinishing" class="auth-finishing-overlay">
      <div class="auth-finishing-content">
        <q-spinner size="48px" color="primary" />
        <span class="auth-finishing-text">{{ i18n('labels.finishing') }}</span>
      </div>
    </div>
    <div class="auth-container" :class="{ 'auth-container--sub': panelIndex > 1 }">
      <!-- Back arrow: visible on all sub-pages (1, 2, 3) -->
      <button
        v-if="panelIndex >= 1"
        type="button"
        class="auth-back"
        :aria-label="i18n('labels.goBack')"
        @click="goBack"
      >
        <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
          <path
            d="M8 1L1 8L8 15"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <!-- Logo: shown on entry page and registration page -->
      <div v-if="panelIndex <= 1" class="auth-logo">
        <q-img :src="appLogo" class="logo-img" />
      </div>

      <!-- Slogan: shown on entry page and registration page -->
      <div
        v-if="panelIndex <= 1"
        class="auth-slogan"
      >
        {{ i18n('labels.description') }}
      </div>

      <!-- Sub-page title: centered title bar for non-entry pages -->
      <div v-if="panelIndex === 2" class="auth-title">{{ i18n('labels.profileSetupTitle') }}</div>

      <q-tab-panels class="full-width bg-transparent" v-model="panelIndex">
        <sign-in-or-sign-up-panel
          :name="0"
          @next="
            (_isNew, _email) => {
              isNew = _isNew;
              email = _email;
              panelIndex = _isNew ? 1 : 3;
            }
          "
          @finish="onDirectFinish"
        />
        <new-password-panel
          :email="email"
          :is-new="isNew"
          :name="1"
          @next="panelIndex = 2"
          @previous="panelIndex = 0"
        />
        <setup-profile-panel :name="2" @finish="onProfileFinish" @previous="goBack" />
        <sign-in-panel
          :email="email"
          :name="3"
          @finish="onDirectFinish"
          @previous="panelIndex = 0"
        />
      </q-tab-panels>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
// AuthPage — designs 72b3b33f / 4a4704cc / 883b0908 / 2d090f70
// Page-level layout; `.auth-page` base styles come from app.scss global.

.auth-container {
  width: 375px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120px;
  box-sizing: border-box;
  position: relative;
}

.auth-container--sub {
  padding-top: 44px;
}

// Back arrow (9×16 path, design 路径 element in all 4 artboards)
.auth-back {
  position: absolute;
  top: 64px;
  left: 32px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--clr-text);
  background: transparent;
  border: none;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

// Logo: 容器 2633@1x, 120×120 in all entry-page designs
.auth-logo {
  width: var(--logo-size);
  height: var(--logo-size);
  margin-bottom: 8px;
}

.logo-img {
  width: var(--logo-size);
  height: var(--logo-size);
  overflow: hidden;
}

// Slogan: entry page (72b3b33f) — 20px/28px, deep purple rgba(18,14,44,1)
.auth-slogan {
  font-size: var(--font-size-slogan-entry);
  font-weight: 500;
  line-height: 28px;
  color: var(--clr-slogan-entry);
  text-align: center;
  margin-bottom: 48px;
  letter-spacing: 0;
}

// Slogan on registration page (2d090f70/883b0908/4a4704cc) — 15px/22px, text color
.auth-slogan--sm {
  font-size: var(--font-size-slogan);
  line-height: var(--line-height-body);
  color: var(--clr-text);
  margin-bottom: 32px;
}

// Sub-page centered title (e.g. 完善个人信息, design ed71eb82)
.auth-title {
  width: 100%;
  text-align: center;
  font-family: var(--font-family);
  font-size: 17px;
  font-weight: 500;
  line-height: 24px;
  color: var(--clr-text);
  margin-bottom: 0;
  padding: 10px 0;
}

// Override q-tab-panels
.auth-container :deep(.q-tab-panels) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

// Finishing overlay
.auth-finishing-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
}

.auth-finishing-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.auth-finishing-text {
  font-family: var(--font-family);
  font-size: var(--font-size-body, 15px);
  font-weight: 400;
  color: var(--clr-weak);
  text-align: center;
}
</style>
