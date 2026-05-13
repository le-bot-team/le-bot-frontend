<script setup lang="ts">
// GrowthDataPage — design 824d2d70 (成长数据中心, 375×2242 artboard).
//
// Layout: full-bleed mobile viewport with page-level gradient background +
// two radial glow layers. Content: fixed header + overview card + 4-tab
// switchable content (情绪变化 / 互动时长 / 能力发展 / 高频话题).
//
// Charts: ECharts (v6) via vue-echarts for line/bar/radar/pie.
// Replace mock data with API data when backend is ready.

import { computed, ref, shallowRef } from 'vue';
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

// --- Active tab ---
const activeTab = ref('emotion');
const tabs = computed(() => [
  { name: 'emotion', label: i18n('sections.emotion') },
  { name: 'interaction', label: i18n('sections.interaction') },
  { name: 'capability', label: i18n('sections.capability') },
  { name: 'hotTopics', label: i18n('sections.hotTopics') },
]);

// --- Mock data ---
const dateRange = computed<string>(() => i18n('mock.dateRange'));
const bestCapability = computed<string>(() => i18n('mock.bestCapability'));
const hotTopic = computed<string>(() => i18n('mock.hotTopic'));

// Emotion line chart mock
const emotionDays = ['5.12', '5.13', '5.14', '5.15', '5.16', '5.17', '5.18'];
const emotionValues = [60, 72, 55, 80, 65, 90, 75];

// Interaction bar chart mock
const interactionDays = ['5.12', '5.13', '5.14', '5.15', '5.16', '5.17', '5.18'];
const interactionValues = [72, 139, 55, 29, 90, 120, 65];
const weeklyTotalMinutes = 276;

// Capability radar mock
const capabilityData = computed(() => [
  { name: i18n('capabilities.socialUnderstanding'), value: 38 },
  { name: i18n('capabilities.knowledgeIntegration'), value: 30 },
  { name: i18n('capabilities.imagination'), value: 22 },
  { name: i18n('capabilities.emotionalExpression'), value: 20 },
  { name: i18n('capabilities.logicalThinking'), value: 32 },
]);

// Hot topics pie mock
const hotTopicsData = computed(() => [
  { name: i18n('hotTopics.draw'), value: 11 },
  { name: i18n('hotTopics.playhouse'), value: 37 },
  { name: i18n('hotTopics.ultraman'), value: 19 },
  { name: i18n('hotTopics.plantsVsZombies'), value: 20 },
  { name: i18n('hotTopics.other'), value: 13 },
]);

const pieColors = [
  'rgba(117,221,255,1)', // Section 1
  'rgba(131,224,210,1)', // Section 2
  'rgba(225,255,118,1)', // Section 3
  'rgba(255,221,127,1)', // Section 4
  'rgba(245,255,219,1)', // Section 5
];

// --- ECharts options ---
const emotionOption = shallowRef({
  grid: { left: 32, right: 16, top: 16, bottom: 32 },
  xAxis: {
    type: 'category' as const,
    data: emotionDays,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: 'rgba(74,74,74,1)', fontSize: 10 },
  },
  yAxis: {
    type: 'value' as const,
    max: 100,
    splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } },
    axisLabel: { color: 'rgba(74,74,74,1)', fontSize: 10 },
  },
  series: [
    {
      type: 'line' as const,
      data: emotionValues,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: 'rgba(32,204,249,1)', width: 2 },
      itemStyle: { color: 'rgba(32,204,249,1)' },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(32,204,249,0.3)' },
            { offset: 1, color: 'rgba(32,204,249,0.02)' },
          ],
        },
      },
    },
  ],
  tooltip: { trigger: 'axis' as const },
});

