<script setup lang="ts">
// OverviewCard — design 824d2d70 (成长数据中心 top section).
//
// White card (矩形 1958, 359×169) containing:
// - 56px avatar (圆形 216, bg rgba(134,224,248,1))
// - Nickname + gender/age
// - "乐宝已陪伴你105小时" badge (右上角)
// - Stats row (矩形 2055, bg rgba(241,249,248,1)) with 3 columns + dividers

import { i18nSubPath } from 'src/utils/common';

defineProps<{
  avatar?: string;
  nickname?: string;
  gender?: 'male' | 'female';
  age?: number;
  weeklyInteract: number | string;
  bestCapability: string;
  hotTopic: string;
  accompanyHours?: number;
}>();

const i18n = i18nSubPath('components.growthData.OverviewCard');
</script>

<template>
  <div class="growth-overview">
    <!-- Profile row -->
    <div class="growth-profile-row row items-center">
      <q-avatar size="56px" class="growth-avatar" text-color="grey-8">
        <q-img v-if="avatar" :src="avatar" />
        <q-icon v-else name="person" size="28px" />
      </q-avatar>
      <div class="column q-ml-md">
        <div class="growth-nickname">
          {{ nickname ?? i18n('labels.unknown') }}
        </div>
        <div class="growth-meta">
          {{ gender ? i18n(`labels.${gender}`) : i18n('labels.unknown') }}
          &nbsp;&nbsp;
          {{ age ? i18n('labels.age', { age }) : i18n('labels.unknown') }}
        </div>
      </div>
      <div class="growth-accompany-badge">
        {{ i18n('labels.accompanyTime', { hours: accompanyHours ?? 0 }) }}
      </div>
    </div>

    <!-- Stats row (矩形 2055) -->
    <div class="growth-stats-row">
      <div class="growth-stat-col">
        <div class="growth-stats-value">{{ weeklyInteract }}{{ i18n('labels.hoursUnit') }}</div>
        <div class="growth-section-caption">{{ i18n('labels.weeklyInteract') }}</div>
      </div>
      <div class="growth-stat-divider" />
      <div class="growth-stat-col">
        <div class="growth-stats-value">{{ bestCapability }}</div>
        <div class="growth-section-caption">{{ i18n('labels.bestCapability') }}</div>
      </div>
      <div class="growth-stat-divider" />
      <div class="growth-stat-col">
        <div class="growth-stats-value">{{ hotTopic }}</div>
        <div class="growth-section-caption">{{ i18n('labels.hotTopic') }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.growth-overview {
  background: var(--clr-white, rgba(255, 255, 255, 1));
  border-radius: var(--growth-card-radius);
  padding: 16px;
  margin-bottom: var(--growth-section-gap);
  position: relative;
}

.growth-profile-row {
  margin-bottom: 12px;
  position: relative;
}

.growth-avatar {
  background: rgba(134, 224, 248, 1); // 圆形 216 fill
  flex-shrink: 0;
}

.growth-nickname {
  font-family: var(--font-family);
  font-size: 17px;
  font-weight: 400;
  line-height: 24px;
  color: var(--clr-text, rgba(21, 23, 23, 1));
}

.growth-meta {
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--clr-growth-section-caption);
}

.growth-accompany-badge {
  position: absolute;
  right: 0;
  top: 0;
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--clr-growth-accompany-badge);
}

.growth-stats-row {
  display: flex;
  align-items: center;
  background: var(--clr-growth-stats-bg);
  border-radius: var(--growth-card-radius);
  padding: 12px 0;
}

.growth-stat-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.growth-stat-divider {
  width: 1px;
  height: 16px;
  background: var(--clr-growth-stats-divider);
  flex-shrink: 0;
}
</style>
