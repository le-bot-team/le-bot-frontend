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
  MarkLineComponent,
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
  MarkLineComponent,
]);

const i18n = i18nSubPath('pages.stack.GrowthDataPage');

const router = useRouter();

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

const sectionRefs: Record<string, Ref<HTMLElement | undefined>> = {
  emotion: sectionEmotion,
  interaction: sectionInteraction,
  capability: sectionCapability,
  hotTopics: sectionHotTopics,
};

function scrollToSection(name: string) {
  // Immediately update active tab for instant visual feedback
  activeTab.value = name;

  const el = sectionRefs[name]?.value;
  const container = scrollableContainer.value;
  if (!el || !container) return;

  // If content doesn't overflow the container, no scroll is needed
  if (container.scrollHeight <= container.clientHeight) return;

  // Account for sticky header height so the section's top appears
  // right below the pinned tab bar, not hidden behind it.
  const fixedTop = container.querySelector<HTMLElement>('.growth-fixed-top');
  const stickyHeight = fixedTop?.offsetHeight ?? 0;

  const containerRect = container.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const rawOffset = container.scrollTop + (elRect.top - containerRect.top);
  const nextTop = Math.max(0, rawOffset - stickyHeight);
  container.scrollTo({ top: nextTop, behavior: 'smooth' });
}

// --- ScrollSpy: scroll-based section tracking ---
// Uses scroll position + requestAnimationFrame to determine which section
// is at the top of the visible area (just below the sticky header).
// More predictable than IntersectionObserver with complex rootMargin.

onMounted(() => {
  const container = scrollableContainer.value;
  if (!container) return;

  const fixedTop = container.querySelector<HTMLElement>('.growth-fixed-top');
  const stickyH = fixedTop?.offsetHeight ?? 0;
  const BUFFER = 10; // px tolerance

  function updateActiveTab() {
    if (!container) return;
    // If content doesn't overflow, no scrolling is happening
    if (container.scrollHeight <= container.clientHeight) return;

    const viewTop = container.scrollTop + stickyH + BUFFER;

    // Find which section's top border is closest to viewTop
    let bestSection = '';
    let bestDist = Infinity;

    for (const [name, ref] of Object.entries(sectionRefs)) {
      const el = ref.value;
      if (!el) continue;
      const sectionTop = el.offsetTop;
      const dist = Math.abs(sectionTop - viewTop);
      if (dist < bestDist) {
        bestDist = dist;
        bestSection = name;
      }
    }

    if (bestSection) {
      activeTab.value = bestSection;
    }
  }

  // Throttle scroll handler via requestAnimationFrame
  let rafId = 0;
  const onScroll = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      updateActiveTab();
    });
  };

  container.addEventListener('scroll', onScroll, { passive: true });
  // Run once at mount to set initial active tab
  updateActiveTab();
});

onBeforeUnmount(() => {
  // Cleanup is handled by Vue's reactive system;
  // scroll listeners on the ref are cleaned up automatically.
});

// --- Week selection ---
const selectedWeek = ref('2025.5.12~2025.5.18');
const weekOptions = computed(() => [
  { label: '2025.5.12~2025.5.18', value: '2025.5.12~2025.5.18' },
  { label: '2025.5.5~2025.5.11', value: '2025.5.5~2025.5.11' },
  { label: '2025.4.28~2025.5.4', value: '2025.4.28~2025.5.4' },
]);

const showDatePicker = ref(false);

function toggleDatePicker() {
  showDatePicker.value = !showDatePicker.value;
}

function selectWeek(value: string) {
  selectedWeek.value = value;
  showDatePicker.value = false;
}

// --- Action handlers ---
function handleShare() {
  // Share functionality
}

function handleRefresh() {
  // Refresh functionality
}

// --- Mock data ---
const dateRange = computed<string>(() => selectedWeek.value);
const bestCapability = computed<string>(() => i18n('mock.bestCapability'));
const hotTopic = computed<string>(() => i18n('mock.hotTopic'));

