<script setup lang="ts">
// AppLanguagePage — app UI language selection (Template C: RadioList).

import { ref } from 'vue';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.settings.AppLanguagePage');

const selectedLang = ref('zh-CN');
const languages = [
  { value: 'zh-CN', label: i18n('languages.zhCN') },
  { value: 'en-US', label: i18n('languages.enUS') },
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
        @click="selectedLang = lang.value"
      >
        <span class="settings-sub-page__row-label">{{ lang.label }}</span>
        <q-radio v-model="selectedLang" :val="lang.value" color="cyan" dense />
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
