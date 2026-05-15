<script setup lang="ts">
// GeneralSettingsPage — general settings toggle list (Template A).

import { ref } from 'vue';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.settings.GeneralSettingsPage');

const toggles = ref([
  { key: 'darkMode', label: i18n('labels.darkMode'), value: false },
  { key: 'autoPlay', label: i18n('labels.autoPlay'), value: true },
  { key: 'wifiOnly', label: i18n('labels.downloadWifiOnly'), value: false },
]);
</script>

<template>
  <q-page class="settings-sub-page">
    <div class="settings-sub-page__card">
      <div v-for="item in toggles" :key="item.key" class="settings-sub-page__row">
        <span class="settings-sub-page__row-label">{{ item.label }}</span>
        <q-toggle v-model="item.value" color="cyan" dense />
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
