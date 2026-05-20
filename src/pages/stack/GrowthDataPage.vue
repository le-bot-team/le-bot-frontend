<script setup lang="ts">
// GrowthDataPage — design eaf176a6 (成长数据中心, 375×2242 artboard).
//
// Layout: long-scroll mobile viewport with page-level gradient background +
// two radial glow layers. Content: fixed header + overview card + 4 sections
// (情绪变化 / 互动时长 / 能力发展 / 高频话题) rendered in one scroll flow.
// Top tabs act as anchor links — clicking scrolls to the corresponding section.
//
// Charts: ECharts (v6) via vue-echarts for multiline/bar/radar/pie.
// Replace mock data with API data when backend is ready.

import { computed, onBeforeUnmount, onMounted, ref, shallowRef, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart, RadarChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  RadarComponent,
  LegendComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';

import OverviewCard from 'components/growth-data/OverviewCard.vue';
import { i18nSubPath } from 'src/utils/common';

// Register ECharts modules (tree-shaking)
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  RadarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  RadarComponent,
  LegendComponent,
]);

const i18n = i18nSubPath('pages.stack.GrowthDataPage');

const router = useRouter();
const baseUrl = import.meta.env.BASE_URL;

// --- Active tab (for anchor highlight) ---
const activeTab = ref('emotion');
const tabs = computed(() => [
  { name: 'emotion', label: i18n('sections.emotion') },
  { name: 'interaction', label: i18n('sections.interaction') },
  { name: 'capability', label: i18n('sections.capability') },
  { name: 'hotTopics', label: i18n('sections.hotTopics') },
]);

// --- Section refs for anchor scrolling ---
const sectionEmotion = ref<HTMLElement>();
const sectionInteraction = ref<HTMLElement>();
const sectionCapability = ref<HTMLElement>();
const sectionHotTopics = ref<HTMLElement>();
const scrollableContainer = ref<HTMLElement>();

// Fixed-top wrapper (title + overview + tab bar). We measure its rendered
// height via ResizeObserver and feed it into a CSS variable on the page
// root, so .growth-scrollable can anchor right below it regardless of how
// tall the overview card becomes (i18n, dynamic content, etc.).
const fixedTopRef = ref<HTMLElement>();
const fixedTopHeight = ref(0);
let fixedTopResizeObserver: ResizeObserver | null = null;

const sectionRefs: Record<string, Ref<HTMLElement | undefined>> = {
  emotion: sectionEmotion,
  interaction: sectionInteraction,
  capability: sectionCapability,
  hotTopics: sectionHotTopics,
};

function scrollToSection(name: string) {
  const el = sectionRefs[name]?.value;
  const container = scrollableContainer.value;
  if (!el || !container) return;

  // IMPORTANT: avoid el.scrollIntoView() — it scrolls ALL scrollable ancestors
  // (including q-page-container), causing the whole page to shift. Instead we
  // compute the offset within the scroll container and only scroll the
  // container itself, keeping the header + tab bar visually fixed.
  const containerRect = container.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const nextTop = container.scrollTop + (elRect.top - containerRect.top);
  container.scrollTo({ top: nextTop, behavior: 'smooth' });
}

// --- ScrollSpy: IntersectionObserver updates activeTab ---
let observer: IntersectionObserver | null = null;

onMounted(() => {
  // Measure the fixed-top zone (title + overview + tab bar) and expose its
  // height through a reactive ref -> CSS variable.
  if (fixedTopRef.value) {
    const applyHeight = () => {
      if (!fixedTopRef.value) return;
      fixedTopHeight.value = fixedTopRef.value.getBoundingClientRect().height;
    };
    applyHeight();
    fixedTopResizeObserver = new ResizeObserver(applyHeight);
    fixedTopResizeObserver.observe(fixedTopRef.value);
  }

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const name = entry.target.getAttribute('data-section');
          if (name) activeTab.value = name;
        }
      }
    },
    {
      root: scrollableContainer.value ?? null,
      rootMargin: '-20% 0px -70% 0px',
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
  fixedTopResizeObserver?.disconnect();
  fixedTopResizeObserver = null;
});

// --- Mock data ---
const dateRange = computed<string>(() => i18n('mock.dateRange'));
const bestCapability = computed<string>(() => i18n('mock.bestCapability'));
const hotTopic = computed<string>(() => i18n('mock.hotTopic'));