// Emotion multiline chart mock (5 emotions × 7 days)
const emotionDays = ['5.12', '5.13', '5.14', '5.15', '5.16', '5.17', '5.18'];
const emotionLabels = computed(() => [
  i18n('emotions.happy'),
  i18n('emotions.delighted'),
  i18n('emotions.calm'),
  i18n('emotions.worried'),
  i18n('emotions.sad'),
]);

const emotionSeriesData: Record<string, number[]> = {
  happy: [80, 75, 82, 78, 85, 88, 90],
  delighted: [65, 60, 68, 72, 70, 75, 78],
  calm: [40, 45, 42, 38, 40, 35, 32],
  worried: [15, 12, 18, 20, 15, 10, 8],
  sad: [5, 8, 6, 4, 3, 5, 2],
};

const emotionLineColors: Record<string, string> = {
  happy: 'rgba(32,204,249,1)',
  delighted: 'rgba(129,236,223,1)',
  calm: 'rgba(200,200,200,1)',
  worried: 'rgba(255,183,77,1)',
  sad: 'rgba(255,138,128,1)',
};

const emotionOption = shallowRef({
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
  series: [
    {
      name: '开心',
      type: 'line' as const,
      data: emotionSeriesData.happy,
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color: emotionLineColors.happy, width: 2 },
      itemStyle: { color: emotionLineColors.happy },
    },
    {
      name: '愉悦',
      type: 'line' as const,
      data: emotionSeriesData.delighted,
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color: emotionLineColors.delighted, width: 2 },
      itemStyle: { color: emotionLineColors.delighted },
    },
    {
      name: '平静',
      type: 'line' as const,
      data: emotionSeriesData.calm,
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color: emotionLineColors.calm, width: 2, type: 'dashed' as const },
      itemStyle: { color: emotionLineColors.calm },
    },
    {
      name: '担忧',
      type: 'line' as const,
      data: emotionSeriesData.worried,
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color: emotionLineColors.worried, width: 2 },
      itemStyle: { color: emotionLineColors.worried },
    },
    {
      name: '难过',
      type: 'line' as const,
      data: emotionSeriesData.sad,
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color: emotionLineColors.sad, width: 2 },
      itemStyle: { color: emotionLineColors.sad },
    },
  ],
  tooltip: { trigger: 'axis' as const },
});

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
  { name: i18n('hotTopics.draw'), value: 11 },
  { name: i18n('hotTopics.playhouse'), value: 37 },
  { name: i18n('hotTopics.ultraman'), value: 19 },
  { name: i18n('hotTopics.plantsVsZombies'), value: 20 },
  { name: i18n('hotTopics.other'), value: 13 },
]);

const pieColors = [
  'rgba(117,221,255,1)',
  'rgba(131,224,210,1)',
  'rgba(225,255,118,1)',
  'rgba(255,221,127,1)',
  'rgba(245,255,219,1)',
];

