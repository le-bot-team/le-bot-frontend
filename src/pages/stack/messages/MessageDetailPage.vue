<script setup lang="ts">
// MessageDetailPage — message detail view.

import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.messages.MessageDetailPage');
const route = useRoute();

const messageId = computed(() => {
  const id = route.params.id;
  return Array.isArray(id) ? id[0] ?? '' : id ?? '';
});

// Mock message detail — replace with API
const message = computed(() => {
  const details: Record<string, { title: string; content: string; date: string; icon: string }> = {
    '1': {
      title: i18n('items.m1Title'),
      content: i18n('items.m1Content'),
      date: '2025-5-12',
      icon: 'mdi-bell',
    },
    '2': {
      title: i18n('items.m2Title'),
      content: i18n('items.m2Content'),
      date: '2025-5-12',
      icon: 'mdi-emoticon-sad',
    },
    '3': {
      title: i18n('items.m3Title'),
      content: i18n('items.m3Content'),
      date: '2025-5-12',
      icon: 'mdi-information',
    },
    '4': {
      title: i18n('items.m4Title'),
      content: i18n('items.m4Content'),
      date: '2025-5-12',
      icon: 'mdi-gift',
    },
  };
  return (
    details[messageId.value] ?? {
      title: i18n('labels.title'),
      content: i18n('labels.noContent'),
      date: '',
      icon: 'mdi-email',
    }
  );
});
</script>

<template>
  <q-page class="settings-sub-page">
    <div class="settings-sub-page__card q-pa-md">
      <!-- Message header -->
      <div class="row items-center q-gutter-x-md q-mb-md">
        <q-icon :name="message.icon" size="36px" style="color: var(--clr-link)" />
        <div>
          <div
            style="
              font-family: var(--font-family);
              font-size: 17px;
              font-weight: 500;
              color: var(--clr-text);
            "
          >
            {{ message.title || i18n('labels.title') }}
          </div>
          <div style="font-family: var(--font-family); font-size: 12px; color: var(--clr-caption)">
            {{ message.date }}
          </div>
        </div>
      </div>

      <!-- Message body -->
      <div
        style="
          font-family: var(--font-family);
          font-size: 14px;
          line-height: 22px;
          color: var(--clr-weak);
          white-space: pre-line;
        "
      >
        {{ message.content }}
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
