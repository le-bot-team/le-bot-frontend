<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { i18nSubPath } from 'src/utils/common';
import { useMessagesStore } from 'stores/messages';

import type { ActivityDetail, ActivityStatus } from 'src/types/api/message';

const i18n = i18nSubPath('pages.stack.messages.ActivityDetailPage');
const route = useRoute();
const store = useMessagesStore();

const activity = ref<ActivityDetail | null>(null);

/** Format date for display (e.g. "2025.06.01") */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/** Status label */
function statusLabel(status: ActivityStatus): string {
  switch (status) {
    case 'ongoing':
      return i18n('status.ongoing');
    case 'upcoming':
      return i18n('status.upcoming');
    case 'ended':
      return i18n('status.ended');
  }
}

/** Status CSS modifier */
function statusClass(status: ActivityStatus): string {
  return `activity-detail-status--${status}`;
}

onMounted(async () => {
  const id = route.params.id as string;
  const result = await store.fetchActivityDetail(id);
  activity.value = result;
});
</script>

<template>
  <q-page class="activity-detail-page">
    <div v-if="activity" class="activity-detail-card">
      <!-- Hero image -->
      <div class="activity-detail-hero">
        <img
          v-if="activity.image"
          :src="activity.image"
          class="activity-detail-hero__img"
          :alt="activity.title"
        />
        <div v-else class="activity-detail-hero__placeholder" />
      </div>

      <!-- Content area -->
      <div class="activity-detail-body">
        <!-- Title row with status badge -->
        <div class="activity-detail-header">
          <h2 class="activity-detail-title">{{ activity.title }}</h2>
          <span class="activity-detail-status" :class="statusClass(activity.status)">
            {{ statusLabel(activity.status) }}
          </span>
        </div>

        <!-- Date range -->
        <div class="activity-detail-dates">
          {{ formatDate(activity.startDate) }} ~ {{ formatDate(activity.endDate) }}
        </div>

        <!-- Divider -->
        <div class="activity-detail-divider" />

        <!-- Rich content -->
        <div class="activity-detail-content">
          {{ activity.content }}
        </div>
      </div>
    </div>

    <!-- Loading / not found state -->
    <div v-else class="activity-detail-empty">
      {{ i18n('labels.noContent') }}
    </div>
  </q-page>
</template>

<style scoped></style>