const pieOption = computed(() => ({
  tooltip: { trigger: 'item' as const },
  legend: { show: false },
  series: [
    {
      type: 'pie' as const,
      radius: ['0%', '70%'],
      center: ['50%', '50%'],
      data: hotTopicsData.value.map((d, i) => ({
        name: d.name,
        value: d.value,
        itemStyle: { color: pieColors[i] },
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

// Override Quasar's default q-page min-height: calc(100vh - X). The default
// forces q-page to be AT LEAST the viewport tall regardless of content,
// which combined with our long inner content makes the entire q-page
// inflate and breaks the flex column scroll-isolation. Returning an
// explicit `height` (= viewport - header/footer offset) locks q-page to
// the exact available area. Inside, .growth-scroll-wrapper fills 100 %
// of that height and is the only scrollable container, with
// .growth-fixed-top using position: sticky; top: 0 to stay pinned.
function growthPageStyleFn(offset: number) {
  return {
    height: `calc(100vh - ${offset}px)`,
    maxHeight: `calc(100vh - ${offset}px)`,
    minHeight: 0,
  };
}
</script>

<template>
  <q-page class="growth-page" :style-fn="growthPageStyleFn">
    <!-- Glow layers -->
    <div class="growth-glow growth-glow--171" aria-hidden="true" />
    <div class="growth-glow growth-glow--172" aria-hidden="true" />

    <!-- Cloud decorations -->
    <div class="growth-clouds" aria-hidden="true">
      <div class="growth-cloud growth-cloud--1" />
      <div class="growth-cloud growth-cloud--2" />
      <div class="growth-cloud growth-cloud--3" />
    </div>

    <!-- Top-right refresh button only (design: 组338, 1 button at top-right) -->
    <div class="growth-actions">
      <button class="growth-action-btn" @click="handleRefresh" :title="i18n('actions.refresh')">
        <img src="/lanhu-slices/icon-9.webp" alt="" class="growth-action-icon" />
      </button>
    </div>

    <!--
      Scroll wrapper — the ONLY scrollable region.
      Contains both sticky header (sticks to top) and sections (flow below).
    -->
    <div ref="scrollableContainer" class="growth-scroll-wrapper">
      <!-- Sticky header zone (position: sticky; top: 0) -->
      <div class="growth-fixed-top">
        <div class="growth-content">
          <!-- 3D illustration (design: img-1.webp, 345×326, positioned top-right) -->
          <img
            class="growth-main-illust"
            src="/lanhu-slices/img-1.webp"
            alt=""
            aria-hidden="true"
          />
          <!-- Page title + date picker (matching design: pill shape with text + dropdown icon) -->
          <div class="growth-header">
            <h1 class="growth-page-title q-ma-none">{{ i18n('title') }}</h1>
            <div class="growth-date-picker q-mt-xs" @click="toggleDatePicker">
              <span class="growth-date-text">{{ selectedWeek }}</span>
              <span class="growth-date-arrow" aria-hidden="true" />
              <!-- Dropdown popup -->
              <div v-if="showDatePicker" class="growth-date-dropdown">
                <div
                  v-for="opt in weekOptions"
                  :key="opt.value"
                  class="growth-date-option"
                  :class="{ 'growth-date-option--active': selectedWeek === opt.value }"
                  @click.stop="selectWeek(opt.value)"
                >
                  {{ opt.label }}
                </div>
              </div>
            </div>
          </div>

          <!-- Profile + Stats overview card -->
          <div class="growth-overview-wrap">
            <!-- Writing board — positioned above the card as top decoration -->
            <img
              class="growth-decor-board"
              src="/lanhu-slices/img-3.webp"
              alt=""
              aria-hidden="true"
            />
            <!-- Character illustration — leans on/above the card -->
            <img
              class="growth-decor-illust"
              src="/lanhu-slices/img-2.webp"
              alt=""
              aria-hidden="true"
            />
            <overview-card
              nickname="绵绵"
              gender="female"
              :age="5"
              :weekly-interact="4.6"
              :best-capability="bestCapability"
              :hot-topic="hotTopic"
            />
          </div>
        </div>

        <!-- Anchor Tab bar (sticks below overview) -->
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

      <!-- ==================== Sections ==================== -->
      <!-- ==================== Section: 情绪变化 ==================== -->
      <div ref="sectionEmotion" class="growth-section-card">
        <div class="growth-section-header">
          <div class="growth-accent-bar" />
          <span class="growth-section-title q-ma-none">{{ i18n('sections.emotion') }}</span>
        </div>
        <div class="growth-chart-wrap growth-chart-wrap--with-axis-labels">
          <div class="emotion-axis-labels">
            <span
              v-for="(label, i) in emotionLabels"
              :key="label"
              class="emotion-axis-label"
              :style="{ color: Object.values(emotionLineColors)[i], fontSize: '10px' }"
            >
              {{ label }}
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
            @click="
              router.push({
                name: 'growth-data-capability-detail',
                params: { capabilityKey: 'languageExpression' },
              })
            "
          >
            {{ i18n('labels.viewReport') }}
            <img class="growth-arrow-icon" src="/lanhu-slices/icon-3.webp" alt="" />
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
      <div ref="sectionHotTopics" class="growth-section-card q-pb-xl">
        <div class="growth-section-header">
          <div class="growth-accent-bar" />
          <span class="growth-section-title q-ma-none">{{ i18n('sections.hotTopics') }}</span>
          <span
            class="growth-view-report"
            role="button"
            tabindex="0"
            @click="router.push({ name: 'growth-data-weekly-report' })"
          >
            {{ i18n('labels.viewReport') }}
            <img class="growth-arrow-icon" src="/lanhu-slices/icon-3.webp" alt="" />
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

<!--
  Non-scoped style block for GLOBAL overrides that must NOT be
  affected by Vue's scoping or SCSS compilation transformations.
  - `!important` to win over Quasar's JS-injected inline styles
  - Targets html, body, #q-app and key Quasar containers to
    root out ANY ancestor that could be scrolling the whole page.
-->
<style lang="scss">
html,
body,
#q-app {
  height: 100% !important;
  overflow: hidden !important;
}
html {
  overscroll-behavior: none !important;
}
.q-layout {
  overflow: hidden !important;
}
.q-page-container {
  overflow: hidden !important;
}
</style>

<style lang="scss" scoped>
// ===== Page locked to viewport; internal scroll-container does the rest =====
// .growth-page gets a fixed height from style-fn (calc(100vh - offset)).
// Its children: absolutely-positioned glows/decorations (z-index: 0 at top)
// and .growth-scroll-wrapper (height: 100%, overflow-y: auto). Inside that
// wrapper, .growth-fixed-top uses position: sticky; top: 0 to stay pinned
// while the 4 section cards scroll behind/under it.
.growth-page {
  background: var(--growth-page-bg);
  position: relative !important;
  // Height from style-fn calc(100vh - offset), overflow clips
  // the absolutely-positioned glows/decorations to viewport.
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

// --- Cloud decorations ---
.growth-clouds {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 0;
  pointer-events: none;
}

.growth-cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  filter: blur(2px);
}

.growth-cloud--1 {
  left: -20px;
  top: 40px;
  width: 120px;
  height: 60px;
}

.growth-cloud--1::before,
.growth-cloud--1::after {
  content: '';
  position: absolute;
  background: inherit;
  border-radius: 50%;
}

.growth-cloud--1::before {
  width: 50px;
  height: 50px;
  top: -25px;
  left: 20px;
}

.growth-cloud--1::after {
  width: 40px;
  height: 40px;
  top: -20px;
  left: 50px;
}

.growth-cloud--2 {
  right: 20px;
  top: 80px;
  width: 90px;
  height: 45px;
}

.growth-cloud--2::before,
.growth-cloud--2::after {
  content: '';
  position: absolute;
  background: inherit;
  border-radius: 50%;
}

.growth-cloud--2::before {
  width: 40px;
  height: 40px;
  top: -20px;
  left: 15px;
}

.growth-cloud--2::after {
  width: 35px;
  height: 35px;
  top: -15px;
  left: 40px;
}

.growth-cloud--3 {
  left: 60px;
  top: 100px;
  width: 80px;
  height: 40px;
  opacity: 0.6;
}

// --- Overview card wrapper (positions overview card + top decorations) ---
.growth-overview-wrap {
  position: relative;
  width: 100%;
}

// 3D illustration (design: img-1.webp, 345×326, positioned top-right behind title)
.growth-main-illust {
  position: absolute;
  right: -12px;
  top: 32px;
  width: 200px;
  height: auto;
  z-index: 0;
  pointer-events: none;
}

// Writing board — positioned above the overview card as top-right decoration.
// Design layer: 181×176, semantic name "写字板" (writing board), CDN hash 14406f...
.growth-decor-board {
  position: absolute;
  right: 8px;
  top: -24px;
  width: 140px;
  height: auto;
  z-index: 1;
  pointer-events: none;
}

// Character illustration — positioned above the card, overlapping slightly.
// Design 组390: character leaning on or above the overview card.
.growth-decor-illust {
  position: absolute;
  right: 16px;
  top: -12px;
  width: 110px;
  height: auto;
  z-index: 2;
  pointer-events: none;
}

// --- Top right action buttons (design-consistent, using lanhu slices) ---
.growth-actions {
  position: absolute;
  top: 16px;
  right: 12px;
  display: flex;
  gap: 8px;
  z-index: 100;
}

.growth-action-btn {
  width: 36px;
  height: 36px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.6);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.growth-action-icon {
  width: 24px;
  height: 24px;
}

.growth-action-btn:active {
  opacity: 0.6;
}

// --- Sticky header zone (title + overview + tab bar) ---
// Uses `position: sticky; top: 0` to stay at top when .growth-scroll-wrapper
// scrolls. Background is transparent to show glow layers underneath.
.growth-fixed-top {
  position: sticky;
  top: 0;
  z-index: 2;
  background: transparent;
}

// --- Title + overview card (inside sticky header zone) ---
.growth-content {
  position: relative;
  z-index: 1;
  padding: 0 16px;
}

// ===== Scroll wrapper — THE ONLY SCROLLABLE CONTAINER =====
// Fills .growth-page height exactly (height: 100%). Its own content
// (sticky header + 4 sections) overflows, creating a scrollbar here.
// overflow-y: auto vs. scroll to avoid permanent scrollbar on desktop.
.growth-scroll-wrapper {
  position: relative;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  padding: 0 16px 24px;
  -webkit-overflow-scrolling: touch;
}

.growth-header {
  padding-top: 92px;
  padding-left: 28px;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

// Page title (design: YouSheBiaoTiHei Bold 36px, line-height 47px, letter-spacing 4%, rgba(36,61,59,1))
.growth-page-title {
  font-family: 'YouSheBiaoTiHei', var(--font-family);
  font-size: 36px;
  font-weight: bold;
  line-height: 47px;
  letter-spacing: 0.04em;
  color: var(--clr-growth-page-title);
}

// --- Date picker pill (design: 矩形1966, 150×28, r14, bg rgba(208,255,249,1)) ---
.growth-date-picker {
  position: relative;
  width: 150px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--clr-growth-date-picker-bg, rgba(208, 255, 249, 1));
  border-radius: 14px;
  padding: 0 10px;
  cursor: pointer;
}

.growth-date-text {
  font-family: 'Roboto', var(--font-family);
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
  color: rgba(58, 89, 86, 1);
  white-space: nowrap;
}

.growth-date-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

// Dropdown arrow — black down triangle matching design spec (smaller, sharper)
.growth-date-arrow {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid rgba(21, 23, 23, 0.8);
  flex-shrink: 0;
  vertical-align: middle;
}

// Date dropdown popup
.growth-date-dropdown {
  position: absolute;
  top: 32px;
  left: 0;
  width: 170px;
  background: rgba(255, 255, 255, 1);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 200;
  overflow: hidden;
  padding: 4px 0;
}

.growth-date-option {
  padding: 8px 14px;
  font-family: 'Roboto', var(--font-family);
  font-size: 13px;
  color: rgba(21, 23, 23, 1);
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(241, 249, 248, 1);
  }

  &--active {
    color: rgba(32, 204, 249, 1);
    font-weight: 500;
  }
}

// --- Tab bar (design: 17px Medium active / 16px Regular inactive, wider spacing) ---
.growth-tab-bar {
  display: flex;
  gap: 28px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0 24px;
  position: relative;
  z-index: 3;
  background: linear-gradient(180deg, rgba(236, 255, 246, 0.95) 0%, rgba(255, 255, 255, 1) 100%);
}

.growth-anchor-tab {
  background: none;
  border: none;
  font-family: 'AlibabaPuHuiTi', var(--font-family);
  font-size: 16px;
  font-weight: 400;
  color: var(--clr-growth-tab-inactive, rgba(21, 23, 23, 1));
  padding: 10px 2px;
  cursor: pointer;
  position: relative;
  min-height: 40px;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.2s;

  &--active {
    color: var(--growth-tab-active-color);
    font-size: 17px;
    font-weight: 500;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 3px;
      background: var(--growth-tab-active-color);
      border-radius: 2px;
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
