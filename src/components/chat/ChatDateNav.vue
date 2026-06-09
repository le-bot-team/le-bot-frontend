<script setup lang="ts">
// ChatDateNav — horizontal scrollable date navigation bar.
// Shows calendar dates that have messages as tappable chips.
// Emits 'select' with the YYYY-MM-DD date key when a chip is tapped.

import { computed, ref } from 'vue';

import type { ChatDateEntry } from 'src/utils/chat/chatHistoryDB';
import { formatDateSeparator } from 'src/utils/chat/timeFormat';

const props = defineProps<{
  dates: ChatDateEntry[];
}>();

const emit = defineEmits<{
  select: [dateKey: string];
}>();

const expanded = ref(false);

/** Visible dates — show max 5 chips when collapsed, all when expanded. */
const visibleDates = computed(() => {
  if (expanded.value || props.dates.length <= 5) return props.dates;
  return props.dates.slice(0, 5);
});

const hasMore = computed(() => props.dates.length > 5 && !expanded.value);

function onSelect(entry: ChatDateEntry) {
  emit('select', entry.date);
}

function formatLabel(entry: ChatDateEntry): string {
  return formatDateSeparator(entry.timestamp);
}
</script>

<template>
  <div v-if="dates.length > 0" class="chat-date-nav">
    <div class="chat-date-nav__scroll">
      <button
        v-for="entry in visibleDates"
        :key="entry.date"
        type="button"
        class="chat-date-nav__chip"
        @click="onSelect(entry)"
      >
        {{ formatLabel(entry) }}
      </button>

      <button
        v-if="hasMore"
        type="button"
        class="chat-date-nav__chip chat-date-nav__chip--more"
        @click="expanded = true"
      >
        ...
      </button>
    </div>
  </div>
</template>
