<script setup lang="ts">
// AuthPage — Container page for the full auth flow:
// login/signup -> password setup (if needed) -> profile setup (required, no skip) -> add virtual device.
// Page background uses the shared auth gradient (--gradient-page-bg).

import { ref } from 'vue';

import NewPasswordPanel from 'components/auth/NewPasswordPanel.vue';
import SetupProfilePanel from 'components/auth/SetupProfilePanel.vue';
import SignInOrSignUpPanel from 'components/auth/SignInOrSignUpPanel.vue';
import { router } from 'src/router';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.main.AuthPage');

const avatar = ref<string>('');
const email = ref<string>('');
const isNew = ref<boolean>(false);
const panelIndex = ref<number>(0);
const skippedPassword = ref<boolean>(false);

function onProfileFinish() {
  // After profile setup, navigate to the onboarding complete guide page
  // where user can choose: add a virtual device OR scan to join an existing family group
  void router.replace({ name: 'onboarding-complete' });
}

function goBack() {
  if (panelIndex.value === 2 && skippedPassword.value) {
    panelIndex.value = 0;
  } else if (panelIndex.value > 0) {
    panelIndex.value--;
  }
}
</script>

<template>
  <q-page class="auth-page">
    <div class="auth-container" :class="{ 'auth-container--sub': panelIndex > 1 }">
      <!-- Back arrow: visible on sub-pages (password setup, profile setup) -->
      <div
        v-if="panelIndex === 1 || panelIndex === 2"
        class="auth-back"
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
      </div>

      <!-- Logo: shown on entry page and password setup page -->
      <div v-if="panelIndex <= 1" class="auth-logo">
        <q-img v-if="avatar" :src="avatar" class="logo-img" />
        <div v-else class="logo-placeholder">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="60" fill="#F0F8FF" />
            <text
              x="60"
              y="65"
              text-anchor="middle"
              font-size="28"
              font-weight="600"
              fill="#20CCF9"
            >
              Logo
            </text>
          </svg>
        </div>
      </div>

      <!-- Slogan: shown on entry page and password setup page (smaller on password page per design spec) -->
      <div
        v-if="panelIndex <= 1"
        class="auth-slogan"
        :class="{ 'auth-slogan--sm': panelIndex === 1 }"
      >
        {{ i18n('labels.description') }}
      </div>

      <!-- Sub-page title: centered title bar for non-entry pages -->
      <div v-if="panelIndex === 2" class="auth-title">{{ i18n('labels.profileSetupTitle') }}</div>

      <q-tab-panels class="full-width bg-transparent" v-model="panelIndex">
        <sign-in-or-sign-up-panel
          :name="0"
          @next="
            (_isNew, _email, _code, needsPassword) => {
              isNew = _isNew;
              email = _email;
              skippedPassword = !needsPassword;
              panelIndex = needsPassword ? 1 : 2;
            }
          "
        />
        <new-password-panel
          :email="email"
          :is-new="isNew"
          :name="1"
          @next="panelIndex = 2"
          @previous="panelIndex = 0"
        />
        <setup-profile-panel :name="2" @finish="onProfileFinish" @previous="panelIndex = 1" />
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
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

// Logo: 容器 2633@1x, 120×120 in all entry-page designs
.auth-logo {
  width: var(--logo-size);
  height: var(--logo-size);
  margin-bottom: 8px;
}

.logo-img,
.logo-placeholder {
  width: var(--logo-size);
  height: var(--logo-size);
  border-radius: 50%;
  overflow: hidden;
}

.logo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
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
</style>
