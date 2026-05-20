<script setup lang="ts">
// CapabilityDetailPage — design 8c683896 (语言表达力, 375×1958 artboard).
//
// Sub-page of growth-data showing detailed capability breakdown:
// 1. 综合评分 — Radar chart with 4 dimensions + score numbers
// 2. 综合评语 — Review text
// 3. 对比分析 — Horizontal & vertical comparison sections with tags
//
// Route: /stack/growth-data/capability/:capabilityKey
// Replace mock data with API data when backend is ready.

import { computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { RadarChart } from 'echarts/charts';
import { TooltipComponent, RadarComponent } from 'echarts/components';
import VChart from 'vue-echarts';

import { i18nSubPath } from 'src/utils/common';
import { useRoute } from 'vue-router';

// Register ECharts modules
use([CanvasRenderer, RadarChart, TooltipComponent, RadarComponent]);

const route = useRoute();
const capabilityKey = (route.params.capabilityKey as string) || 'emotionalExpression';

const i18n = i18nSubPath(`pages.stack.growth-data.CapabilityDetailPage`);

/** Split comparison text on '——' (zh) or ' — ' (en) delimiter, preserving original delimiter */
function splitComparison(text: string): { key: string; desc: string; delimiter: string } {
  const zhIdx = text.indexOf('——');
  const enIdx = text.indexOf(' — ');
  if (zhIdx >= 0 && (enIdx < 0 || zhIdx <= enIdx)) {
    return { key: text.slice(0, zhIdx), desc: text.slice(zhIdx + 2), delimiter: '——' };
  }
  if (enIdx >= 0) {
    return { key: text.slice(0, enIdx), desc: text.slice(enIdx + 3), delimiter: ' — ' };
  }
  return { key: text, desc: '', delimiter: '' };
}

// --- Radar chart mock data ---
// 4 sub-dimensions for 语言表达力 from design 8c683896
const radarDimensions = computed(() => [
  { name: i18n('dimensions.toneProsody'), max: 10 },
  { name: i18n('dimensions.sentenceCompleteness'), max: 10 },
  { name: i18n('dimensions.vocabularyRichness'), max: 10 },
  { name: i18n('dimensions.fluency'), max: 10 },
]);

const radarValues = [6, 3, 7, 4]; // From design score numbers

const radarOption = computed(() => ({
  radar: {
    indicator: radarDimensions.value,
    radius: '65%',
    axisName: { color: 'rgba(74,74,74,1)', fontSize: 12 },
    splitArea: { areaStyle: { color: ['transparent'] } },
    splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } },
    axisLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } },
  },
  series: [
    {
      type: 'radar' as const,
      data: [
        {
          value: radarValues,
          areaStyle: { color: 'rgba(32,204,249,0.3)' },
          lineStyle: { color: 'rgba(32,204,249,1)', width: 2 },
          itemStyle: { color: 'rgba(32,204,249,1)' },
        },
      ],
    },
  ],
}));

const chartInitOpts = { renderer: 'canvas' as const };

// --- Comparison data ---
// 横向对比 — advantages & disadvantages vs peers
const advantages = computed(() => [i18n('comparison.advantage1'), i18n('comparison.advantage2')].map(splitComparison));
const disadvantages = computed(() => [i18n('comparison.disadvantage1')].map(splitComparison));
// 纵向对比 — progress & areas to develop
const progress = computed(() => [i18n('comparison.progress1')].map(splitComparison));
const toDevelop = computed(() => [i18n('comparison.toDevelop1')].map(splitComparison));
</script>