// Emotion multiline chart mock (5 emotions × 7 days)
const emotionDays = ['5.12', '5.13', '5.14', '5.15', '5.16', '5.17', '5.18'];

interface EmotionEntry {
  key: string;
  label: string;
  color: string;
  data: number[];
  dashed?: boolean;
}

const emotionSeries = computed<EmotionEntry[]>(() => [
  { key: 'happy', label: i18n('emotions.happy'), color: 'rgba(32,204,249,1)', data: [80, 75, 82, 78, 85, 88, 90] },
  { key: 'delighted', label: i18n('emotions.delighted'), color: 'rgba(129,236,223,1)', data: [65, 60, 68, 72, 70, 75, 78] },
  { key: 'calm', label: i18n('emotions.calm'), color: 'rgba(200,200,200,1)', data: [40, 45, 42, 38, 40, 35, 32], dashed: true },
  { key: 'worried', label: i18n('emotions.worried'), color: 'rgba(255,183,77,1)', data: [15, 12, 18, 20, 15, 10, 8] },
  { key: 'sad', label: i18n('emotions.sad'), color: 'rgba(255,138,128,1)', data: [5, 8, 6, 4, 3, 5, 2] },
]);

const emotionOption = computed(() => ({
  grid: { left: 8, right: 16, top: 12, bottom: 28 },
  xAxis: {
    type: 'category' as const,
    data: emotionDays,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: 'rgba(74,74,74,1)', fontSize: 10, fontFamily: 'Roboto' },
  },
  yAxis: {
    type: 'value' as const,
    max: 100,
    min: 0,
    splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } },
    axisLabel: { show: false },
  },
  series: emotionSeries.value.map((e) => ({
    name: e.label,
    type: 'line' as const,
    data: e.data,
    smooth: true,
    symbol: 'circle',
    symbolSize: 4,
    lineStyle: { color: e.color, width: 2, ...(e.dashed ? { type: 'dashed' as const } : {}) },
    itemStyle: { color: e.color },
  })),
  tooltip: { trigger: 'axis' as const },
}));

// Interaction bar chart mock
const interactionDays = ['5.12', '5.13', '5.14', '5.15', '5.16', '5.17', '5.18'];
const interactionValues = [72, 139, 55, 29, 90, 120, 65];
const weeklyTotalMinutes = 276;

const interactionOption = shallowRef({
  grid: { left: 32, right: 16, top: 16, bottom: 32 },
  xAxis: {
    type: 'category' as const,
    data: interactionDays,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: 'rgba(74,74,74,1)', fontSize: 10, fontFamily: 'Roboto' },
  },
  yAxis: {
    type: 'value' as const,
    max: 160,
    splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } },
    axisLabel: { color: 'rgba(74,74,74,1)', fontSize: 10 },
  },
  series: [
    {
      type: 'bar' as const,
      data: interactionValues,
      barWidth: 12,
      itemStyle: {
        color: 'rgba(32,204,249,1)',
        borderRadius: [3, 3, 0, 0],
      },
    },
  ],
  tooltip: { trigger: 'axis' as const },
});

// Capability radar mock
const capabilityData = computed(() => [
  { name: i18n('capabilities.socialUnderstanding'), value: 38 },
  { name: i18n('capabilities.knowledgeIntegration'), value: 30 },
  { name: i18n('capabilities.imagination'), value: 22 },
  { name: i18n('capabilities.emotionalExpression'), value: 20 },
  { name: i18n('capabilities.logicalThinking'), value: 32 },
]);

const radarOption = computed(() => ({
  radar: {
    indicator: capabilityData.value.map((d) => ({ name: d.name, max: 100 })),
    radius: '65%',
    center: ['50%', '50%'],
    axisName: { color: 'rgba(21,23,23,1)', fontSize: 10 },
    splitArea: { areaStyle: { color: ['transparent'] } },
    splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } },
    axisLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } },
  },
  series: [
    {
      type: 'radar' as const,
      data: [
        {
          value: capabilityData.value.map((d) => d.value),
          name: i18n('sections.capability'),
          areaStyle: { color: 'rgba(32,204,249,0.3)' },
          lineStyle: { color: 'rgba(32,204,249,1)', width: 2 },
          itemStyle: { color: 'rgba(32,204,249,1)' },
        },
      ],
    },
  ],
}));

