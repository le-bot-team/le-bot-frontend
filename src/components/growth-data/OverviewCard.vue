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
}>();

const i18n = i18nSubPath('components.growthData.OverviewCard');
</script>

<template>
  <div class="growth-overview">
    <!-- Profile row (design: avatar 56×56 + nickname + meta + accompany badge) -->
    <div class="growth-profile-row row items-center">
      <!-- Avatar: 圆形216, 56×56, bg rgba(134,224,248,1) -->
      <div class="growth-avatar">
        <img v-if="avatar" :src="avatar" class="growth-avatar-img" alt="" />
        <img v-else src="/lanhu-slices/icon-5.webp" class="growth-avatar-placeholder" alt="" />
      </div>
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
      <!-- Accompany badge (design: 矩形1965, 177×24, 切图4=hearts-fill icon) -->
      <div class="growth-accompany-badge">
        <img src="/lanhu-slices/icon-4.webp" class="growth-accompany-icon" alt="" />
        {{ i18n('labels.accompanyTime', { hours: 105 }) }}
      </div>
    </div>

    <!-- Stats row (design: 矩形2055, 343×65, bg rgba(241,249,248,1)) -->
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
// --- Overview card (design: 矩形1958, 359×169, white bg, r12) ---
.growth-overview {
  background: var(--clr-white, rgba(255, 255, 255, 1));
  border-radius: var(--growth-card-radius);
  padding: 16px;
  margin-bottom: var(--growth-section-gap);
  position: relative;
  width: 100%;
  max-width: 359px;
  box-sizing: border-box;
}

// --- Profile row (avatar + info + badge) ---
.growth-profile-row {
  margin-bottom: 12px;
  position: relative;
}

// --- Avatar (design: 圆形216, 56×56, bg rgba(134,224,248,1)) ---
.growth-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(134, 224, 248, 1);
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.growth-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.growth-avatar-placeholder {
  width: 28px;
  height: 28px;
  opacity: 0.6;
}

// --- Nickname (design: AlibabaPuHuiTi 17px, rgba(21,23,23,1)) ---
.growth-nickname {
  font-family: 'AlibabaPuHuiTi', var(--font-family);
  font-size: 17px;
  font-weight: 400;
  line-height: 24px;
  color: rgba(21, 23, 23, 1);
}

// --- Meta (design: AlibabaPuHuiTi 12px, rgba(147,152,169,1)) ---
.growth-meta {
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--clr-growth-section-caption);
}

// --- Accompany badge (design: 矩形1965, 177×24, r12, bg rgba(255,255,255,0.8), text rgba(31,203,248)) ---
.growth-accompany-badge {
  position: absolute;
  right: 0;
  top: 0;
  font-family: 'AlibabaPuHuiTi', var(--font-family);
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: rgba(32, 204, 249, 1);
  background: rgba(255, 255, 255, 0.8);
  padding: 4px 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

// Accompany badge icon (design: small avatar icon before text, 14×14)
.growth-accompany-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

// --- Stats row (design: 矩形2055, 343×65, bg rgba(241,249,248,1)) ---
.growth-stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(241, 249, 248, 1);
  border-radius: var(--growth-card-radius);
  padding: 12px 16px;
  width: 100%;
  box-sizing: border-box;
}

.growth-stat-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

// Divider (design: 矩形2049/2050, 1×16, rgba(32,204,249,1))
.growth-stat-divider {
  width: 1px;
  height: 16px;
  background: rgba(32, 204, 249, 1);
  flex-shrink: 0;
}
</style>
