<script setup lang="ts">
/**
 * FamilyGroupPage — 家庭组列表页
 *
 * 展示当前用户所属的所有家庭组卡片（以儿童信息为维度的列表）。
 * 每张卡片显示儿童头像、家庭组名称、成员数量。
 * 数据源从 FamilyGroupStore 读取。
 */

import { computed } from 'vue';

import { router } from 'src/router';
import { i18nSubPath } from 'src/utils/common';
import { useFamilyGroupStore } from 'stores/family-group';
import type { FamilyGroup } from 'stores/family-group/types';
import { useTracker } from 'src/composables/useTracker';
import { avatarsByGender, getDefaultAvatarUrl } from 'src/utils/defaultAvatars';

const i18n = i18nSubPath('pages.stack.FamilyGroupPage');
const familyGroupStore = useFamilyGroupStore();
const { trackClick, trackConversion } = useTracker();

/** 从 store 读取家庭组列表 */
const familyGroups = computed<FamilyGroup[]>(() => familyGroupStore.groups);

/** 获取家庭组中儿童成员的头像（优先 childInfo.avatar，fallback 性别默认头像） */
function getChildAvatar(group: FamilyGroup): string {
  const child = group.members.find((m) => m.memberType === 'child');
  if (child?.childInfo?.avatar) return child.childInfo.avatar;
  const gender = child?.childInfo?.gender;
  if (gender) return avatarsByGender(gender)[0]?.url || getDefaultAvatarUrl('child');
  return getDefaultAvatarUrl('child');
}

function onGroupClick(group: FamilyGroup) {
  trackClick('card_click_family_group', { memberCount: group.members.length });
  familyGroupStore.setCurrentGroup(group.id);
  void router.push({ name: 'family-group-detail', query: { groupId: group.id } });
}

function onAddDevice() {
  trackConversion('device_activated');
  void router.push({ name: 'add-virtual-device' });
}
</script>

<template>
  <q-page class="family-group-page">
    <!-- Family group list -->
    <template v-if="familyGroups.length">
      <button
        v-for="group in familyGroups"
        :key="group.id"
        class="family-group-card"
        type="button"
        @click="onGroupClick(group)"
      >
        <!-- 儿童头像 -->
        <img :src="getChildAvatar(group)" alt="" class="family-group-card__avatar" />
        <!-- 信息区 -->
        <div class="family-group-card__info">
          <span class="family-group-card__name">{{ group.name }}</span>
          <span class="family-group-card__meta">
            {{ i18n('labels.memberCount', { count: group.members.length }) }}
          </span>
        </div>
        <!-- 箭头 -->
        <q-icon name="chevron_right" size="20px" class="family-group-card__chevron" />
      </button>
    </template>

    <!-- Empty state -->
    <div v-else class="family-group-empty">
      <p class="family-group-empty__text">{{ i18n('labels.emptyState') }}</p>
      <button type="button" class="family-group-empty__btn" @click="onAddDevice">
        {{ i18n('labels.addFirstDevice') }}
      </button>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.family-group-empty {
  margin-top: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.family-group-empty__text {
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 400;
  line-height: 22px;
  color: var(--clr-caption);
  text-align: center;
}

.family-group-empty__btn {
  padding: 10px 28px;
  border: none;
  border-radius: var(--btn-radius, 28px);
  background: var(--clr-btn-primary-bg);
  color: var(--clr-white);
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

// ── 卡片样式 ──
.family-group-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  margin-bottom: 12px;
  background: var(--clr-white);
  border: 1.5px solid rgba(200, 200, 210, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover,
  &:active {
    border-color: rgba(32, 204, 249, 0.4);
  }
}

.family-group-card__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.family-group-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.family-group-card__name {
  font-family: var(--font-family);
  font-size: 16px;
  font-weight: 500;
  color: var(--clr-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.family-group-card__meta {
  font-family: var(--font-family);
  font-size: 13px;
  color: var(--clr-caption);
}

.family-group-card__chevron {
  color: #c4c4cc;
}
</style>
