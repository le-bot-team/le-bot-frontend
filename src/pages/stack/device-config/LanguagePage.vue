<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref } from 'vue';

import { i18nSubPath } from 'src/utils/common';
import { useDeviceStore } from 'stores/device';

const i18n = i18nSubPath('pages.stack.LanguagePage');
const $q = useQuasar();

const deviceStore = useDeviceStore();

const languages = [
  { key: 'chinese', value: 'zh-CN' },
  { key: 'english', value: 'en-US' },
  { key: 'cantonese', value: 'yue' },
] as const;

const selectedLang = ref(deviceStore.currentDevice?.config?.language ?? 'zh-CN');

function selectLanguage(value: string) {
  if (value === selectedLang.value) return;
  // Only zh-CN is currently supported
  if (value !== 'zh-CN') {
    $q.notify({ type: 'info', message: i18n('labels.comingSoon') });
    return;
  }
  selectedLang.value = value;
  deviceStore.updateCurrentDeviceConfig({ language: value });
}
</script>

<template>
  <q-page class="column q-pa-md q-gutter-y-md">
    <q-list bordered separator class="rounded-borders" role="listbox">
      <q-item
        v-for="lang in languages"
        :key="lang.key"
        clickable
        role="option"
        :aria-selected="selectedLang === lang.value"
        :aria-disabled="lang.value !== 'zh-CN'"
        @click="selectLanguage(lang.value)"
      >
        <q-item-section>
          <q-item-label>{{ i18n(`languages.${lang.key}`) }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon v-if="selectedLang === lang.value" name="check_circle" color="primary" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>
