<script setup lang="ts">
// ChatHistoryPage — Chat Summary (聊天摘要) page.
// Displays a daily chat summary with calendar navigation, frequent topics,
// AI-generated summary, highlights, emotions, capabilities, and growth signals.
// Data is fetched from the backend via GET /api/v1/chat/summary.

import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';

import { router } from 'src/router';
import { i18nSubPath } from 'src/utils/common';
import { fetchChatSummary } from 'src/utils/api/chat-summary';
import type { ChatSummaryData } from 'src/types/api/chat-summary';
import { useAuthStore } from 'stores/auth';
import { useDeviceStore } from 'stores/device';
import { useChatSummaryRead } from 'src/composables/useChatSummaryRead';

const i18n = i18nSubPath('pages.stack.chat.ChatHistoryPage');

// ──── Stores ─────────────────────────────────────────────────────────────────
const authStore = useAuthStore();
const deviceStore = useDeviceStore();
const { accessToken } = storeToRefs(authStore);
const { currentDeviceId } = storeToRefs(deviceStore);

// 摘要已读状态管理 — 用户进入页面查看摘要时自动标记为已读
const { markDateAsRead } = useChatSummaryRead(
  () => currentDeviceId.value,
  () => accessToken.value,
);

// ──── Calendar state ─────────────────────────────────────────────────────────
const selectedDate = ref(new Date());
const monthPickerOpen = ref(false);

/** The month currently displayed in the month picker (independent of selectedDate) */
const viewingYear = ref(new Date().getFullYear());
const viewingMonth = ref(new Date().getMonth()); // 0-based

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'] as const;

const calendarMonth = computed(() => {
  const d = selectedDate.value;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
});

const viewingMonthLabel = computed(() => {
  return `${viewingYear.value}-${String(viewingMonth.value + 1).padStart(2, '0')}`;
});

/** Format Date to YYYY-MM-DD for the API */
function toDateParam(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 7 days centred on the selected date (Sun–Sat of that week) */
const weekDays = computed(() => {
  const sel = new Date(selectedDate.value);
  const dow = sel.getDay(); // 0=Sun
  const start = new Date(sel);
  start.setDate(sel.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      weekday: WEEKDAYS[i],
      date: d.getDate(),
      full: new Date(d),
      isSelected:
        d.getFullYear() === sel.getFullYear() &&
        d.getMonth() === sel.getMonth() &&
        d.getDate() === sel.getDate(),
    };
  });
});

interface MonthDay {
  day: number;
  full: Date;
  isSelected: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}

/** Full month grid (6 weeks x 7 days) for the month picker */
const monthGrid = computed<MonthDay[]>(() => {
  const year = viewingYear.value;
  const month = viewingMonth.value;
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay(); // 0=Sun

  // Start from the Sunday before (or on) the 1st
  const gridStart = new Date(year, month, 1 - startDow);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sel = selectedDate.value;

  // Always render 42 cells (6 rows) to keep grid height stable
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return {
      day: d.getDate(),
      full: new Date(d),
      isSelected:
        d.getFullYear() === sel.getFullYear() &&
        d.getMonth() === sel.getMonth() &&
        d.getDate() === sel.getDate(),
      isToday:
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate(),
      isCurrentMonth: d.getMonth() === month,
    };
  });
});

function selectDay(day: { full: Date }) {
  selectedDate.value = day.full;
}

function selectMonthDay(day: MonthDay) {
  selectedDate.value = day.full;
  monthPickerOpen.value = false;
}

function toggleMonthPicker() {
  if (!monthPickerOpen.value) {
    // Sync viewing month to current selected date when opening
    viewingYear.value = selectedDate.value.getFullYear();
    viewingMonth.value = selectedDate.value.getMonth();
  }
  monthPickerOpen.value = !monthPickerOpen.value;
}

function prevMonth() {
  if (viewingMonth.value === 0) {
    viewingMonth.value = 11;
    viewingYear.value--;
  } else {
    viewingMonth.value--;
  }
}

function nextMonth() {
  if (viewingMonth.value === 11) {
    viewingMonth.value = 0;
    viewingYear.value++;
  } else {
    viewingMonth.value++;
  }
}

// ──── API state ──────────────────────────────────────────────────────────────
const loading = ref(false);
const summary = ref<ChatSummaryData | null>(null);
const error = ref<string | null>(null);

