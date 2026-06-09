<script setup lang="ts">
// ChatMessageList — scrollable list of bubbles with date separators,
// scroll-to-top pagination, and date-based jump support.

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import ChatMessageItem from 'src/components/chat/ChatMessageItem.vue';
import type { ChatMessage } from 'src/types/chat/types';
import { formatChatTime, formatDateSeparator, toDateKey } from 'src/utils/chat/timeFormat';

const props = defineProps<{
  messages: ChatMessage[];
  emptyHint?: string;
  hasMoreHistory?: boolean;
  isLoadingHistory?: boolean;
}>();

const emit = defineEmits<{
  'load-more': [];
  'scroll-to-date': [dateKey: string];
}>();

/** Filter out messages that have no visible content (no text, no audio, not streaming). */
const visibleMessages = computed(() =>
  props.messages.filter(
    (msg) => msg.text.length > 0 || !!msg.audioUrl || (msg.isStreaming && !msg.isFinished),
  ),
);

/**
 * Build a render list with interleaved date-separator entries.
 * Each entry is either a message or a date separator string.
 */
interface RenderItem {
  type: 'message' | 'separator' | 'timestamp';
  msg?: ChatMessage;
  dateKey?: string;
  label?: string;
}

const renderItems = computed<RenderItem[]>(() => {
  const items: RenderItem[] = [];
  let prevDateKey = '';
  let prevTimestamp = 0;
  const SHOW_TS_INTERVAL = 5 * 60 * 1000; // 5 minutes

  for (const msg of visibleMessages.value) {
    const dateKey = toDateKey(msg.timestamp);

    // Insert date separator when calendar day changes
    if (dateKey !== prevDateKey) {
      items.push({
        type: 'separator',
        dateKey,
        label: formatDateSeparator(msg.timestamp),
      });
      prevDateKey = dateKey;
      // First message of a new day always shows its timestamp
      items.push({ type: 'timestamp', label: formatChatTime(msg.timestamp) });
      items.push({ type: 'message', msg });
    } else {
      // Show timestamp only when gap > 5 minutes from previous message
      if (msg.timestamp - prevTimestamp > SHOW_TS_INTERVAL) {
        items.push({ type: 'timestamp', label: formatChatTime(msg.timestamp) });
      }
      items.push({ type: 'message', msg });
    }
    prevTimestamp = msg.timestamp;
  }

  return items;
});

// -------------------------------------------------------------------------
// Scroll management
// -------------------------------------------------------------------------

const scrollRef = ref<HTMLDivElement | null>(null);
const isNearBottom = ref(true);

function scrollToBottom(smooth = false) {
  const el = scrollRef.value;
  if (!el) return;
  el.style.scrollBehavior = smooth ? 'smooth' : 'auto';
  el.scrollTop = el.scrollHeight;
  // Reset behavior to smooth for future user scrolls
  requestAnimationFrame(() => {
    if (el) el.style.scrollBehavior = 'smooth';
  });
}

// rAF-throttled scroll scheduler: coalesces multiple scroll requests per frame
let scrollRafId: number | null = null;
function scheduleScroll() {
  if (scrollRafId !== null) return;
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = null;
    if (isNearBottom.value) {
      scrollToBottom();
    }
  });
}

// Initial scroll to bottom when component mounts (show latest messages)
onMounted(() => {
  void nextTick(() => scrollToBottom());
});

onBeforeUnmount(() => {
  if (scrollRafId !== null) {
    cancelAnimationFrame(scrollRafId);
    scrollRafId = null;
  }
});

// Scroll to bottom when a new message is added (only if user is near bottom)
watch(
  () => visibleMessages.value.length,
  () => {
    scheduleScroll();
  },
);

// Scroll to bottom when the last message text grows (streaming) — only if near bottom
watch(
  () => {
    const last = props.messages[props.messages.length - 1];
    return last ? `${last.text.length}-${last.isFinished}` : '';
  },
  () => {
    scheduleScroll();
  },
);

// -------------------------------------------------------------------------
// Scroll event: detect top/bottom proximity
// -------------------------------------------------------------------------

let scrollTimeout: ReturnType<typeof setTimeout> | undefined;

function onScroll() {
  const el = scrollRef.value;
  if (!el) return;

  const { scrollTop, scrollHeight, clientHeight } = el;
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

  // Consider "near bottom" when within 80px of bottom
  isNearBottom.value = distanceFromBottom < 80;

  // Trigger load-more when scrolled near top
  if (scrollTop < 50 && props.hasMoreHistory && !props.isLoadingHistory) {
    // Debounce: avoid firing multiple times in quick succession
    if (scrollTimeout !== undefined) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      emit('load-more');
    }, 100);
  }
}

// -------------------------------------------------------------------------
// Maintain scroll position when loading older messages
// -------------------------------------------------------------------------

watch(
  () => props.isLoadingHistory,
  (loading, wasLoading) => {
    if (wasLoading && !loading) {
      // Loading just finished — scrollHeight has increased.
      // Keep visual position by adjusting scrollTop by the height delta.
      const el = scrollRef.value;
      if (el && pendingScrollDelta > 0) {
        el.scrollTop += pendingScrollDelta;
        pendingScrollDelta = 0;
      }
    }
  },
);

// Capture scrollHeight before new items are prepended
let pendingScrollDelta = 0;
watch(
  () => props.messages.length,
  () => {
    const el = scrollRef.value;
    if (el && props.isLoadingHistory) {
      // Record the height delta so we can apply it when loading finishes
      pendingScrollDelta =
        el.scrollHeight -
        (el.dataset.prevScrollHeight ? parseInt(el.dataset.prevScrollHeight) : el.scrollHeight);
    }
    // Update prevScrollHeight
    if (el) el.dataset.prevScrollHeight = String(el.scrollHeight);
  },
);

// Capture scrollHeight right before loadMore is triggered
watch(
  () => props.hasMoreHistory,
  () => {
    const el = scrollRef.value;
    if (el) el.dataset.prevScrollHeight = String(el.scrollHeight);
  },
);

// -------------------------------------------------------------------------
// scrollToDate — public API for jumping to a specific date
// -------------------------------------------------------------------------

function scrollToDate(dateKey: string) {
  const el = scrollRef.value;
  if (!el) return;

  // Find the separator element matching the dateKey
  const separators = el.querySelectorAll<HTMLElement>('[data-date-key]');
  for (const sep of separators) {
    if (sep.dataset.dateKey === dateKey) {
      sep.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
  }
}

defineExpose({ scrollToDate });
</script>

<template>
  <div ref="scrollRef" class="chat-page__list" @scroll="onScroll">
    <div v-if="visibleMessages.length === 0" class="chat-page__empty">
      {{ emptyHint }}
    </div>

    <!-- Load-more indicator at the top -->
    <div v-if="hasMoreHistory" class="chat-page__load-more">
      <span v-if="isLoadingHistory" class="chat-page__loading-indicator">
        <q-spinner-dots size="18px" />
      </span>
    </div>

    <template v-for="(item, idx) in renderItems" :key="idx">
      <!-- Date separator -->
      <div
        v-if="item.type === 'separator'"
        class="chat-page__date-separator"
        :data-date-key="item.dateKey"
      >
        {{ item.label }}
      </div>

      <!-- Standalone timestamp between messages -->
      <div v-else-if="item.type === 'timestamp'" class="chat-page__time-label">
        {{ item.label }}
      </div>

      <!-- Message bubble -->
      <ChatMessageItem v-else-if="item.msg" :message="item.msg" />
    </template>
  </div>
</template>