// Hot topics pie mock
const hotTopicsData = computed(() => [
  { name: i18n('hotTopics.draw'), value: 11, color: 'rgba(117,221,255,1)' },
  { name: i18n('hotTopics.playhouse'), value: 37, color: 'rgba(131,224,210,1)' },
  { name: i18n('hotTopics.ultraman'), value: 19, color: 'rgba(225,255,118,1)' },
  { name: i18n('hotTopics.plantsVsZombies'), value: 20, color: 'rgba(255,221,127,1)' },
  { name: i18n('hotTopics.other'), value: 13, color: 'rgba(245,255,219,1)' },
]);

const pieOption = computed(() => ({
  tooltip: { trigger: 'item' as const },
  legend: { show: false },
  series: [
    {
      type: 'pie' as const,
      radius: ['0%', '70%'],
      center: ['50%', '50%'],
      data: hotTopicsData.value.map((d) => ({
        name: d.name,
        value: d.value,
        itemStyle: { color: d.color },
      })),
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        fontSize: 10,
        color: 'rgba(74,74,74,1)',
        lineHeight: 14,
      },
      labelLine: { length: 8, length2: 12 },
    },
  ],
}));

// Chart init theme (transparent bg)
const chartInitOpts = { renderer: 'canvas' as const };
</script>

