<script setup lang="ts">
// ChatHistoryPage — chat session history list.
// Layout: search bar + date-grouped session summaries.

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.chat.ChatHistoryPage');
const router = useRouter();

const searchQuery = ref('');

interface ChatSession {
  id: string;
  title: string;
  summary: string;
  date: string;
  dateGroup: string;
}

// Mock data — replace with API when available
const sessions = computed<ChatSession[]>(() => {
  const all: ChatSession[] = [
    {
      id: '1',
      title: '和乐宝聊天气',
      summary: '今天天气真好，我们去了公园...',
      date: '2025-05-09',
      dateGroup: '今天',
    },
    {
      id: '2',
      title: '学习英语单词',
      summary: 'apple 是苹果的意思...',
      date: '2025-05-09',
      dateGroup: '今天',
    },
    {
      id: '3',
      title: '睡前故事',
      summary: '从前有一座山，山里有座庙...',
      date: '2025-05-08',
      dateGroup: '昨天',
    },
    {
      id: '4',
      title: '十万个为什么',
      summary: '为什么天是蓝色的？',
      date: '2025-05-08',
      dateGroup: '昨天',
    },
    {
      id: '5',
      title: '唱歌时间',
      summary: '两只老虎，两只老虎...',
      date: '2025-05-07',
      dateGroup: '更早',
    },
  ];
  if (!searchQuery.value) return all;
  const q = searchQuery.value.toLowerCase();
  return all.filter(
    (s) => s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q),
  );
});

const groupedSessions = computed(() => {
  const groups: Record<string, ChatSession[]> = {};
  for (const s of sessions.value) {
    const key = s.dateGroup;
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }
  return groups;
});

function openSession(session: ChatSession) {
  router.push(`/stack/chat?session=${session.id}`).catch(console.error);
}
</script>

<template>
  <q-page class="chat-history-page">
    <input
      v-model="searchQuery"
      class="chat-history-page__search"
      :placeholder="i18n('labels.searchPlaceholder')"
      :aria-label="i18n('labels.searchPlaceholder')"
    />

    <template v-if="sessions.length">
      <div
        v-for="(group, dateGroup) in groupedSessions"
        :key="dateGroup"
        class="chat-history-page__date-group"
      >
        <div class="chat-history-page__date-label">{{ dateGroup }}</div>
        <div class="chat-history-page__card">
          <div
            v-for="session in group"
            :key="session.id"
            class="chat-history-page__item"
            role="button"
            tabindex="0"
            @click="openSession(session)"
            @keydown.enter="openSession(session)"
            @keydown.space.prevent="openSession(session)"
          >
            <div class="chat-history-page__item-main">
              <div class="chat-history-page__item-title">{{ session.title }}</div>
              <div class="chat-history-page__item-summary">{{ session.summary }}</div>
            </div>
            <q-icon name="chevron_right" class="chat-history-page__item-chevron" />
          </div>
        </div>
      </div>
    </template>

    <div v-else class="chat-history-page__empty">
      {{ i18n('labels.empty') }}
    </div>
  </q-page>
</template>

<style scoped>
.chat-history-page__item-chevron {
  color: var(--clr-caption);
  font-size: 18px;
}
</style>