/** Whether today's date (or selected date) has chat data */
const hasData = computed(() => summary.value !== null && !loading.value && !error.value);
const isEmpty = computed(() => summary.value === null && !loading.value && !error.value);
const hasError = computed(() => error.value !== null && !loading.value);

async function loadSummary() {
  if (!accessToken.value || !currentDeviceId.value) {
    summary.value = null;
    error.value = null;
    return;
  }

  loading.value = true;
  error.value = null;
  summary.value = null;

  try {
    const resp = await fetchChatSummary(
      accessToken.value,
      currentDeviceId.value,
      toDateParam(selectedDate.value),
    );
    const body = resp.data;
    if (body.success) {
      summary.value = body.data;
      // Mark the viewed date as read so the HomePage red dot is cleared
      if (body.data !== null) {
        markDateAsRead(toDateParam(selectedDate.value));
      }
    } else {
      error.value = body.message ?? 'Unknown error';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
}

// Fetch on mount + mark yesterday as read to clear HomePage red dot
onMounted(() => {
  void loadSummary();
  // User entered summary page — mark yesterday as read so the red dot clears
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  markDateAsRead(toDateParam(yesterday));
});

// Refetch when date or device changes
watch([selectedDate, currentDeviceId], () => {
  void loadSummary();
});

// ──── Navigation ─────────────────────────────────────────────────────────────
function goChat() {
  void router.push('/stack/chat');
}

// ──── Emotion helpers ─────────────────────────────────────────────────────────
const EMOTION_META: Record<string, { i18nKey: string; emoji: string; color: string; bg: string }> =
  {
    happy: {
      i18nKey: 'emotionHappy',
      emoji: '😊',
      color: 'rgba(255, 183, 77, 1)',
      bg: 'rgba(255, 183, 77, 0.12)',
    },
    curious: {
      i18nKey: 'emotionCurious',
      emoji: '🤔',
      color: 'rgba(100, 181, 246, 1)',
      bg: 'rgba(100, 181, 246, 0.12)',
    },
    excited: {
      i18nKey: 'emotionExcited',
      emoji: '🤩',
      color: 'rgba(255, 111, 97, 1)',
      bg: 'rgba(255, 111, 97, 0.12)',
    },
    calm: {
      i18nKey: 'emotionCalm',
      emoji: '😌',
      color: 'rgba(102, 187, 106, 1)',
      bg: 'rgba(102, 187, 106, 0.12)',
    },
    frustrated: {
      i18nKey: 'emotionFrustrated',
      emoji: '😤',
      color: 'rgba(239, 83, 80, 1)',
      bg: 'rgba(239, 83, 80, 0.12)',
    },
    _default: {
      i18nKey: '',
      emoji: '🙂',
      color: 'rgba(147, 152, 169, 1)',
      bg: 'rgba(147, 152, 169, 0.12)',
    },
  };

interface EmotionDisplay {
  label: string;
  emoji: string;
  color: string;
  bg: string;
}

/** The dominant emotion (highest percentage) */
const primaryEmotion = computed<EmotionDisplay | null>(() => {
  if (!summary.value?.emotions) return null;
  const entries = Object.entries(summary.value.emotions).filter(([, v]) => v > 0);
  if (entries.length === 0) return null;
  const [key] = entries.sort((a, b) => b[1] - a[1])[0]!;
  const meta = EMOTION_META[key] ?? EMOTION_META['_default']!;
  return {
    label: meta.i18nKey ? i18n(`labels.${meta.i18nKey}`) : key,
    emoji: meta.emoji,
    color: meta.color,
    bg: meta.bg,
  };
});
</script>

<template>
  <q-page class="chat-summary-page">
    <!-- Calendar strip -->
    <section class="chat-summary__calendar">
      <!-- Month header — click to toggle month picker -->
      <button type="button" class="chat-summary__month" @click="toggleMonthPicker">
        <img src="/lanhu-slices/icon-calendar-dairy.png" alt="" class="chat-summary__month-icon" />
        <span>{{ calendarMonth }}</span>
        <q-icon
          :name="monthPickerOpen ? 'expand_less' : 'expand_more'"
          size="20px"
          class="chat-summary__month-arrow"
        />
      </button>

      <!-- Month picker panel (expanded) -->
      <Transition name="chat-summary-picker">
        <div v-if="monthPickerOpen" class="chat-summary__picker">
          <!-- Month navigation -->
          <div class="chat-summary__picker-nav">
            <button type="button" class="chat-summary__picker-nav-btn" @click="prevMonth">
              <q-icon name="chevron_left" size="20px" />
            </button>
            <span class="chat-summary__picker-month-label">{{ viewingMonthLabel }}</span>
            <button type="button" class="chat-summary__picker-nav-btn" @click="nextMonth">
              <q-icon name="chevron_right" size="20px" />
            </button>
          </div>
          <!-- Weekday headers -->
          <div class="chat-summary__picker-weekdays">
            <span v-for="wd in WEEKDAYS" :key="wd" class="chat-summary__picker-wd">{{ wd }}</span>
          </div>
          <!-- Day grid (6 rows) -->
          <div class="chat-summary__picker-grid">
            <button
              v-for="(cell, idx) in monthGrid"
              :key="idx"
              type="button"
              class="chat-summary__picker-day"
              :class="{
                'chat-summary__picker-day--selected': cell.isSelected,
                'chat-summary__picker-day--today': cell.isToday && !cell.isSelected,
                'chat-summary__picker-day--other': !cell.isCurrentMonth,
              }"
              @click="selectMonthDay(cell)"
            >
              {{ cell.day }}
            </button>
          </div>
        </div>
      </Transition>

      <!-- Week strip (always visible when picker is closed) -->
      <div v-show="!monthPickerOpen" class="chat-summary__week">
        <button
          v-for="day in weekDays"
          :key="day.date"
          type="button"
          class="chat-summary__day-cell"
          :class="{ 'chat-summary__day-cell--selected': day.isSelected }"
          @click="selectDay(day)"
        >
          <span
            class="chat-summary__weekday"
            :class="{ 'chat-summary__weekday--selected': day.isSelected }"
            >{{ day.weekday }}</span
          >
          <span
            class="chat-summary__date-num"
            :class="{ 'chat-summary__date-num--selected': day.isSelected }"
            >{{ day.date }}</span
          >
        </button>
      </div>
    </section>

    <!-- Loading skeleton -->
    <section v-if="loading" class="chat-summary__card">
      <div class="chat-summary__section-title chat-summary__section-title--topics">
        {{ i18n('labels.highFreqTopics') }}
      </div>
      <q-skeleton type="text" width="80%" />
      <div class="chat-summary__divider" />
      <div class="chat-summary__section-title chat-summary__section-title--summary">
        {{ i18n('labels.chatSummary') }}
      </div>
      <q-skeleton type="text" />
      <q-skeleton type="text" width="90%" />
      <q-skeleton type="text" width="70%" />
      <div class="chat-summary__growth">
        <q-skeleton type="QAvatar" size="16px" />
        <q-skeleton type="text" width="85%" />
      </div>
    </section>

    <!-- Error state -->
    <div v-else-if="hasError" class="chat-summary__state">
      <q-icon name="warning" size="48px" color="grey-6" />
      <div class="chat-summary__state-title">{{ i18n('labels.loadFailed') }}</div>
      <div class="chat-summary__state-subtitle">{{ error }}</div>
      <button type="button" class="chat-summary__state-btn" @click="loadSummary">
        {{ i18n('labels.retry') }}
      </button>
    </div>

    <!-- Empty state (no chat data for this date) -->
    <div v-else-if="isEmpty" class="chat-summary__state">
      <img src="/lanhu-slices/icon-leaf-dairy.png" alt="" class="chat-summary__state-icon" />
      <div class="chat-summary__state-title">{{ i18n('labels.emptyTitle') }}</div>
      <div class="chat-summary__state-subtitle">{{ i18n('labels.emptySubtitle') }}</div>
      <button type="button" class="chat-summary__state-btn" @click="goChat">
        {{ i18n('labels.goChat') }}
      </button>
    </div>

    <!-- Summary data -->
    <template v-else-if="hasData && summary">
      <!-- Interaction minutes header -->
      <div class="chat-summary__minutes">
        <span class="chat-summary__minutes-label">{{ i18n('labels.todayChat') }}</span>
        <span class="chat-summary__minutes-value">
          {{ i18n('labels.todayChatMin', { minutes: summary.interactionMinutes }) }}
        </span>
      </div>

      <!-- Merged card: Chat summary + Highlights -->
      <section class="chat-summary__card">
        <div class="chat-summary__section-title chat-summary__section-title--summary">
          {{ i18n('labels.chatSummary') }}
        </div>
        <div class="chat-summary__text">
          <p
            v-for="(para, idx) in summary.summaryParagraphs"
            :key="idx"
            class="chat-summary__paragraph"
          >
            {{ para }}
          </p>
        </div>

        <!-- Highlights (inline) -->
        <template v-if="summary.summaryBullets.length">
          <div class="chat-summary__divider" />
          <div class="chat-summary__section-title chat-summary__section-title--highlights">
            {{ i18n('labels.highlights') }}
          </div>
          <div
            v-for="(bp, idx) in summary.summaryBullets"
            :key="idx"
            class="chat-summary__highlight-inline"
          >
            <span class="chat-summary__highlight-quote">「{{ bp.quote }}」</span>
            <span class="chat-summary__highlight-context">— {{ bp.context }}</span>
          </div>
        </template>
      </section>

      <!-- Emotion (primary only) -->
      <section v-if="primaryEmotion" class="chat-summary__card chat-summary__card--emotion">
        <span class="chat-summary__emotion-label">{{ i18n('labels.todayEmotions') }}</span>
        <span
          class="chat-summary__emotion-badge"
          :style="{ color: primaryEmotion.color, background: primaryEmotion.bg }"
        >
          <span class="chat-summary__emotion-emoji">{{ primaryEmotion.emoji }}</span>
          <span class="chat-summary__emotion-text">{{ primaryEmotion.label }}</span>
        </span>
      </section>

      <!-- Growth signal -->
      <section class="chat-summary__card">
        <div class="chat-summary__growth">
          <img src="/lanhu-slices/icon-leaf-dairy.png" alt="" class="chat-summary__leaf-icon" />
          <p class="chat-summary__growth-text">
            <span class="chat-summary__growth-label">{{ i18n('labels.growthSignal') }}：</span
            >{{ summary.growthSignal }}
          </p>
        </div>
      </section>
    </template>
  </q-page>
</template>

<style scoped>
/* ─── Page ──────────────────────────────────────────────────────────────────── */
.chat-summary-page {
  background: rgba(32, 204, 249, 0.06);
  padding: 16px 12px;
  min-height: 100%;
}

/* ─── Calendar ──────────────────────────────────────────────────────────────── */
.chat-summary__calendar {
  background: #fff;
  border-radius: 12px;
  padding: 16px 12px 12px;
  margin-bottom: 16px;
}

.chat-summary__month {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Roboto', sans-serif;
  font-size: 20px;
  font-weight: 500;
  line-height: 24px;
  color: rgba(21, 23, 23, 1);
  margin-bottom: 12px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  width: fit-content;
}

.chat-summary__month-arrow {
  color: rgba(147, 152, 169, 1);
  transition: transform 0.2s;
}

.chat-summary__month-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.chat-summary__week {
  display: flex;
  gap: 0;
  justify-content: space-between;
}

.chat-summary__day-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 0;
  background: none;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
  min-width: 0;
}

