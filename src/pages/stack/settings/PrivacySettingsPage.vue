<script setup lang="ts">
// PrivacySettingsPage — privacy toggle list (Template A).

import { ref } from 'vue';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.settings.PrivacySettingsPage');

const toggles = ref([
  { key: 'dataCollection', labelKey: 'dataCollection', value: true },
  { key: 'usageAnalysis', labelKey: 'usageAnalysis', value: true },
  { key: 'personalizedAds', labelKey: 'personalizedAds', value: false },
]);
</script>

<template>
  <q-page class="settings-sub-page">
    <div class="settings-sub-page__card">
      <div v-for="item in toggles" :key="item.key" class="settings-sub-page__row">
        <span class="settings-sub-page__row-label">{{ i18n('labels.' + item.labelKey) }}</span>
        <q-toggle v-model="item.value" color="cyan" dense />
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