<template>
  <q-page class="capability-detail-page" :data-capability="capabilityKey">
    <div class="capability-detail-content">
      <!-- Section 1: 综合评分 (Overall Score) -->
      <div class="capability-card">
        <div class="row items-center q-gutter-x-sm q-mb-sm">
          <div class="capability-accent-bar" />
          <h2 class="capability-section-title q-ma-none">{{ i18n('sections.overallScore') }}</h2>
        </div>
        <v-chart
          :option="radarOption"
          :init-options="chartInitOpts"
          autoresize
          class="capability-chart"
        />
      </div>

      <!-- Section 2: 综合评语 (Review) -->
      <div class="capability-card">
        <div class="row items-center q-gutter-x-sm q-mb-sm">
          <div class="capability-accent-bar" />
          <h2 class="capability-section-title q-ma-none">{{ i18n('sections.review') }}</h2>
        </div>
        <p class="capability-body q-ma-none">{{ i18n('review.text') }}</p>
      </div>

      <!-- Section 3: 对比分析 (Comparison Analysis) -->
      <div class="capability-card">
        <div class="row items-center q-gutter-x-sm q-mb-sm">
          <div class="capability-accent-bar" />
          <h2 class="capability-section-title q-ma-none">{{ i18n('sections.comparison') }}</h2>
        </div>

        <!-- 横向对比 -->
        <div class="capability-compare-group">
          <h3 class="capability-compare-title q-ma-none">
            {{ i18n('comparison.horizontal') }}
            <span class="capability-compare-subtitle">{{ i18n('comparison.horizontalSub') }}</span>
          </h3>
          <div class="capability-compare-row">
            <span class="capability-tag capability-tag--advantage">{{ i18n('tags.advantage') }}</span>
            <div class="capability-compare-items">
              <p v-for="(item, idx) in advantages" :key="'adv-' + idx" class="capability-compare-item q-ma-none">
                 <span class="capability-compare-key">{{ item.key }}</span>
                 <span class="capability-compare-desc">{{ item.desc ? item.delimiter + item.desc : '' }}</span>
               </p>
            </div>
          </div>
          <div class="capability-compare-row">
            <span class="capability-tag capability-tag--disadvantage">{{ i18n('tags.disadvantage') }}</span>
            <div class="capability-compare-items">
              <p v-for="(item, idx) in disadvantages" :key="'dis-' + idx" class="capability-compare-item q-ma-none">
                <span class="capability-compare-key">{{ item.key }}</span>
                <span class="capability-compare-desc">{{ item.desc ? item.delimiter + item.desc : '' }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- 纵向对比 -->
        <div class="capability-compare-group">
          <h3 class="capability-compare-title q-ma-none">
            {{ i18n('comparison.vertical') }}
            <span class="capability-compare-subtitle">{{ i18n('comparison.verticalSub') }}</span>
          </h3>
          <div class="capability-compare-row">
            <span class="capability-tag capability-tag--progress">{{ i18n('tags.progress') }}</span>
            <div class="capability-compare-items">
              <p v-for="(item, idx) in progress" :key="'prog-' + idx" class="capability-compare-item q-ma-none">
                <span class="capability-compare-key">{{ item.key }}</span>
                <span class="capability-compare-desc">{{ item.desc ? item.delimiter + item.desc : '' }}</span>
              </p>
            </div>
          </div>
          <div class="capability-compare-row">
            <span class="capability-tag capability-tag--develop">{{ i18n('tags.toDevelop') }}</span>
            <div class="capability-compare-items">
              <p v-for="(item, idx) in toDevelop" :key="'dev-' + idx" class="capability-compare-item q-ma-none">
                <span class="capability-compare-key">{{ item.key }}</span>
                <span class="capability-compare-desc">{{ item.desc ? item.delimiter + item.desc : '' }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.capability-detail-page {
  position: relative;
  background: var(--growth-page-bg);
  min-height: 100vh;
  overflow-x: hidden;
}

.capability-detail-content {
  position: relative;
  z-index: 1;
  padding: 12px 16px 32px;
}

// White card
.capability-card {
  background: var(--clr-white, rgba(255, 255, 255, 1));
  border-radius: var(--growth-card-radius);
  padding: 16px;
  margin-bottom: 16px;
}

// Accent bar (4×12px from design 矩形 2061)
.capability-accent-bar {
  width: 4px;
  height: 12px;
  border-radius: 2px;
  background: linear-gradient(
    to bottom,
    var(--clr-growth-accent-bar-top),
    var(--clr-growth-accent-bar-bottom)
  );
  flex-shrink: 0;
}

// Section title
.capability-section-title {
  font-family: var(--font-family);
  font-size: 17px;
  font-weight: 500;
  line-height: 24px;
  color: var(--clr-text);
}

// Radar chart
.capability-chart {
  width: 100%;
  height: 250px;
}

// Body text
.capability-body {
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;
  color: var(--clr-text-tertiary);
}

// Comparison group
.capability-compare-group {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--clr-divider);
}

.capability-compare-title {
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-text);
  margin-bottom: 12px;
}

.capability-compare-subtitle {
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--clr-text-tertiary);
  margin-left: 4px;
}

// Compare row: tag + items
.capability-compare-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

// Tags (优势/不足/进步/待发展能力)
.capability-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  height: 20px;
  border-radius: 4px;
  padding: 0 6px;
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: rgba(255, 255, 255, 1);
  flex-shrink: 0;

  &--advantage {
    background: rgba(32, 204, 249, 1);
  }
  &--disadvantage {
    background: rgba(255, 183, 77, 1);
  }
  &--progress {
    background: rgba(129, 236, 223, 1);
  }
  &--develop {
    background: rgba(255, 138, 128, 1);
  }
}

.capability-compare-items {
  flex: 1;
  min-width: 0;
}

.capability-compare-item {
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;
  color: var(--clr-text);
  margin-bottom: 4px;
}

.capability-compare-key {
  font-weight: 400;
  color: var(--clr-text);
}

.capability-compare-desc {
  color: var(--clr-text-secondary);
}
</style>
