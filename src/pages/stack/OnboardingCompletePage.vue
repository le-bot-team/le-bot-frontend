<script setup lang="ts">
/**
 * OnboardingCompletePage — 注册完成引导页
 *
 * 用户完成个人信息设置后，提供两个入口：
 *   A) 添加虚拟乐宝设备（创建新家庭组）
 *   B) 扫码加入已有家庭组
 */

import { useQuasar } from 'quasar';

import { router } from 'src/router';
import { i18nSubPath } from 'src/utils/common';
import boyAvatarUrl from 'src/assets/lanhu/child-edit/boy-avatar.png';

const i18n = i18nSubPath('pages.stack.OnboardingCompletePage');
const $q = useQuasar();

function goAddDevice() {
  void router.replace('/stack/add-virtual-device');
}

function goScanJoin() {
  // TODO: 接入扫码功能后跳转到 JoinConfirmDialog 或扫码中间页
  $q.notify({ message: i18n('notifications.scanComingSoon'), type: 'info' });
}
</script>

<template>
  <q-page class="onboarding-complete-page">
    <!-- 插画区域 -->
    <div class="onboarding-illustration">
      <img :src="boyAvatarUrl" alt="lebot" class="onboarding-illustration-img" />
    </div>

    <!-- 标题区 -->
    <p class="onboarding-title">{{ i18n('labels.title') }}</p>
    <p class="onboarding-subtitle">{{ i18n('labels.subtitle') }}</p>

    <!-- 选项卡片区 -->
    <div class="onboarding-options">
      <!-- 选项 A: 添加虚拟乐宝 -->
      <button type="button" class="onboarding-option-card" @click="goAddDevice">
        <div class="option-icon option-icon--add">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#20CCF9" stroke-width="2" />
            <path d="M12 8v8M8 12h8" stroke="#20CCF9" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <div class="option-text">
          <span class="option-title">{{ i18n('options.addDevice.title') }}</span>
          <span class="option-desc">{{ i18n('options.addDevice.description') }}</span>
        </div>
        <q-icon name="chevron_right" size="20px" color="#C4C4CC" />
      </button>

      <!-- 选项 B: 扫码加入家庭组 -->
      <button type="button" class="onboarding-option-card" @click="goScanJoin">
        <div class="option-icon option-icon--qr">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#20CCF9" stroke-width="2" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#20CCF9" stroke-width="2" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#20CCF9" stroke-width="2" />
            <rect x="14" y="14" width="3" height="3" rx="0.5" fill="#20CCF9" />
            <rect x="19" y="14" width="2" height="2" rx="0.5" fill="#20CCF9" />
            <rect x="14" y="19" width="2" height="2" rx="0.5" fill="#20CCF9" />
            <rect x="19" y="19" width="2" height="2" rx="0.5" fill="#20CCF9" />
          </svg>
        </div>
        <div class="option-text">
          <span class="option-title">{{ i18n('options.scanJoin.title') }}</span>
          <span class="option-desc">{{ i18n('options.scanJoin.description') }}</span>
        </div>
        <q-icon name="chevron_right" size="20px" color="#C4C4CC" />
      </button>
    </div>

    <!-- 底部提示 -->
    <p class="onboarding-footer-hint">{{ i18n('labels.footerHint') }}</p>
  </q-page>
</template>

<style scoped lang="scss">
.onboarding-complete-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 60px;
  min-height: 100vh;
  box-sizing: border-box;
}

// ── 插画 ──
.onboarding-illustration {
  margin-bottom: 28px;
}

.onboarding-illustration-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

// ── 标题 ──
.onboarding-title {
  font-family: var(--font-family);
  font-size: 22px;
  font-weight: 600;
  color: var(--clr-text-primary);
  text-align: center;
  margin: 0 0 6px;
}

.onboarding-subtitle {
  font-family: var(--font-family);
  font-size: 14px;
  color: var(--clr-caption);
  text-align: center;
  margin: 0 0 40px;
}

// ── 选项卡片 ──
.onboarding-options {
  width: var(--btn-width, 311px);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.onboarding-option-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: var(--clr-white);
  border: 1.5px solid rgba(200, 200, 210, 0.3);
  border-radius: 16px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover,
  &:active {
    border-color: #20CCF9;
    box-shadow: 0 2px 12px rgba(32, 204, 249, 0.1);
  }
}

.option-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  &--add {
    background: rgba(32, 204, 249, 0.08);
  }

  &--qr {
    background: rgba(32, 204, 249, 0.08);
  }
}

.option-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.option-title {
  font-family: var(--font-family);
  font-size: 16px;
  font-weight: 500;
  color: var(--clr-text-primary);
}

.option-desc {
  font-family: var(--font-family);
  font-size: 13px;
  color: var(--clr-caption);
  line-height: 1.4;
}

// ── 底部提示 ──
.onboarding-footer-hint {
  margin-top: auto;
  padding-bottom: 40px;
  font-family: var(--font-family);
  font-size: 13px;
  color: #BDBDBD;
  text-align: center;
}
</style>
