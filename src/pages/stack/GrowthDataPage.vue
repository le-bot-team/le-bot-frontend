<script setup lang="ts">
// GrowthDataPage — Phase 1-6: Full implementation with charts.
// Design: 6bd5a9c0 (成长数据中心, redesigned 2026-06).
//
// Layout strategy:
//   - The ENTIRE page is a single scroll container (.growth-scroll-root).
//   - Hero image + User card + Stats are in normal flow (scroll away).
//   - Tab bar uses position: sticky; top: 0 — only sticks when it's about
//     to leave the viewport.
//   - IntersectionObserver provides scroll-spy to auto-highlight the active tab.
//   - Clicking a tab sets isScrolling=true to suppress observer callbacks
//     until the programmatic smooth-scroll completes.

import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
import { i18nSubPath } from 'src/utils/common';
import { useGrowthDataStore } from 'stores/growth-data';
import { useDeviceStore } from 'stores/device';
import type { EmotionType } from 'src/types/api/growth-data';
import { avatarsByGender, getDefaultAvatarUrl } from 'src/utils/defaultAvatars';

const i18n = i18nSubPath('pages.stack.GrowthDataPage');
const baseUrl = import.meta.env.BASE_URL;

const growthStore = useGrowthDataStore();
const deviceStore = useDeviceStore();

// ─── Child info (derived from device store) ─────────────────────────────────────
const childInfo = computed(() => {
  const ci = deviceStore.currentDevice?.childInfo;
  if (!ci) {
    return { nickname: '', gender: '' as const, age: 0, avatar: getDefaultAvatarUrl('child') };
  }
  const gender = ci.gender;
  const genderLabel = gender === 'boy' ? '男生' : '女生';
  const age = ci.birthday
    ? Math.floor((Date.now() - new Date(ci.birthday).getTime()) / (365.25 * 24 * 3600 * 1000))
    : 0;
  // Avatar: childInfo.avatar → gender default → global child default
  const avatar = ci.avatar || avatarsByGender(gender)[0]?.url || getDefaultAvatarUrl('child');
  return { nickname: ci.name, gender: genderLabel, age, avatar };
});

// ─── Tab definitions (order matches design spec) ───────────────────────────────
const tabs = computed(() => [
  { name: 'chatSummary', label: i18n('sections.chatSummary') },
  { name: 'capability', label: i18n('sections.capability') },
  { name: 'interaction', label: i18n('sections.interaction') },
  { name: 'emotion', label: i18n('sections.emotion') },
]);

const activeTab = ref('chatSummary');
const isScrolling = ref(false);

// ─── DOM refs ──────────────────────────────────────────────────────────────────
const scrollRoot = ref<HTMLElement>();
const tabBarRef = ref<HTMLElement>();

const sectionChatSummary = ref<HTMLElement>();
const sectionCapability = ref<HTMLElement>();
const sectionInteraction = ref<HTMLElement>();
const sectionEmotion = ref<HTMLElement>();

const sectionRefs: Record<string, Ref<HTMLElement | undefined>> = {
  chatSummary: sectionChatSummary,
  capability: sectionCapability,
  interaction: sectionInteraction,
  emotion: sectionEmotion,
};

// ─── Tab sticky offset ─────────────────────────────────────────────────────────
const tabBarHeight = ref(0);
let tabBarResizeObserver: ResizeObserver | null = null;

// ─── Scroll-to-section (with lock) ─────────────────────────────────────────────
let scrollEndTimer: ReturnType<typeof setTimeout> | null = null;

function scrollToSection(name: string) {
  const el = sectionRefs[name]?.value;
  const root = scrollRoot.value;
  if (!el || !root) return;

  isScrolling.value = true;
  activeTab.value = name;

  const rootRect = root.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const offset = elRect.top - rootRect.top + root.scrollTop - tabBarHeight.value;
  root.scrollTo({ top: offset, behavior: 'smooth' });

  if (scrollEndTimer) clearTimeout(scrollEndTimer);
  scrollEndTimer = setTimeout(() => {
    isScrolling.value = false;
    scrollEndTimer = null;
  }, 900);
}