.chat-summary__day-cell--selected {
  border-color: rgba(32, 204, 249, 1);
  background: rgba(32, 204, 249, 0.06);
}

.chat-summary__weekday {
  font-family: 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 22px;
  color: rgba(74, 74, 74, 1);
}

.chat-summary__weekday--selected {
  font-weight: 500;
  color: rgba(32, 204, 249, 1);
}

.chat-summary__date-num {
  font-family: 'Roboto', sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 22px;
  color: rgba(147, 152, 169, 1);
}

.chat-summary__date-num--selected {
  font-weight: 600;
  color: rgba(32, 204, 249, 1);
}

/* ─── Section titles ────────────────────────────────────────────────────────── */
.chat-summary__section-title {
  font-family: 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.chat-summary__section-title--topics {
  color: rgba(2, 188, 237, 1);
}

.chat-summary__section-title--summary {
  color: rgba(2, 188, 237, 1);
  margin-bottom: 10px;
}

.chat-summary__section-title--highlights {
  color: rgba(2, 188, 237, 1);
}

.chat-summary__text {
  font-family: 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;
  color: rgba(21, 23, 23, 1);
  margin: 0;
}

/* ─── Unified card ─────────────────────────────────────────────────────────── */
.chat-summary__card {
  background: #fff;
  border: 1px solid rgba(255, 255, 255, 1);
  border-radius: 12px;
  padding: 16px 12px;
  margin-bottom: 12px;
}

.chat-summary__divider {
  height: 1px;
  background: rgba(229, 229, 239, 1);
  margin: 14px 0;
}

.chat-summary__paragraph {
  margin: 0 0 4px;
}

/* ─── Interaction minutes ────────────────────────────────────────────────────── */
.chat-summary__minutes {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 0 4px;
}

.chat-summary__minutes-label {
  font-family: 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: rgba(99, 104, 104, 1);
}

.chat-summary__minutes-value {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: rgba(32, 204, 249, 1);
}

/* ─── Highlights (inline within summary card) ──────────────────────────────── */
.chat-summary__highlight-inline {
  margin-bottom: 6px;
  font-family: 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  line-height: 24px;
}

.chat-summary__highlight-inline:last-child {
  margin-bottom: 0;
}

.chat-summary__highlight-quote {
  font-weight: 600;
  color: rgba(21, 23, 23, 1);
}

.chat-summary__highlight-context {
  font-weight: 400;
  color: rgba(147, 152, 169, 1);
  margin-left: 4px;
}

/* ─── Emotion card ──────────────────────────────────────────────────────────── */
.chat-summary__card--emotion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
}

