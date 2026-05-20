<script setup lang="ts">
// PersonalInfoListPage — personal information collection list (Template A).

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.settings.PersonalInfoListPage');

const infoCategories = [
  { key: 'account', labelKey: 'accountInfo', purposeKey: 'account' },
  { key: 'device', labelKey: 'deviceInfo', purposeKey: 'device' },
  { key: 'voiceprint', labelKey: 'voiceprintInfo', purposeKey: 'voiceprint' },
  { key: 'usage', labelKey: 'usageInfo', purposeKey: 'usage' },
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
        <span style="font-weight: 500; color: var(--clr-text)">{{ i18n('labels.' + cat.labelKey) }}</span>
        <span style="font-size: 13px; color: var(--clr-weak)"
          >{{ i18n('labels.purpose') }}: {{ i18n('purposes.' + cat.purposeKey) }}</span
        >
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