<template>
  <q-page class="growth-page" :style="{ '--growth-fixed-top-height': fixedTopHeight + 'px' }">
    <!-- Glow layers -->
    <div class="growth-glow growth-glow--171" aria-hidden="true" />
    <div class="growth-glow growth-glow--172" aria-hidden="true" />

    <!-- Top decoration images (fixed, not scrollable) -->
    <div class="growth-decorations" aria-hidden="true">
      <img class="growth-decor-top" :src="`${baseUrl}lanhu-slices/img-1.webp`" alt="" />
      <img class="growth-decor-illust" :src="`${baseUrl}lanhu-slices/img-2.webp`" alt="" />
      <img class="growth-decor-board" :src="`${baseUrl}lanhu-slices/img-3.webp`" alt="" />
    </div>

    <!--
      Fixed-top zone: title + overview card + tab bar.
      Absolutely positioned so it stays pinned to the top of the page
      regardless of how the content below scrolls. Its measured height is
      exposed as --growth-fixed-top-height for the scrollable area to anchor.
    -->
    <div ref="fixedTopRef" class="growth-fixed-top">
      <div class="growth-content">
        <!-- Page title + date -->
        <div class="growth-header">
          <h1 class="growth-page-title q-ma-none">{{ i18n('title') }}</h1>
          <div class="growth-page-date q-mt-xs">{{ dateRange }}</div>
        </div>

        <!-- Profile + Stats overview card -->
        <overview-card
          nickname="绵绵"
          gender="female"
          :age="5"
          :weekly-interact="4.6"
          :best-capability="bestCapability"
          :hot-topic="hotTopic"
          :accompany-hours="105"
        />
      </div>

      <!-- Anchor Tab bar (fixed under overview, outside scroll) -->
      <div class="growth-tab-bar">
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
    </div>

    <!-- ==================== Scrollable sections ==================== -->
    <div ref="scrollableContainer" class="growth-scrollable">
      <!-- ==================== Section: 情绪变化 ==================== -->
      <div ref="sectionEmotion" class="growth-section-card">
        <div class="growth-section-header">
          <div class="growth-accent-bar" />
          <span class="growth-section-title q-ma-none">{{ i18n('sections.emotion') }}</span>
        </div>
        <div class="growth-chart-wrap growth-chart-wrap--with-axis-labels">
          <div class="emotion-axis-labels">
            <span
              v-for="e in emotionSeries"
              :key="e.key"
              class="emotion-axis-label"
              :style="{ color: e.color, fontSize: '10px' }"
            >
              {{ e.label }}
            </span>
          </div>
          <v-chart
            :option="emotionOption"
            :init-options="chartInitOpts"
            autoresize
            class="growth-chart"
          />
        </div>
        <q-separator color="grey-3" class="q-my-sm" />
        <div class="row items-center q-mb-xs">
          <span class="growth-summary-tag">{{ i18n('labels.summary') }}</span>
        </div>
        <p class="growth-summary-text q-ma-none">{{ i18n('mock.emotionSummary') }}</p>
      </div>

      <!-- ==================== Section: 互动时长 ==================== -->
      <div ref="sectionInteraction" class="growth-section-card">
        <div class="growth-section-header">
          <div class="growth-accent-bar" />
          <span class="growth-section-title q-ma-none">{{ i18n('sections.interaction') }}</span>
        </div>
        <div class="growth-chart-wrap">
          <v-chart
            :option="interactionOption"
            :init-options="chartInitOpts"
            autoresize
            class="growth-chart"
          />
        </div>
        <q-separator color="grey-3" class="q-my-sm" />
        <div class="row items-center justify-between q-mb-sm">
          <span class="growth-section-caption">{{ i18n('labels.weeklyInteraction') }}</span>
          <div class="row items-baseline q-gutter-x-xs">
            <span class="growth-total-value">{{ weeklyTotalMinutes }}</span>
            <span class="growth-section-caption">{{ i18n('labels.minutes') }}</span>
          </div>
        </div>
      </div>

      <!-- ==================== Section: 能力发展 ==================== -->
      <div ref="sectionCapability" class="growth-section-card">
        <div class="growth-section-header">
          <div class="growth-accent-bar" />
          <span class="growth-section-title q-ma-none">{{ i18n('sections.capability') }}</span>
          <span
            class="growth-view-report"
            role="button"
            tabindex="0"
            @click="router.push({ name: 'growth-data-capability-detail', params: { capabilityKey: 'emotionalExpression' } })"
            @keydown.enter="router.push({ name: 'growth-data-capability-detail', params: { capabilityKey: 'emotionalExpression' } })"
            @keydown.space.prevent="router.push({ name: 'growth-data-capability-detail', params: { capabilityKey: 'emotionalExpression' } })"
          >
            {{ i18n('labels.viewReport') }}
            <img class="growth-arrow-icon" :src="`${baseUrl}lanhu-slices/icon-3.webp`" alt="" />
          </span>
        </div>
        <div class="growth-chart-wrap">
          <v-chart
            :option="radarOption"
            :init-options="chartInitOpts"
            autoresize
            class="growth-chart growth-chart--radar"
          />
        </div>
        <q-separator color="grey-3" class="q-my-sm" />
        <div class="row items-center q-mb-xs">
          <span class="growth-summary-tag">{{ i18n('labels.summary') }}</span>
        </div>
        <p class="growth-summary-text q-ma-none">{{ i18n('mock.capabilitySummary') }}</p>
      </div>

      <!-- ==================== Section: 高频话题 ==================== -->
      <div ref="sectionHotTopics" class="growth-section-card">
        <div class="growth-section-header">
          <div class="growth-accent-bar" />
          <span class="growth-section-title q-ma-none">{{ i18n('sections.hotTopics') }}</span>
          <span
            class="growth-view-report"
            role="button"
            tabindex="0"
            @click="router.push({ name: 'growth-data-weekly-report' })"
            @keydown.enter="router.push({ name: 'growth-data-weekly-report' })"
            @keydown.space.prevent="router.push({ name: 'growth-data-weekly-report' })"
          >
            {{ i18n('labels.viewReport') }}
            <img class="growth-arrow-icon" :src="`${baseUrl}lanhu-slices/icon-3.webp`" alt="" />
          </span>
        </div>
        <div class="growth-chart-wrap">
          <v-chart
            :option="pieOption"
            :init-options="chartInitOpts"
            autoresize
            class="growth-chart growth-chart--pie"
          />
        </div>
        <q-separator color="grey-3" class="q-my-sm" />
        <div class="row items-center q-mb-xs">
          <span class="growth-summary-tag">{{ i18n('labels.summary') }}</span>
        </div>
        <p class="growth-summary-text q-ma-none">{{ i18n('mock.hotTopicsSummary') }}</p>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
// ===== Page: flex column, locked to viewport, NO page scroll =====
.growth-page {
  background: var(--growth-page-bg);
  // CRITICAL: strip Quasar's default min-height: calc(100vh - X) so the page
  // can't outgrow its container, and force its box to fill the parent flex
  // column (q-page-container has `height: 100vh; display: flex`).
  position: relative !important;
  display: block !important;
  flex: 1 1 auto !important;
  height: 100% !important;
  min-height: 0 !important;
  max-height: 100% !important;
  overflow: hidden !important;
}

