<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { i18nSubPath } from 'src/utils/common';
import { useMessagesStore } from 'stores/messages';

import imgGoodNewsMsg from 'src/assets/messages-slices/img_good_news_msg.png';
import imgBadMoodMsg from 'src/assets/messages-slices/img_bad_mood_msg.png';
import imgNormalInforMsg from 'src/assets/messages-slices/img_normal_infor_msg.png';

import type { MessageItem, MessageType } from 'src/types/api/message';

const i18n = i18nSubPath('pages.stack.messages.MessageDetailPage');
const route = useRoute();
const router = useRouter();
const store = useMessagesStore();

const message = ref<MessageItem | null>(null);

/** Map message type to its default icon asset */
function iconForType(type: MessageType): string {
  switch (type) {
    case 'notification':
      return imgNormalInforMsg;
    case 'emotion':
      return imgBadMoodMsg;
    case 'activity':
      return imgGoodNewsMsg;
  }
}

/** Format ISO date string to full display (e.g. "2025-06-05 10:30") */
function formatFullDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Navigate to growth data center */
function goToGrowthData() {
  void router.push('/stack/growth-data');
}

onMounted(async () => {
  const id = route.params.id as string;
  // Try local cache first, then fetch from API
  const cached = store.messages.find((m) => m.id === id);
  if (cached) {
    message.value = cached;
    void store.markAsRead(id);
  } else {
    const result = await store.fetchMessageDetail(id);
    message.value = result;
  }
});
</script>

<template>
  <q-page class="message-detail-page">
    <div v-if="message" class="message-detail-card">
      <!-- Header: icon + title + date -->
      <div class="message-detail-header">
        <img
          class="message-detail-icon"
          :src="message.iconUrl || iconForType(message.type)"
          alt=""
        />
        <div class="message-detail-info">
          <span class="message-detail-title">{{ message.title }}</span>
          <span class="message-detail-date">{{ formatFullDate(message.createdAt) }}</span>
        </div>
      </div>

      <!-- Content body -->
      <div class="message-detail-body">
        <p class="message-detail-content">{{ message.content }}</p>
      </div>

      <!-- Emotion-specific: link to growth data center -->
      <div v-if="message.type === 'emotion'" class="message-detail-action">
        <button type="button" class="message-detail-action-btn" @click="goToGrowthData">
          {{ i18n('labels.goToGrowthData') }}
        </button>
      </div>
    </div>

    <!-- Fallback when message not found -->
    <div v-else class="message-detail-empty">
      {{ i18n('labels.noContent') }}
    </div>
  </q-page>
</template>

<style scoped></style>
