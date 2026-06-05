<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { i18nSubPath } from 'src/utils/common';
import { useMessagesStore } from 'stores/messages';

const i18n = i18nSubPath('pages.stack.messages.ActivityMessagesPage');
const router = useRouter();
const store = useMessagesStore();

/** Format date range for display (e.g. "2025.06.01 ~ 2025.06.30") */
function formatDateRange(start: string, end: string): string {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };
  return `${fmt(start)} ~ ${fmt(end)}`;
}

/** Navigate to activity detail */
function onCardClick(activityId: string) {
  void router.push(`/stack/messages/activity/${activityId}`);
}

onMounted(() => {
  void store.fetchActivities();
});
</script>

<template>
  <q-page class="activity-messages-page">
    <div v-if="store.activities.length" class="activity-messages-list">
      <div
        v-for="activity in store.activities"
        :key="activity.id"
        class="activity-card"
        @click="onCardClick(activity.id)"
      >
        <!-- Image area -->
        <div class="activity-card__image">
          <img
            v-if="activity.image"
            :src="activity.image"
            class="activity-card__img"
            :alt="activity.title"
          />
          <div v-else class="activity-card__placeholder" />
        </div>

        <!-- Info area -->
        <div class="activity-card__info">
          <span class="activity-card__title">{{ activity.title }}</span>
          <div class="activity-card__footer">
            <span class="activity-card__date">
              {{ formatDateRange(activity.startDate, activity.endDate) }}
            </span>
            <span class="activity-card__detail">
              {{ i18n('labels.viewDetail') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="messages-empty">
      {{ i18n('labels.empty') }}
    </div>
  </q-page>
</template>

<style scoped></style>
