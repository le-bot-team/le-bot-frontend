<script setup lang="ts">
// FaqPage — FAQ page with category tabs and expandable panels.

import { ref, computed } from 'vue';

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.help.FaqPage');

const activeTab = ref('usage');

const categories = computed(() => [
  { key: 'usage', label: i18n('categories.usage') },
  { key: 'account', label: i18n('categories.account') },
  { key: 'device', label: i18n('categories.device') },
  { key: 'other', label: i18n('categories.other') },
]);

interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

const allFaqItems = computed<FaqItem[]>(() => [
  { category: 'usage', question: i18n('items.q1'), answer: i18n('items.a1') },
  { category: 'usage', question: i18n('items.q2'), answer: i18n('items.a2') },
  { category: 'account', question: i18n('items.q3'), answer: i18n('items.a3') },
  { category: 'device', question: i18n('items.q4'), answer: i18n('items.a4') },
]);

const faqItems = computed(() =>
  allFaqItems.value.filter((item) => item.category === activeTab.value),
);
</script>

<template>
  <q-page class="settings-sub-page">
    <!-- Category tabs -->
    <div class="row q-gutter-x-sm q-mb-md" role="tablist" style="flex-wrap: wrap">
      <q-chip
        v-for="cat in categories"
        :key="cat.key"
        :style="{
          background:
            activeTab === cat.key
              ? 'var(--clr-btn-primary-bg)'
              : 'var(--clr-chat-history-search-bg)',
          color: activeTab === cat.key ? 'var(--clr-white)' : 'var(--clr-text)',
        }"
        clickable
        role="tab"
        :aria-selected="activeTab === cat.key"
        @click="activeTab = cat.key"
      >
        {{ cat.label }}
      </q-chip>
    </div>

    <!-- FAQ list -->
    <div class="settings-sub-page__card">
      <q-list separator>
        <q-expansion-item
          v-for="item in faqItems"
          :key="item.question"
          :label="item.question"
          dense
          header-style="font-family: var(--font-family); font-size: 15px; font-weight: 400; color: var(--clr-text)"
        >
          <q-card style="background: var(--clr-page-bg-neutral)">
            <q-card-section
              style="
                font-family: var(--font-family);
                font-size: 14px;
                color: var(--clr-weak);
                line-height: 22px;
              "
            >
              {{ item.answer }}
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </div>
  </q-page>
</template>

<style scoped></style>
