<script setup lang="ts">
// ChatWeeklyReportPage — design b84ab479 (聊天周报, 375×2268 artboard).
//
// Full-bleed mobile page with sections:
// 1. 高频话题 — Pie chart with topic percentages
// 2. 一周成长小故事 — Story card with avatar + title + letter
// 3. 兴趣与偏好 — Interests card with growth signal
// 4. 情绪状态 — Emotional state card with growth signal
// 5. 乐宝的角色 — LeBot role card with growth signal
// 6. 想对爸爸妈妈说 — Closing letter to parents
//
// Replace mock data with API data when backend is ready.

import { computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import VChart from 'vue-echarts';

import { i18nSubPath } from 'src/utils/common';

// Register ECharts modules (tree-shaking)
use([CanvasRenderer, PieChart, TooltipComponent]);

const i18n = i18nSubPath('pages.stack.growth-data.ChatWeeklyReportPage');

// --- Hot topics mock data (same as GrowthDataPage) ---
const hotTopicsData = computed(() => [
  { name: i18n('hotTopics.draw'), value: 11, color: 'rgba(117,221,255,1)' },
  { name: i18n('hotTopics.playhouse'), value: 37, color: 'rgba(131,224,210,1)' },
  { name: i18n('hotTopics.ultraman'), value: 19, color: 'rgba(225,255,118,1)' },
  { name: i18n('hotTopics.plantsVsZombies'), value: 20, color: 'rgba(255,221,127,1)' },
  { name: i18n('hotTopics.other'), value: 13, color: 'rgba(245,255,219,1)' },
]);

// --- ECharts Pie option ---
const pieOption = computed(() => ({
  tooltip: { trigger: 'item' as const },
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

const chartInitOpts = { renderer: 'canvas' as const };
</script>

<template>
  <q-page class="report-page">
    <div class="report-content">
      <!-- Section 1: 高频话题 -->
      <section class="report-section">
        <h2 class="report-section-title q-ma-none">{{ i18n('sections.hotTopics') }}</h2>
        <div class="report-card">
          <v-chart
            :option="pieOption"
            :init-options="chartInitOpts"
            autoresize
            class="report-chart"
          />
        </div>
      </section>

      <!-- Section 2: 一周成长小故事 -->
      <section class="report-section">
        <h2 class="report-section-title q-ma-none">{{ i18n('sections.weeklyStory') }}</h2>
        <div class="report-card">
          <div class="report-story-header row items-center">
            <q-avatar size="64px" class="report-story-avatar" text-color="grey-8">
              <q-icon name="person" size="28px" />
            </q-avatar>
            <div class="report-story-title q-ml-md">{{ i18n('story.title') }}</div>
          </div>
          <p class="report-story-body q-ma-none">{{ i18n('story.body') }}</p>
        </div>
      </section>

      <!-- Section 3: 兴趣与偏好 -->
      <section class="report-section">
        <h2 class="report-section-title q-ma-none">{{ i18n('sections.interests') }}</h2>
        <div class="report-card">
          <div class="report-story-header row items-center">
            <q-avatar size="64px" class="report-story-avatar" text-color="grey-8">
              <q-icon name="person" size="28px" />
            </q-avatar>
            <div class="report-story-title q-ml-md">{{ i18n('interests.title') }}</div>
          </div>
          <div class="report-growth-signal">
            <q-icon name="info" size="12px" class="q-mr-xs" />
            <span>{{ i18n('interests.growthSignal') }}</span>
          </div>
          <p class="report-story-body q-ma-none">{{ i18n('interests.body') }}</p>
        </div>
      </section>

      <!-- Section 4: 情绪状态 -->
      <section class="report-section">
        <h2 class="report-section-title q-ma-none">{{ i18n('sections.emotion') }}</h2>
        <div class="report-card">
          <div class="report-story-header row items-center">
            <q-avatar size="64px" class="report-story-avatar" text-color="grey-8">
              <q-icon name="person" size="28px" />
            </q-avatar>
            <div class="report-story-title q-ml-md">{{ i18n('emotion.title') }}</div>
          </div>
          <div class="report-growth-signal">
            <q-icon name="info" size="12px" class="q-mr-xs" />
            <span>{{ i18n('emotion.growthSignal') }}</span>
          </div>
          <p class="report-story-body q-ma-none">{{ i18n('emotion.body') }}</p>
        </div>
      </section>

      <!-- Section 5: 乐宝的角色 -->
      <section class="report-section">
        <h2 class="report-section-title q-ma-none">{{ i18n('sections.lebotRole') }}</h2>
        <div class="report-card">
          <div class="report-story-header row items-center">
            <q-avatar size="64px" class="report-story-avatar" text-color="grey-8">
              <q-icon name="person" size="28px" />
            </q-avatar>
            <div class="report-story-title q-ml-md">{{ i18n('lebotRole.title') }}</div>
          </div>
          <div class="report-growth-signal">
            <q-icon name="info" size="12px" class="q-mr-xs" />
            <span>{{ i18n('lebotRole.growthSignal') }}</span>
          </div>
          <p class="report-story-body q-ma-none">{{ i18n('lebotRole.body') }}</p>
        </div>
      </section>

      <!-- Section 6: 想对爸爸妈妈说 -->
      <section class="report-section">
        <h2 class="report-section-title report-section-title--script q-ma-none">
          {{ i18n('sections.toParents') }}
        </h2>
        <div class="report-card">
          <p class="report-story-body q-ma-none">{{ i18n('toParents.body') }}</p>
          <div class="report-signature">
            <p class="q-ma-none">{{ i18n('toParents.signature1') }}</p>
            <p class="q-ma-none">{{ i18n('toParents.signature2') }}</p>
          </div>
        </div>
      </section>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.report-page {
  position: relative;
  background: var(--growth-page-bg);
  min-height: 100vh;
  overflow-x: hidden;
}

.report-content {
  position: relative;
  z-index: 1;
  padding: 12px 16px 32px;
}

// Section wrapper
.report-section {
  margin-bottom: 16px;
}

// ZCOOL KuaiLe section title with underline accent
.report-section-title {
  font-family: 'ZCOOL KuaiLe', var(--font-family);
  font-size: 18px;
  font-weight: 400;
  line-height: 25px;
  letter-spacing: 0.08em;
  color: var(--clr-text);
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 2px solid var(--clr-link); // 矩形 2067 accent
  display: inline-block;

  &--script {
    font-family: 'HappyZcool-2016', 'ZCOOL KuaiLe', var(--font-family);
    font-weight: 400;
  }
}

// White card
.report-card {
  background: var(--clr-white, rgba(255, 255, 255, 1));
  border-radius: var(--growth-card-radius);
  padding: 16px;
}

// Pie chart
.report-chart {
  width: 100%;
  height: 220px;
}

// Story header (avatar + title)
.report-story-avatar {
  background: rgba(134, 224, 248, 1); // 圆形 228 fill
  border: 1px solid var(--clr-divider);
  flex-shrink: 0;
}

.report-story-title {
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-link); // 品牌青色
}

.report-story-body {
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;
  color: var(--clr-text);
  margin-top: 12px;
  white-space: pre-line;
}

// Growth signal (info box)
.report-growth-signal {
  background: var(--clr-page-bg-neutral);
  border-radius: 8px;
  padding: 8px 12px;
  margin-top: 12px;
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  color: var(--clr-text-secondary);
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

// Signature block
.report-signature {
  margin-top: 16px;
  text-align: right;
  font-family: 'Alibaba PuHuiTi 2.0', var(--font-family);
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;
  color: var(--clr-text);
}
</style>
