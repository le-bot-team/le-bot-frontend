<script setup lang="ts">
// ActivityMessagesPage — 活动消息列表页 (design a4b42889).
// Layout: page with "活动消息" title, cards each containing an image area (319x149)
// + title text + date + "查看详情" link.
// Raw JSON verified:
//   Card: 335x221px, inner image 319x149px
//   Title: 14px/24px Regular #151717
//   Date / View detail: 12px #9398A9 opacity 80%

import { computed } from 'vue';

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.messages.ActivityMessagesPage');

interface ActivityItem {
  id: string;
  imageUrl: string; // 活动图片
  title: string;
  date: string;
}

// Mock data. Replace with API when available.
const activities = computed<ActivityItem[]>(() => [
  {
    id: '1',
    imageUrl: '',
    title: i18n('items.a1Title'),
    date: '2025-04-10 12:00',
  },
  {
    id: '2',
    imageUrl: '',
    title: i18n('items.a2Title'),
    date: '2025-04-10 12:00',
  },
  {
    id: '3',
    imageUrl: '',
    title: i18n('items.a3Title'),
    date: '2025-04-10 12:00',
  },
]);

function onItemClick(item: ActivityItem) {
  // TODO: navigate to activity detail page when design is ready
  void item;
}
</script>

<template>
  <q-page class="activity-messages-page">
    <div v-if="activities.length" class="activity-messages-list">
      <div
        v-for="item in activities"
        :key="item.id"
        class="activity-card"
        role="button"
        tabindex="0"
        @click="onItemClick(item)"
        @keydown.enter="onItemClick(item)"
        @keydown.space.prevent="onItemClick(item)"
      >
        <div class="activity-card__image">
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            alt=""
            class="activity-card__img"
          />
          <!-- placeholder when no image -->
          <div v-else class="activity-card__placeholder" />
        </div>
        <div class="activity-card__info">
          <div class="activity-card__title">{{ item.title }}</div>
          <div class="activity-card__footer">
            <span class="activity-card__date">{{ item.date }}</span>
            <span class="activity-card__detail">{{ i18n('labels.viewDetail') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="messages-empty">
      {{ i18n('labels.empty') }}
    </div>
  </q-page>
</template>

<style scoped></style>