const interactionOption = shallowRef({
  grid: { left: 32, right: 16, top: 16, bottom: 32 },
  xAxis: {
    type: 'category' as const,
    data: interactionDays,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: 'rgba(74,74,74,1)', fontSize: 10 },
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

const radarOption = computed(() => ({
  radar: {
    indicator: capabilityData.value.map((d) => ({ name: d.name, max: 100 })),
    radius: '65%',
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
</script>

<template>
  <q-page class="growth-page">
    <!-- Glow layers -->
    <div class="growth-glow growth-glow--171" aria-hidden="true" />
    <div class="growth-glow growth-glow--172" aria-hidden="true" />

    <div class="growth-content">
      <!-- Page title + date + share icon -->
      <div class="growth-header">
        <div class="growth-header-top row items-center justify-between">
          <h1 class="growth-page-title q-ma-none">{{ i18n('title') }}</h1>
          <div
            class="growth-share-btn"
            role="button"
            :aria-label="i18n('labels.share')"
          >
            <q-icon name="share" size="16px" />
          </div>
        </div>
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
      />

      <!-- Tab bar -->
      <q-tabs
        v-model="activeTab"
        class="growth-tabs"
        active-color="primary"
        indicator-color="transparent"
        dense
        no-caps
        narrow-indicator
      >
        <q-tab
          v-for="tab in tabs"
          :key="tab.name"
          :name="tab.name"
          :label="tab.label"
          class="growth-tab"
          :class="{ 'growth-tab--active': activeTab === tab.name }"
        />
      </q-tabs>

      <!-- Tab panels -->
      <q-tab-panels v-model="activeTab" animated class="growth-panels">
        <!-- Emotion -->
        <q-tab-panel name="emotion" class="growth-panel">
          <div class="growth-card">
            <div class="row items-center q-gutter-x-sm q-mb-sm">
              <div class="growth-accent-bar" />
              <span class="growth-section-title growth-section-title--accent q-ma-none">
                {{ i18n('sections.emotion') }}
              </span>
            </div>
            <v-chart
              :option="emotionOption"
              :init-options="chartInitOpts"
              autoresize
              class="growth-chart"
            />
            <q-separator color="grey-3" class="q-mb-sm" />
            <div class="row items-center q-mb-xs">
              <span class="growth-summary-tag">{{ i18n('labels.summary') }}</span>
            </div>
            <p class="growth-summary-text q-ma-none">{{ i18n('mock.emotionSummary') }}</p>
          </div>
        </q-tab-panel>

        <!-- Interaction -->
        <q-tab-panel name="interaction" class="growth-panel">
          <div class="growth-card">
            <div class="row items-center q-gutter-x-sm q-mb-sm">
              <div class="growth-accent-bar" />
              <span class="growth-section-title q-ma-none">{{ i18n('sections.interaction') }}</span>
            </div>
            <v-chart
              :option="interactionOption"
              :init-options="chartInitOpts"
              autoresize
              class="growth-chart"
            />
            <q-separator color="grey-3" class="q-mb-sm" />
            <div class="row items-center justify-between q-mb-sm">
              <span class="growth-section-caption">{{ i18n('labels.weeklyInteraction') }}</span>
              <div class="row items-baseline q-gutter-x-xs">
                <span class="growth-total-value">{{ weeklyTotalMinutes }}</span>
                <span class="growth-section-caption">{{ i18n('labels.minutes') }}</span>
              </div>
            </div>
            <div class="row items-center q-mb-xs">
              <span class="growth-summary-tag">{{ i18n('labels.summary') }}</span>
            </div>
            <p class="growth-summary-text q-ma-none">{{ i18n('mock.interactionSummary') }}</p>
          </div>
        </q-tab-panel>

        <!-- Capability -->
        <q-tab-panel name="capability" class="growth-panel">
          <div class="growth-card">
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center q-gutter-x-sm">
                <div class="growth-accent-bar" />
                <span class="growth-section-title q-ma-none">{{ i18n('sections.capability') }}</span>
              </div>
              <span class="growth-view-report" role="button" tabindex="0" @click="router.push({ name: 'growth-data-capability-detail', params: { capabilityKey: 'languageExpression' } })">{{ i18n('labels.viewReport') }} ›</span>
            </div>
            <v-chart
              :option="radarOption"
              :init-options="chartInitOpts"
              autoresize
              class="growth-chart"
            />
            <q-separator color="grey-3" class="q-mb-sm" />
            <div class="row items-center q-mb-xs">
              <span class="growth-summary-tag">{{ i18n('labels.summary') }}</span>
            </div>
            <p class="growth-summary-text q-ma-none">{{ i18n('mock.capabilitySummary') }}</p>
          </div>
        </q-tab-panel>

        <!-- Hot Topics -->
        <q-tab-panel name="hotTopics" class="growth-panel">
          <div class="growth-card">
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center q-gutter-x-sm">
                <div class="growth-accent-bar" />
                <span class="growth-section-title q-ma-none">{{ i18n('sections.hotTopics') }}</span>
              </div>
              <span class="growth-view-report" role="button" tabindex="0" @click="router.push({ name: 'growth-data-weekly-report' })">{{ i18n('labels.viewReport') }} ›</span>
            </div>
            <v-chart
              :option="pieOption"
              :init-options="chartInitOpts"
              autoresize
              class="growth-chart"
            />
            <q-separator color="grey-3" class="q-mb-sm" />
            <div class="row items-center q-mb-xs">
              <span class="growth-summary-tag">{{ i18n('labels.summary') }}</span>
            </div>
            <p class="growth-summary-text q-ma-none">{{ i18n('mock.hotTopicsSummary') }}</p>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.growth-page {
  position: relative;
  background: var(--growth-page-bg);
  min-height: 100vh;
  overflow-x: hidden;
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

.growth-content {
  position: relative;
  z-index: 1;
  padding: 0 16px 24px;
}

.growth-header {
  padding-top: 48px;
  margin-bottom: 16px;
}

.growth-share-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

// Tab bar
.growth-tabs {
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 12px;
}

.growth-tab {
  font-size: 14px;
  font-weight: 400;
  color: rgba(21, 23, 23, 1);
  padding: 0 8px;
  min-height: 36px;

  &--active {
    color: var(--growth-tab-active-color);
    font-weight: 500;

    // Accent indicator bar (2x16px, design 矩形2061)
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

// Tab panels
.growth-panels {
  background: transparent;
}

.growth-panel {
  padding: 0;
}

// Section card
.growth-card {
  background: var(--clr-white, rgba(255, 255, 255, 1));
  border-radius: var(--growth-card-radius);
  padding: 16px;
}

.growth-chart {
  width: 100%;
  height: 220px;
}

.growth-total-value {
  font-family: 'Roboto', var(--font-family);
  font-size: 20px;
  font-weight: 500;
  line-height: 20px;
  color: var(--clr-growth-section-title);
}
</style>