function onScrollEnd() {
  isScrolling.value = false;
  if (scrollEndTimer) {
    clearTimeout(scrollEndTimer);
    scrollEndTimer = null;
  }
}

// ─── IntersectionObserver (scroll spy) ────────────────────────────────────────
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (tabBarRef.value) {
    const measure = () => {
      if (!tabBarRef.value) return;
      tabBarHeight.value = tabBarRef.value.getBoundingClientRect().height;
    };
    measure();
    tabBarResizeObserver = new ResizeObserver(measure);
    tabBarResizeObserver.observe(tabBarRef.value);
  }

  scrollRoot.value?.addEventListener('scrollend', onScrollEnd);

  // Initial data load
  loadReport();

  observer = new IntersectionObserver(
    (entries) => {
      if (isScrolling.value) return;
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const name = entry.target.getAttribute('data-section');
          if (name) activeTab.value = name;
        }
      }
    },
    {
      root: scrollRoot.value ?? null,
      rootMargin: `-${tabBarHeight.value + 20}px 0px -60% 0px`,
      threshold: 0,
    },
  );

  for (const [name, ref] of Object.entries(sectionRefs)) {
    const el = ref.value;
    if (el) {
      el.setAttribute('data-section', name);
      observer.observe(el);
    }
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  tabBarResizeObserver?.disconnect();
  tabBarResizeObserver = null;
  scrollRoot.value?.removeEventListener('scrollend', onScrollEnd);
  if (scrollEndTimer) clearTimeout(scrollEndTimer);
});

// ─── Week selector ─────────────────────────────────────────────────────────────
const weekOffset = ref(0);

/** Calculate the Monday of the current week + offset */
function getMonday(offset: number): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun..6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + diffToMonday + offset * 7,
  );
  return monday;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

const weekStartDate = computed(() => toISODate(getMonday(weekOffset.value)));

