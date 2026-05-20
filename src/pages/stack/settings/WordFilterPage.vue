<script setup lang="ts">
// WordFilterPage — sensitive word filter management (Template A).

import { ref } from 'vue';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.settings.WordFilterPage');

const enabled = ref(true);
const words = ref<string[]>([]);
const newWord = ref('');

function addWord() {
  const w = newWord.value.trim();
  if (w && !words.value.includes(w)) {
    words.value.push(w);
    newWord.value = '';
  }
}

function removeWord(index: number) {
  words.value.splice(index, 1);
}
</script>

<template>
  <q-page class="settings-sub-page">
    <div class="settings-sub-page__card">
      <div class="settings-sub-page__row">
        <span class="settings-sub-page__row-label">{{ i18n('labels.enable') }}</span>
        <q-toggle v-model="enabled" color="cyan" dense />
      </div>
    </div>

    <div v-if="enabled" class="q-mt-md">
      <div class="growth-section-title">{{ i18n('labels.addWord') }}</div>
      <div class="settings-sub-page__card q-pa-md">
        <div class="row q-gutter-x-sm q-mb-md">
          <q-input v-model="newWord" :placeholder="i18n('labels.wordPlaceholder')" outlined dense style="flex: 1" />
          <q-btn color="cyan" :label="i18n('labels.addWord')" dense no-caps @click="addWord" />
        </div>
        <div v-if="words.length" class="row q-gutter-x-sm q-gutter-y-sm" style="flex-wrap: wrap">
          <q-chip v-for="(word, index) in words" :key="word" removable @remove="removeWord(index)" style="background: var(--clr-chat-history-search-bg)">
            {{ word }}
          </q-chip>
        </div>
        <div v-else style="color: var(--clr-caption); font-size: 14px; text-align: center; padding: 16px 0">
          {{ i18n('labels.empty') }}
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
