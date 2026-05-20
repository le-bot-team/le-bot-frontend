<script setup lang="ts">
/**
 * FamilyGroupDetailPage — 家庭组详情页
 *
 * 展示某个家庭组的完整信息（对齐蓝湖设计稿 eb36a568）：
 * - 儿童区域：100×100px 圆形头像 + 居中姓名 + 性别/年龄
 * - 成员列表（名称 | → | 角色行），点击跳转
 * - 底部"邀请成员"按钮（仅创建者可见）
 *
 * 数据源从 FamilyGroupStore.currentGroup 读取。
 */

import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import { i18nSubPath } from 'src/utils/common';
import { createRoleLabel } from 'src/utils/family-group/role-labels';
import { useFamilyGroupStore } from 'stores/family-group';
import type { FamilyMember } from 'stores/family-group/types';
import { useProfileStore } from 'stores/profile';
import { router } from 'src/router';
import boyAvatarUrl from 'src/assets/lanhu/child-edit/boy-avatar.png';
import girlAvatarUrl from 'src/assets/lanhu/child-edit/girl-avatar.png';

const i18n = i18nSubPath('pages.stack.family-group.DetailPage');
const route = useRoute();
const familyGroupStore = useFamilyGroupStore();
const profileStore = useProfileStore();

// 从 URL query 同步 groupId 到 store
const urlGroupId = computed(() => route.query.groupId as string | undefined);
watch(urlGroupId, (id) => {
  if (id) familyGroupStore.setCurrentGroup(id);
}, { immediate: true });

/** 当前家庭组 */
const group = computed(() => familyGroupStore.currentGroup);

/** 当前成员列表 */
const members = computed<FamilyMember[]>(
  () => group.value?.members ?? [],
);

/** 儿童成员 */
const child = computed(() => members.value.find((m) => m.memberType === 'child'));

/** 成人成员列表 */
const adultMembers = computed(() => members.value.filter((m) => m.memberType === 'user'));

/** 是否为当前用户创建 */
const isCreator = computed(() => {
  if (!group.value) return false;
  return group.value.creatorId === profileStore.profile?.id;
});

/** 根据性别获取头像 */
function getAvatar(member: FamilyMember): string {
  if (member.memberType === 'child' && member.childInfo) {
    return member.childInfo.gender === 'girl' ? girlAvatarUrl : boyAvatarUrl;
  }
  return member.avatar || boyAvatarUrl;
}

/** 计算儿童年龄 */
function childAge(birthday?: string): number {
  if (!birthday) return 0;
  const birth = new Date(birthday);
  if (isNaN(birth.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (
    now.getMonth() < birth.getMonth()
    || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  ) {
    age--;
  }
  return Math.max(0, age);
}

/** 角色标签文本（role 未定义时显示 - 以保证卡片布局完整） */
const roleLabel = createRoleLabel(i18n);

function onMemberClick(member: FamilyMember) {
  if (member.memberType === 'child') {
    void router.push({
      name: 'family-group-child-edit',
      query: { childId: member.id, groupId: group.value?.id },
    });
    return;
  }
  void router.push({
    name: 'family-group-member',
    query: { memberId: member.id, groupId: group.value?.id },
  });
}

function onInvite() {
  void router.push({ name: 'family-group-invite', query: { groupId: group.value?.id } });
}
</script>

<template>
  <q-page class="family-group-page detail-page">
    <!-- ── 儿童区域：100px 圆形头像居中 ── -->
    <button
      v-if="child"
      class="detail-child-zone"
      type="button"
      @click="onMemberClick(child)"
    >
      <img
        :src="getAvatar(child)"
        alt=""
        class="detail-child-zone__avatar"
      />
      <span class="detail-child-zone__name">{{ child.childInfo?.name }}</span>
      <span class="detail-child-zone__meta">
        {{ child.childInfo?.gender === 'girl' ? i18n('meta.female') : i18n('meta.male') }}
        {{ childAge(child.childInfo?.birthday) }}{{ i18n('meta.yearsUnit') }}
      </span>
    </button>

    <!-- ── 成员列表（复用全局 .family-group-member-card 系列 class）── -->
    <template v-if="adultMembers.length">
      <button
        v-for="member in adultMembers"
        :key="member.id"
        class="family-group-member-card"
        type="button"
        @click="onMemberClick(member)"
      >
        <span class="family-group-member-name">
          {{ member.nickname }}
          <span
            v-if="member.isCreator"
            class="detail-creator-tag"
          >{{ i18n('labels.creator') }}</span>
        </span>
        <span class="family-group-member-meta">{{ roleLabel(member.role) }}</span>
        <svg class="family-group-member-chevron" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L6 6L1 11" stroke="#9398A9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </template>

    <!-- 底部操作区：仅创建者可见邀请按钮（复用全局 .family-group-add-btn） -->
    <button
      v-if="isCreator"
      class="family-group-add-btn"
      type="button"
      @click="onInvite"
    >
      {{ i18n('labels.invite') }}
    </button>
  </q-page>
</template>

<style scoped lang="scss">
// ── 儿童区域：100px 圆形头像，居中布局 ──
// 对齐蓝湖设计稿 eb36a568 组310
.detail-child-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 24px 0 28px;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.8;
  }
}

.detail-child-zone__avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.detail-child-zone__name {
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 400;
  line-height: 22px;
  color: var(--clr-text);
  margin-top: 2px;
}

.detail-child-zone__meta {
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 400;
  line-height: 22px;
  color: var(--clr-caption);
}

// ── 创建者标签（保留当前显示）──
.detail-creator-tag {
  display: inline-block;
  padding: 0 6px;
  margin-left: 6px;
  font-size: 10px;
  line-height: 16px;
  color: #FFB800;
  background: rgba(255, 184, 0, 0.1);
  border-radius: 8px;
  white-space: nowrap;
  vertical-align: middle;
}
</style>
