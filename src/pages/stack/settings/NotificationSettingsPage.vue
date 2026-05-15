<script setup lang="ts">
// NotificationSettingsPage — notification toggle list (Template A).

import { ref } from 'vue';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.settings.NotificationSettingsPage');

const toggles = ref([
  { key: 'push', label: i18n('labels.pushNotification'), value: true },
  { key: 'chat', label: i18n('labels.chatReminder'), value: true },
  { key: 'device', label: i18n('labels.deviceAlert'), value: true },
  { key: 'system', label: i18n('labels.systemUpdate'), value: false },
  { key: 'marketing', label: i18n('labels.marketing'), value: false },
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
