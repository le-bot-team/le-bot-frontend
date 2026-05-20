<script setup lang="ts">
// AppLanguagePage — app UI language selection (Template C: RadioList).

import { storeToRefs } from 'pinia';

import { i18nSubPath } from 'src/utils/common';
import { useSettingsStore } from 'stores/settings';
import type { Locales } from 'stores/settings/types';

const i18n = i18nSubPath('pages.stack.settings.AppLanguagePage');
const { locale } = storeToRefs(useSettingsStore());

const languages: { value: Locales; labelKey: string }[] = [
  { value: 'zh-CN', labelKey: 'zhCN' },
  { value: 'en-US', labelKey: 'enUS' },
];
</script>

<template>
  <q-page class="settings-sub-page">
    <div class="settings-sub-page__card">
      <div
        v-for="lang in languages"
        :key="lang.value"
        class="settings-sub-page__row"
        style="cursor: pointer"
        @click="locale = lang.value"
      >
        <span class="settings-sub-page__row-label">{{ i18n('languages.' + lang.labelKey) }}</span>
        <q-radio v-model="locale" :val="lang.value" color="cyan" dense />
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