.growth-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.growth-glow--171 {
  left: var(--growth-glow-171-left);
  top: var(--growth-glow-171-top);
  width: var(--growth-glow-171-size);
  height: var(--growth-glow-171-size);
  opacity: var(--growth-glow-171-opacity);
  background: var(--growth-glow-171-gradient);
}

.growth-glow--172 {
  left: var(--growth-glow-172-left);
  top: var(--growth-glow-172-top);
  width: var(--growth-glow-172-size);
  height: var(--growth-glow-172-size);
  opacity: var(--growth-glow-172-opacity);
  background: var(--growth-glow-172-gradient);
}

// --- Top decoration images (absolute, inside flex child) ---
.growth-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  height: 340px;
}

.growth-decor-top {
  position: absolute;
  left: 0;
  top: -60px;
  width: 345px;
  height: 326px;
}

.growth-decor-illust {
  position: absolute;
  right: 0;
  top: 100px;
  width: 170px;
  height: 162px;
}

.growth-decor-board {
  position: absolute;
  right: -30px;
  top: 80px;
  width: 181px;
  height: 176px;
}

// --- Fixed-top zone: title + overview + tab bar (pinned, never scrolls) ---
// Absolutely positioned inside .growth-page. Its height is measured at
// runtime (see fixedTopRef / ResizeObserver) and exported via the CSS
// variable --growth-fixed-top-height, which the scrollable area uses as its
// `top` offset so it starts right below this zone.
.growth-fixed-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  pointer-events: auto;
}

// --- Fixed top: title + overview (never scrolls) ---
.growth-content {
  position: relative;
  z-index: 1;
  padding: 0 16px;
}

// --- Fixed tab bar (never scrolls) ---
// Rendered inside .growth-fixed-top so it's absolutely pinned along with the
// title + overview. Kept as a normal block-flow child inside that wrapper.
.growth-tab-bar {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0 20px;
  position: relative;
  z-index: 10;
  background: linear-gradient(180deg, rgba(236, 255, 246, 1) 0%, rgba(255, 255, 255, 1) 100%);
}

// ===== THE ONLY SCROLLABLE AREA =====
// Absolutely positioned inside .growth-page, anchored right below the
// fixed-top zone via --growth-fixed-top-height (computed from JS). This
// completely isolates scrolling here: neither the page, the tab bar, nor the
// title/overview can move. overscroll-behavior: contain also blocks scroll
// chaining to q-page-container / body on mobile fling gestures.
.growth-scrollable {
  position: absolute;
  top: var(--growth-fixed-top-height, 0px);
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  padding: 0 16px 24px;
  -webkit-overflow-scrolling: touch;
  z-index: 1;
}

.growth-header {
  padding-top: 48px;
  margin-bottom: 16px;
}

.growth-anchor-tab {
  background: none;
  border: none;
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: 400;
  color: rgba(21, 23, 23, 1);
  padding: 8px 4px;
  cursor: pointer;
  position: relative;
  min-height: 36px;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;

  &--active {
    color: var(--growth-tab-active-color);
    font-weight: 500;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 16px;
      background: var(--growth-tab-active-color);
      border-radius: 1px;
    }
  }
}

// --- Section card ---
.growth-section-card {
  background: var(--clr-white, rgba(255, 255, 255, 1));
  border-radius: var(--growth-card-radius);
  padding: 16px;
  margin-bottom: var(--growth-section-gap);
}

.growth-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.growth-chart-wrap {
  position: relative;
}

.growth-chart-wrap--with-axis-labels {
  display: flex;
  align-items: center;
  gap: 4px;
}

.emotion-axis-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 220px;
  width: 36px;
  flex-shrink: 0;
}

.emotion-axis-label {
  font-family: 'Roboto', var(--font-family);
  line-height: 1;
}

.growth-chart {
  width: 100%;
  height: 220px;
}

.growth-chart--radar {
  height: 280px;
}

.growth-chart--pie {
  height: 260px;
}

.growth-total-value {
  font-family: 'Roboto', var(--font-family);
  font-size: 20px;
  font-weight: 500;
  line-height: 20px;
  color: var(--clr-growth-section-title);
}

.growth-arrow-icon {
  width: 20px;
  height: 20px;
  vertical-align: -4px;
}
</style>