.chat-summary__emotion-label {
  font-family: 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: rgba(2, 188, 237, 1);
}

.chat-summary__emotion-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px 4px 8px;
  border-radius: 20px;
}

.chat-summary__emotion-emoji {
  font-size: 18px;
  line-height: 1;
}

.chat-summary__emotion-text {
  font-family: 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
}

/* ─── Growth signal ─────────────────────────────────────────────────────────── */
.chat-summary__growth {
  background: rgba(32, 204, 249, 0.08);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.chat-summary__leaf-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 4px;
}

.chat-summary__growth-text {
  font-family: 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;
  color: rgba(99, 104, 104, 1);
  margin: 0;
}

.chat-summary__growth-label {
  font-weight: 500;
}

/* ─── State views (empty / error) ───────────────────────────────────────────── */
.chat-summary__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.chat-summary__state-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.chat-summary__state-title {
  font-family: 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: rgba(21, 23, 23, 1);
  margin-bottom: 8px;
}

.chat-summary__state-subtitle {
  font-family: 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: rgba(147, 152, 169, 1);
  margin-bottom: 20px;
  max-width: 260px;
  word-break: break-word;
}

.chat-summary__state-btn {
  font-family: 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  color: #fff;
  background: rgba(32, 204, 249, 1);
  border: none;
  border-radius: 20px;
  padding: 8px 28px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.chat-summary__state-btn:active {
  opacity: 0.8;
}

/* ─── Month picker ─────────────────────────────────────────────────────────── */
.chat-summary__picker {
  padding-bottom: 4px;
}

.chat-summary__picker-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.chat-summary__picker-nav-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: rgba(74, 74, 74, 1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-summary__picker-nav-btn:active {
  background: rgba(0, 0, 0, 0.04);
}

.chat-summary__picker-month-label {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: rgba(21, 23, 23, 1);
}

.chat-summary__picker-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.chat-summary__picker-wd {
  text-align: center;
  font-family: 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 28px;
  color: rgba(147, 152, 169, 1);
}

.chat-summary__picker-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.chat-summary__picker-day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: rgba(21, 23, 23, 1);
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  width: 36px;
  margin: 1px auto;
}

.chat-summary__picker-day:active {
  background: rgba(32, 204, 249, 0.12);
}

.chat-summary__picker-day--selected {
  background: rgba(32, 204, 249, 1) !important;
  color: #fff !important;
  font-weight: 600;
}

.chat-summary__picker-day--today {
  border: 1.5px solid rgba(32, 204, 249, 1);
}

.chat-summary__picker-day--other {
  color: rgba(200, 200, 210, 1);
}

/* ─── Picker transition ───────────────────────────────────────────────────── */
.chat-summary-picker-enter-active,
.chat-summary-picker-leave-active {
  transition:
    max-height 0.25s ease,
    opacity 0.2s ease;
  overflow: hidden;
}

.chat-summary-picker-enter-from,
.chat-summary-picker-leave-to {
  max-height: 0;
  opacity: 0;
}

.chat-summary-picker-enter-to,
.chat-summary-picker-leave-from {
  max-height: 360px;
  opacity: 1;
}
</style>
