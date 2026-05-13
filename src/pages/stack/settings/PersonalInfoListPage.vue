<script setup lang="ts">
// PersonalInfoListPage — personal information collection list (Template A).

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.settings.PersonalInfoListPage');

const infoCategories = [
  { key: 'account', label: i18n('labels.accountInfo'), purpose: '账号管理与服务提供' },
  { key: 'device', label: i18n('labels.deviceInfo'), purpose: '设备连接与功能支持' },
  { key: 'voiceprint', label: i18n('labels.voiceprintInfo'), purpose: '声纹识别与个性化' },
  { key: 'usage', label: i18n('labels.usageInfo'), purpose: '服务优化与体验提升' },
];
</script>

<template>
  <q-page class="settings-sub-page">
    <div class="settings-sub-page__card">
      <div
        v-for="cat in infoCategories"
        :key="cat.key"
        class="settings-sub-page__row"
        style="flex-direction: column; align-items: flex-start; gap: 4px; padding: 14px 16px"
      >
        <span style="font-weight: 500; color: var(--clr-text)">{{ cat.label }}</span>
        <span style="font-size: 13px; color: var(--clr-weak)"
          >{{ i18n('labels.purpose') }}: {{ cat.purpose }}</span
        >
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
