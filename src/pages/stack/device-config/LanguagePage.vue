<template>
  <q-page class="device-lang-page">
    <section class="device-lang-card">
      <div
        v-for="l in langs"
        :key="l.key"
        class="device-lang-row"
        :aria-disabled="l.locale === null ? 'true' : 'false'"
        @click="selectLang(l)"
      >
        <span>{{ i18n(`languages.${l.key}`) }}</span>
        <img class="device-lang-mark" :src="isSelected(l) ? checkIcon : radioIcon" alt="" />
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
// LanguagePage — design d4baeedf (乐宝设置-多语言).
// Single white card with three rows (中文 / English / 粤语) over the
// neutral-bg page. Card geometry, row stride, and mark icon size all come
// from the d4baeedf raw JSON — see `.device-lang-*` tokens in app.scss.
// Cantonese is presented as a locked-out option (aria-disabled) with a
// toast `comingSoon` notice, since no translation bundle ships yet.
import { useQuasar } from 'quasar';

import { useSettingsStore } from 'stores/settings';
import type { Locales } from 'stores/settings/types';
import { i18nSubPath } from 'src/utils/common';

import checkIcon from 'src/assets/lanhu/device-config/voice/icon-check.png';
import radioIcon from 'src/assets/lanhu/device-config/voice/icon-radio.png';

const i18n = i18nSubPath('pages.stack.LanguagePage');
const $q = useQuasar();
const store = useSettingsStore();

type LangKey = 'chinese' | 'english' | 'cantonese';

interface LangEntry {
  key: LangKey;
  locale: Locales | null;
}

const langs: ReadonlyArray<LangEntry> = [
  { key: 'chinese', locale: 'zh-CN' },
  { key: 'english', locale: 'en-US' },
  { key: 'cantonese', locale: null },
];

function isSelected(l: LangEntry): boolean {
  return l.locale !== null && l.locale === store.locale;
}

function selectLang(l: LangEntry) {
  if (l.locale === null) {
    $q.notify({ message: i18n('labels.comingSoon'), type: 'info' });
    return;
  }
  store.locale = l.locale;
}
</script>
