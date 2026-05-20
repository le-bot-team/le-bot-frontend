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
      <button
        v-for="lang in languages"
        :key="lang.value"
        type="button"
        class="settings-sub-page__row"
        @click="locale = lang.value"
      >
        <span class="settings-sub-page__row-label">{{ i18n('languages.' + lang.labelKey) }}</span>
        <q-radio v-model="locale" :val="lang.value" color="cyan" dense />
      </button>
    </div>
  </q-page>
</template>

<style scoped></style>