function formatDateDisplay(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

const dateRange = computed(() => {
  const r = growthStore.report;
  if (r) return `${formatDateDisplay(r.weekStart)}~${formatDateDisplay(r.weekEnd)}`;
  // Fallback: compute locally
  const start = getMonday(weekOffset.value);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${formatDateDisplay(toISODate(start))}~${formatDateDisplay(toISODate(end))}`;
});

function prevWeek() {
  weekOffset.value--;
}
function nextWeek() {
  weekOffset.value++;
}

// ─── Data loading ──────────────────────────────────────────────────────────────
function loadReport() {
  void growthStore.fetchReport(weekStartDate.value);
}

// Re-fetch when week changes
watch(weekStartDate, () => {
  loadReport();
});

// ─── Report data (derived from store) ───────────────────────────────────────────
const report = computed(() => growthStore.report);
const accompanyHours = computed(() => report.value?.accompanyHours ?? 0);

const stats = computed(() => {
  const r = report.value;
  if (!r) return [];
  return [
    { value: `${(r.weeklyInteractionMinutes / 60).toFixed(1)}小时`, label: '本周互动时长' },
    { value: r.bestCapability, label: '最佳能力' },
    { value: r.emotionAverage, label: '情绪均值' },
  ];
});

// Interaction bar chart data
const interactionDays = computed(() => report.value?.dailyInteraction.map((d) => d.date) ?? []);
const interactionValues = computed(
  () => report.value?.dailyInteraction.map((d) => d.minutes) ?? [],
);
const interactionTotal = computed(() => interactionValues.value.reduce((a, b) => a + b, 0));

// Capability radar data
const capabilityIndicators = computed(
  () => report.value?.capabilities.map((c) => ({ name: c.name, max: c.max })) ?? [],
);
const capabilityValues = computed(() => report.value?.capabilities.map((c) => c.value) ?? []);

// Emotion timeline data
const emotionTypes: readonly EmotionType[] = [
  'happy',
  'delighted',
  'calm',
  'worried',
  'sad',
] as const;
const emotionTimeline = computed(() => report.value?.emotionTimeline ?? []);

// Hot topics pie data
const hotTopicsData = computed(
  () => report.value?.hotTopics.map((t) => ({ value: t.percentage, name: t.name })) ?? [],
);

// ─── Chart color palette ───────────────────────────────────────────────────────
const PIE_COLORS = ['#20CCF9', '#56D9C8', '#8AE6A9', '#F5C842', '#9B8EC4'];

// ─── ECharts: Pie (Hot Topics donut) ───────────────────────────────────────────
const pieOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c}% ({d}%)',
  },
  color: PIE_COLORS,
  series: [
    {
      type: 'pie',
      radius: ['45%', '72%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        fontSize: 11,
        lineHeight: 16,
        color: 'rgba(74,74,74,1)',
      },
      labelLine: { length: 12, length2: 8 },
      emphasis: {
        label: { show: true, fontSize: 12, fontWeight: 'bold' },
      },
      data: hotTopicsData.value,
    },
  ],
  graphic: [
    {
      type: 'text',
      left: 'center',
      top: 'center',
      style: {
        text: i18n('sections.hotTopics'),
        textAlign: 'center',
        fill: 'rgba(74,74,74,1)',
        fontSize: 14,
        fontWeight: 500,
      },
    },
  ],
}));

// ─── ECharts: Radar (Capability) ───────────────────────────────────────────────
const radarOption = computed(() => {
  const vals = capabilityValues.value;
  return {
    tooltip: {},
    radar: {
      indicator: capabilityIndicators.value,
      shape: 'polygon',
      splitNumber: 3,
      axisName: { color: 'rgba(21,23,23,1)', fontSize: 12 },
      splitLine: { lineStyle: { color: 'rgba(0,0,0,0.08)' } },
      splitArea: {
        areaStyle: { color: ['rgba(32,204,249,0.04)', 'rgba(32,204,249,0.08)'] },
      },
      axisLine: { lineStyle: { color: 'rgba(0,0,0,0.08)' } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: vals,
            areaStyle: { color: 'rgba(32,204,249,0.35)' },
            lineStyle: { color: 'rgba(32,204,249,1)', width: 2 },
            itemStyle: { color: 'rgba(32,204,249,1)' },
            symbol: 'circle',
            symbolSize: 6,
            label: {
              show: true,
              formatter: (p: { dataIndex: number }) => {
                if (p.dataIndex === vals.length - 1) return `{val|${vals[p.dataIndex] ?? ''}}`;
                return '';
              },
              rich: { val: { fontSize: 16, fontWeight: 500, color: '#20CCF9' } },
            },
          },
        ],
      },
    ],
  };
});

// ─── ECharts: Bar (Interaction Duration) ───────────────────────────────────────
const barOption = computed(() => {
  const days = interactionDays.value;
  const vals = interactionValues.value;
  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: { name: string; value: number }[]) => {
        const p = Array.isArray(params) ? params[0] : params;
        if (!p) return '';
        return `${p.name}<br/>${p.value} ${i18n('labels.minutes')}`;
      },
    },
    grid: { left: 40, right: 16, top: 16, bottom: 24 },
    xAxis: {
      type: 'category',
      data: days,
      axisLine: { lineStyle: { color: 'rgba(0,0,0,0.1)' } },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(147,152,169,1)', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      max: 100,
      splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(147,152,169,1)', fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        data: vals,
        barWidth: '40%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(32,204,249,1)' },
              { offset: 1, color: 'rgba(129,236,223,1)' },
            ],
          },
        },
      },
    ],
  };
});

// ─── Emotion helpers ───────────────────────────────────────────────────────────
function getEmotionIcon(emotion: string) {
  const map: Record<string, string> = {
    happy: 'emotion-cheerful.png',
    delighted: 'emotion-laugh.png',
    calm: 'emotion-peaceful.png',
    worried: 'emotion-worried.png',
    sad: 'emotion-sad.png',
  };
  return `${baseUrl}lanhu-slices/growth/${map[emotion] ?? map.happy}`;
}

function getEmotionRowIndex(emotion: string) {
  return emotionTypes.indexOf(emotion as (typeof emotionTypes)[number]);
}
</script>

<template>
  <q-page class="growth-page">
    <div ref="scrollRoot" class="growth-scroll-root">
      <!-- Loading overlay -->
      <div v-if="growthStore.loading && !report" class="growth-loading-overlay">
        <q-spinner-dots color="primary" size="40px" />
        <span class="growth-loading-text">加载成长报告中...</span>
      </div>

      <!-- Error state -->
      <div v-else-if="growthStore.error && !report" class="growth-error-state">
        <q-icon name="error_outline" size="48px" color="grey-6" />
        <p class="growth-error-text">{{ growthStore.error }}</p>
        <q-btn flat color="primary" label="重试" @click="loadReport" />
      </div>

      <!-- Empty state (API returned success but no data) -->
      <div v-else-if="growthStore.isEmpty && !report" class="growth-empty-state">
        <!-- Title banner -->
        <img
          class="growth-empty-title"
          :src="`${baseUrl}lanhu-slices/growth/img_title_growth_report@2x.png`"
          alt="儿童成长数据中心"
        />

        <!-- LeBot illustration (includes robot + speech bubbles + decorations) -->
        <div class="growth-empty-illustration">
          <img :src="`${baseUrl}lanhu-slices/growth/img_lebot_empty_growth_report@2x.png`" alt="" />
        </div>

        <!-- Feature preview list -->
        <div class="growth-empty-features">
          <div class="growth-empty-feature">
            <img
              class="growth-empty-feature-icon"
              :src="`${baseUrl}lanhu-slices/growth/img_chat_summary_growth_report_empty@2x.png`"
              alt=""
            />
            <div class="growth-empty-feature-text">
              <div class="growth-empty-feature-title">每日聊天摘要</div>
              <div class="growth-empty-feature-desc">每天自动生成有趣的聊天摘要</div>
            </div>
          </div>
          <div class="growth-empty-feature">
            <img
              class="growth-empty-feature-icon"
              :src="`${baseUrl}lanhu-slices/growth/img_child_ability_growth_report_empty@2x.png`"
              alt=""
            />
            <div class="growth-empty-feature-text">
              <div class="growth-empty-feature-title">儿童能力发展分析</div>
              <div class="growth-empty-feature-desc">语言/逻辑/社交/知识/想象力</div>
            </div>
          </div>
          <div class="growth-empty-feature">
            <img
              class="growth-empty-feature-icon"
              :src="`${baseUrl}lanhu-slices/growth/img_week_story_growth_report_empty@2x.png`"
              alt=""
            />
            <div class="growth-empty-feature-text">
              <div class="growth-empty-feature-title">每周成长故事</div>
              <div class="growth-empty-feature-desc">用温暖的故事记录成长点滴</div>
            </div>
          </div>
          <div class="growth-empty-feature">
            <img
              class="growth-empty-feature-icon"
              :src="`${baseUrl}lanhu-slices/growth/img_advice_growth_report_empty@2x.png`"
              alt=""
            />
            <div class="growth-empty-feature-text">
              <div class="growth-empty-feature-title">给家长的引导建议</div>
              <div class="growth-empty-feature-desc">具体可操作的日常互动技巧</div>
            </div>
          </div>
        </div>

        <!-- Tip ribbon -->
        <img
          class="growth-empty-tip"
          :src="`${baseUrl}lanhu-slices/growth/img_tip_growth_report_empty@2x.png`"
          alt=""
        />

        <div class="growth-bottom-safe" />
      </div>

      <!-- Main content -->
      <template v-else>
        <!-- ═══ Hero area ═══ -->
        <div class="growth-hero">
          <img
            class="growth-hero-img"
            :src="`${baseUrl}lanhu-slices/growth/img-top-title.png`"
            alt=""
          />
          <img
            class="growth-hero-character"
            :src="`${baseUrl}lanhu-slices/growth/img-data.png`"
            alt=""
          />
          <!-- Date selector (overlaid top-left) -->
          <div class="growth-hero-date">
            <button class="growth-week-btn" @click="prevWeek">
              <q-icon name="chevron_left" size="16px" />
            </button>
            <span class="growth-hero-date-text">{{ dateRange }}</span>
            <button class="growth-week-btn" @click="nextWeek">
              <q-icon name="chevron_right" size="16px" />
            </button>
          </div>
          <!-- Companion badge (overlaid bottom-right) -->
          <div class="growth-hero-companion">
            <q-icon name="schedule" size="12px" color="white" class="q-mr-xs" />
            <span>乐宝已陪伴你{{ accompanyHours }}小时</span>
          </div>
        </div>

        <!-- ═══ User info card ═══ -->
        <div class="growth-user-card">
          <div class="growth-user-row">
            <div class="growth-user-avatar">
              <img :src="childInfo.avatar" alt="" />
            </div>
            <div class="growth-user-info">
              <div class="growth-user-name">{{ childInfo.nickname }}</div>
              <div class="growth-user-meta">
                {{ childInfo.gender }}&nbsp;&nbsp;{{ childInfo.age }}岁
              </div>
            </div>
          </div>
          <div class="growth-stats-card">
            <div v-for="(stat, i) in stats" :key="i" class="growth-stat-item">
              <div class="growth-stat-value">{{ stat.value }}</div>
              <div class="growth-stat-label">{{ stat.label }}</div>
              <div v-if="i < stats.length - 1" class="growth-stat-divider" />
            </div>
          </div>
        </div>

        <!-- ═══ Sticky Tab bar ═══ -->
        <div ref="tabBarRef" class="growth-tab-bar">
          <button
            v-for="tab in tabs"
            :key="tab.name"
            class="growth-anchor-tab"
            :class="{ 'growth-anchor-tab--active': activeTab === tab.name }"
            @click="scrollToSection(tab.name)"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- ── Section: 聊天摘要 + 高频话题饼图 ── -->
        <div ref="sectionChatSummary" class="growth-section-card" data-section="chatSummary">
          <div class="growth-section-header">
            <div class="growth-accent-bar" />
            <span class="growth-section-title">{{ i18n('sections.chatSummary') }}</span>
            <span class="growth-section-link">{{ i18n('labels.viewReport') }}</span>
            <q-icon name="chevron_right" size="16px" color="grey-6" />
          </div>
          <div class="growth-chart-wrap">
            <v-chart :option="pieOption" autoresize style="height: 260px" />
          </div>
          <div class="growth-summary">
            <span class="growth-summary-tag">{{ i18n('labels.chatSummary') }}</span>
            <p class="growth-summary-text">{{ report?.summaries?.chatSummary ?? '' }}</p>
          </div>
        </div>

        <!-- ── Section: 能力发展 (雷达图) ── -->
        <div ref="sectionCapability" class="growth-section-card" data-section="capability">
          <div class="growth-section-header">
            <div class="growth-accent-bar" />
            <span class="growth-section-title">{{ i18n('sections.capability') }}</span>
            <span class="growth-section-link">{{ i18n('labels.viewReport') }}</span>
            <q-icon name="chevron_right" size="16px" color="grey-6" />
          </div>
          <div class="growth-chart-wrap">
            <v-chart :option="radarOption" autoresize style="height: 260px" />
          </div>
          <div class="growth-summary">
            <span class="growth-summary-tag">{{ i18n('labels.summary') }}</span>
            <p class="growth-summary-text">{{ report?.summaries?.capabilitySummary ?? '' }}</p>
          </div>
        </div>

        <!-- ── Section: 互动时长 (柱状图) ── -->
        <div ref="sectionInteraction" class="growth-section-card" data-section="interaction">
          <div class="growth-section-header">
            <div class="growth-accent-bar" />
            <span class="growth-section-title">{{ i18n('sections.interaction') }}</span>
            <span class="growth-section-link">{{ i18n('labels.viewReport') }}</span>
            <q-icon name="chevron_right" size="16px" color="grey-6" />
          </div>
          <div class="growth-chart-wrap">
            <v-chart :option="barOption" autoresize style="height: 220px" />
          </div>
          <div class="growth-interaction-total">
            <span class="growth-interaction-total-value">{{ interactionTotal }}</span>
            <span class="growth-interaction-total-label">&nbsp;{{ i18n('labels.minutes') }}</span>
          </div>
          <div class="growth-summary">
            <span class="growth-summary-tag">{{ i18n('labels.summary') }}</span>
            <p class="growth-summary-text">{{ report?.summaries?.interactionSummary ?? '' }}</p>
          </div>
        </div>

        <!-- ── Section: 情绪变化 (Timeline + Emotion Icons) ── -->
        <div ref="sectionEmotion" class="growth-section-card" data-section="emotion">
          <div class="growth-section-header">
            <div class="growth-accent-bar" />
            <span class="growth-section-title">{{ i18n('sections.emotion') }}</span>
          </div>

          <div class="growth-emotion-timeline">
            <!-- Date header row -->
            <div class="growth-emotion-dates">
              <span v-for="d in emotionTimeline" :key="d.date" class="growth-emotion-date">
                {{ d.date }}
              </span>
            </div>
            <!-- Emotion grid: 5 rows (one per emotion) x 7 columns (one per day) -->
            <div class="growth-emotion-grid">
              <div v-for="eType in emotionTypes" :key="eType" class="growth-emotion-row">
                <span class="growth-emotion-label">{{ i18n(`emotions.${eType}`) }}</span>
                <div
                  v-for="(day, colIdx) in emotionTimeline"
                  :key="colIdx"
                  class="growth-emotion-cell"
                >
                  <img
                    v-if="day.emotion === eType"
                    :src="getEmotionIcon(day.emotion)"
                    :alt="day.emotion"
                    class="growth-emotion-icon"
                  />
                </div>
              </div>
            </div>
            <!-- SVG trend line overlay -->
            <svg class="growth-emotion-trend" viewBox="0 0 700 200" preserveAspectRatio="none">
              <polyline
                :points="
                  emotionTimeline
                    .map((d, i) => `${i * 100 + 50},${getEmotionRowIndex(d.emotion) * 50 + 25}`)
                    .join(' ')
                "
                fill="none"
                stroke="rgba(32,204,249,0.4)"
                stroke-width="3"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
            </svg>
          </div>

          <div class="growth-summary">
            <span class="growth-summary-tag">{{ i18n('labels.summary') }}</span>
            <p class="growth-summary-text">{{ report?.summaries?.emotionSummary ?? '' }}</p>
          </div>
        </div>

        <div class="growth-bottom-safe" />
      </template>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
// ═══ Page root ═══
.growth-page {
  background: var(--growth-page-bg);
  position: relative !important;
  display: block !important;
  flex: 1 1 auto !important;
  height: 100% !important;
  min-height: 0 !important;
  max-height: 100% !important;
  overflow: hidden !important;
}

// ═══ Single scroll root ═══
.growth-scroll-root {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  z-index: 1;
}

// ═══ Hero area ═══
.growth-hero {
  position: relative;
  width: 100%;
  aspect-ratio: 690 / 652;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    rgba(114, 228, 218, 1) 0%,
    rgba(236, 255, 246, 1) 70%,
    rgba(236, 255, 246, 1) 100%
  );
}

.growth-hero-img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
}

.growth-hero-character {
  position: absolute;
  right: 3%;
  bottom: 35%;
  width: 40%;
  height: auto;
  z-index: 2;
  pointer-events: none;
}

.growth-hero-date {
  position: absolute;
  top: 42%;
  left: 8%;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 3;
  background: rgba(255, 255, 255, 0.6);
  padding: 4px 8px;
  border-radius: 16px;
}

.growth-week-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  color: rgba(51, 51, 51, 0.7);
  -webkit-tap-highlight-color: transparent;

  &:active {
    background: rgba(0, 0, 0, 0.05);
  }
}

.growth-hero-date-text {
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
  color: rgba(51, 51, 51, 1);
  min-width: 130px;
  text-align: center;
}

.growth-hero-companion {
  position: absolute;
  bottom: 31%;
  right: 4.8%;
  display: flex;
  align-items: center;
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: 600;
  line-height: 16px;
  color: rgba(32, 204, 249, 1);
  background: rgba(131, 217, 239, 0.35);
  border-radius: 12px;
  padding: 5px 18px;
  z-index: 11;
}

// ═══ User info card ═══
.growth-user-card {
  position: relative;
  z-index: 10;
  margin-top: calc(-37% * 652 / 690);
  margin-left: 18px;
  margin-right: 18px;
  background: var(--clr-white, rgba(255, 255, 255, 1));
  border-radius: var(--growth-card-radius, 12px);
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.growth-user-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.growth-user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: rgba(134, 224, 248, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.growth-user-name {
  font-family: var(--font-family);
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  color: var(--clr-growth-section-title, rgba(21, 23, 23, 1));
}

.growth-user-meta {
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
  color: var(--clr-growth-section-caption, rgba(147, 152, 169, 1));
  margin-top: 2px;
}

// ═══ Stats row ═══
.growth-stats-card {
  display: flex;
  align-items: center;
  margin-top: 16px;
  background: var(--clr-growth-stats-bg, rgba(241, 249, 248, 1));
  border-radius: var(--growth-card-radius, 12px);
  padding: 14px 0;
}

.growth-stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
}

.growth-stat-value {
  font-family: 'Roboto', var(--font-family);
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
  color: var(--clr-growth-section-title, rgba(21, 23, 23, 1));
}

.growth-stat-label {
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
  color: var(--clr-growth-section-caption, rgba(147, 152, 169, 1));
}

.growth-stat-divider {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 24px;
  background: var(--clr-growth-stats-divider, rgba(32, 204, 249, 1));
}

// ═══ Sticky Tab bar ═══
.growth-tab-bar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  gap: 24px;
  padding: 0 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(180deg, rgba(236, 255, 246, 1) 0%, rgba(255, 255, 255, 1) 100%);
  margin: 0 18px var(--growth-section-gap, 16px);
}

.growth-anchor-tab {
  background: none;
  border: none;
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: 400;
  color: rgba(21, 23, 23, 1);
  padding: 10px 4px;
  cursor: pointer;
  position: relative;
  min-height: 38px;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;

  &--active {
    color: var(--growth-tab-active-color, rgba(32, 204, 249, 1));
    font-weight: 500;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 3px;
      background: var(--growth-tab-active-color, rgba(32, 204, 249, 1));
      border-radius: 1.5px;
    }
  }
}

// ═══ Section cards ═══
.growth-section-card {
  background: var(--clr-white, rgba(255, 255, 255, 1));
  border-radius: var(--growth-card-radius, 12px);
  padding: 16px;
  margin: 0 16px var(--growth-section-gap, 16px);
}

.growth-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.growth-accent-bar {
  width: 3px;
  height: 16px;
  border-radius: 1.5px;
  background: linear-gradient(
    180deg,
    var(--clr-growth-accent-bar-top, rgba(129, 236, 223, 1)) 0%,
    var(--clr-growth-accent-bar-bottom, rgba(32, 204, 249, 1)) 100%
  );
  flex-shrink: 0;
}

.growth-section-title {
  font-family: var(--font-family);
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-growth-section-title, rgba(21, 23, 23, 1));
}

.growth-section-link {
  margin-left: auto;
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: 400;
  color: rgba(99, 104, 104, 1);
  cursor: pointer;
}

.growth-chart-wrap {
  width: 100%;
  margin: 8px 0;
}

// ═══ Summary block ═══
.growth-summary {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.growth-summary-tag {
  display: inline-block;
  background: var(--clr-growth-summary-tag-bg, rgba(18, 14, 44, 1));
  color: var(--clr-growth-summary-tag-text, rgba(255, 255, 255, 1));
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  padding: 2px 9px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.growth-summary-text {
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;
  color: var(--clr-growth-summary-text, rgba(74, 74, 74, 1));
  margin: 0;
}

// ═══ Interaction total ═══
.growth-interaction-total {
  text-align: center;
  padding: 8px 0 4px;
}

.growth-interaction-total-value {
  font-family: 'Roboto', var(--font-family);
  font-size: 28px;
  font-weight: 600;
  color: var(--clr-growth-section-title, rgba(21, 23, 23, 1));
}

.growth-interaction-total-label {
  font-family: var(--font-family);
  font-size: 14px;
  color: var(--clr-growth-section-caption, rgba(147, 152, 169, 1));
}

// ═══ Emotion timeline ═══
.growth-emotion-timeline {
  position: relative;
  padding: 8px 0 16px;
}

.growth-emotion-dates {
  display: flex;
  justify-content: space-around;
  margin-bottom: 8px;
  padding-left: 40px;
}

.growth-emotion-date {
  flex: 1;
  text-align: center;
  font-family: 'Roboto', var(--font-family);
  font-size: 11px;
  color: var(--clr-growth-section-caption, rgba(147, 152, 169, 1));
}

.growth-emotion-grid {
  position: relative;
  z-index: 2;
}

.growth-emotion-row {
  display: flex;
  align-items: center;
  height: 40px;
}

.growth-emotion-label {
  width: 40px;
  flex-shrink: 0;
  font-family: var(--font-family);
  font-size: 11px;
  color: var(--clr-growth-section-caption, rgba(147, 152, 169, 1));
  text-align: right;
  padding-right: 8px;
}

.growth-emotion-cell {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
}

.growth-emotion-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.growth-emotion-trend {
  position: absolute;
  top: 28px;
  left: 40px;
  right: 0;
  height: calc(5 * 40px);
  z-index: 1;
  pointer-events: none;
  opacity: 0.5;
}

// ═══ Loading & Error states ═══
.growth-loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
}

.growth-loading-text {
  font-family: var(--font-family);
  font-size: 14px;
  color: var(--clr-growth-section-caption, rgba(147, 152, 169, 1));
}

.growth-error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 12px;
}

.growth-error-text {
  font-family: var(--font-family);
  font-size: 14px;
  color: var(--clr-growth-section-caption, rgba(147, 152, 169, 1));
  text-align: center;
  margin: 0;
}

.growth-bottom-safe {
  height: 80px;
  flex-shrink: 0;
}

// ═══ Empty state ═══
.growth-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
  background: linear-gradient(
    180deg,
    rgba(114, 228, 218, 1) 0%,
    rgba(236, 255, 246, 1) 20%,
    rgba(245, 247, 250, 1) 50%,
    rgba(245, 247, 250, 1) 100%
  );
}

.growth-empty-title {
  width: 300px;
  height: auto;
  margin-top: 28px;
  display: block;
}

.growth-empty-illustration {
  width: 100%;
  max-width: 360px;
  margin-top: 8px;

  img {
    width: 100%;
    height: auto;
    display: block;
  }
}

.growth-empty-features {
  width: 100%;
  background: rgba(255, 255, 255, 1);
  border-radius: 12px;
  padding: 20px 16px;
  margin-top: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.growth-empty-feature {
  display: flex;
  align-items: center;
  gap: 16px;

  & + & {
    margin-top: 20px;
  }
}

.growth-empty-feature-icon {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  object-fit: contain;
}

.growth-empty-feature-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.growth-empty-feature-title {
  font-family: var(--font-family);
  font-size: 17px;
  font-weight: 500;
  line-height: 24px;
  color: rgba(21, 23, 23, 1);
}

.growth-empty-feature-desc {
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 400;
  line-height: 22px;
  color: rgba(99, 104, 104, 1);
}

.growth-empty-tip {
  width: 343px;
  max-width: 100%;
  height: auto;
  margin-top: 20px;
  display: block;
}
</style>
