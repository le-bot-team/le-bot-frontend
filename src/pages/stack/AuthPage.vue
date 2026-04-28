<script setup lang="ts">
import { ref } from 'vue';

import FinishPanel from 'components/auth/FinishPanel.vue';
import NewPasswordPanel from 'components/auth/NewPasswordPanel.vue';
import SetupProfilePanel from 'components/auth/SetupProfilePanel.vue';
import SignInOrSignUpPanel from 'components/auth/SignInOrSignUpPanel.vue';

const avatar = ref<string>('');
const email = ref<string>('');
const isNew = ref<boolean>(false);
const panelIndex = ref<number>(0);
</script>

<template>
  <q-page class="auth-page">
    <div class="auth-container" :class="{ 'auth-container--sub': panelIndex > 1 }">
      <!-- Back arrow: visible on sub-pages (password setup, profile setup) -->
      <div
        v-if="panelIndex === 1 || panelIndex === 2"
        class="auth-back"
        @click="panelIndex > 0 ? panelIndex-- : null"
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
        您的智宠好伙伴
      </div>

      <!-- Sub-page title: centered title bar for non-entry pages -->
      <div v-if="panelIndex === 2" class="auth-title">完善个人信息</div>

      <q-tab-panels class="full-width bg-transparent" v-model="panelIndex">
        <sign-in-or-sign-up-panel
          :name="0"
          @finish="panelIndex = 3"
          @next="
            (_isNew, _email) => {
              isNew = _isNew;
              email = _email;
              panelIndex = 1;
            }
          "
        />
        <new-password-panel
          :email="email"
          :is-new="isNew"
          :name="1"
          @finish="panelIndex = 3"
          @next="panelIndex = 2"
          @previous="panelIndex = 0"
        />
        <setup-profile-panel :name="2" @finish="panelIndex = 3" @previous="panelIndex = 1" />
        <finish-panel :is-new="isNew" :name="3" :nickname="email" />
      </q-tab-panels>
    </div>
  </q-page>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    180deg,
    rgba(216, 244, 255, 1) 0%,
    rgba(225, 255, 242, 1) 20.7%,
    rgba(253, 255, 224, 1) 54.6%,
    rgba(255, 255, 255, 1) 100%
  );
  font-family: 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

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

/* When on profile setup page (panelIndex > 1), reduce padding since no logo/slogan */
.auth-container--sub {
  padding-top: 44px;
}

/* Back arrow: positioned top-left, matching design spec (~9×16px) */
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
  color: var(--clr-text, rgba(21, 23, 23, 1));
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

/* Logo: 120x120px, matching design */
.auth-logo {
  width: 120px;
  height: 120px;
  margin-bottom: 8px;
}
.logo-img,
.logo-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
}
.logo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Slogan - entry page and password setup page */
.auth-slogan {
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  color: rgba(18, 14, 44, 1);
  text-align: center;
  margin-bottom: 48px;
  letter-spacing: 0;
}

/* Slogan on password setup page - smaller per design spec (登录页-注册) */
.auth-slogan--sm {
  font-size: 15px;
  line-height: 22px;
  color: rgba(21, 23, 23, 1);
  margin-bottom: 32px;
}

/* Sub-page centered title (e.g. 完善个人信息) */
.auth-title {
  width: 100%;
  text-align: center;
  font-family: 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 17px;
  font-weight: 500;
  line-height: 24px;
  color: rgba(21, 23, 23, 1);
  margin-bottom: 0;
  padding: 10px 0;
}

/* Override q-tab-panels */
.auth-container :deep(.q-tab-panels) {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
