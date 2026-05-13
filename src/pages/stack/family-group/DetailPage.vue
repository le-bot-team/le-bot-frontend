<script setup lang="ts">
/**
 * FamilyGroupDetailPage — 家庭组详情页
 *
 * 展示某个家庭组的完整信息：
 * - 儿童信息头卡（头像 + 姓名 + 性别/年龄 + 设备名）
 * - 成员列表（儿童卡片可编辑，成人卡片可查看）
 * - 底部"邀请成员"按钮（仅创建者可见）
 *
 * 数据源从 FamilyGroupStore.currentGroup 读取。
 */

import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { i18nSubPath } from 'src/utils/common';
import { useFamilyGroupStore } from 'stores/family-group';
import type { FamilyMember, FamilyMemberRole } from 'stores/family-group/types';
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
if (urlGroupId.value) familyGroupStore.setCurrentGroup(urlGroupId.value);

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

/** 角色标签文本 */
function roleLabel(role?: FamilyMemberRole): string {
  const map: Record<string, string> = {
    father: i18n('role.father'),
    mother: i18n('role.mother'),
    grandpa: i18n('role.grandpa'),
    grandma: i18n('role.grandma'),
    friend: i18n('role.friend'),
    other: i18n('role.other'),
  };
  return role ? (map[role] ?? role) : '';
}

function onMemberClick(member: FamilyMember) {
  if (member.memberType === 'child') {
    void router.push({
      name: 'family-group-child-edit',
      query: { childId: member.id },
    });
    return;
  }
  void router.push({
    name: 'family-group-member',
    query: { memberId: member.id },
  });
}

function onInvite() {
  void router.push({ name: 'family-group-invite', query: { groupId: group.value?.id } });
}
</script>

<template>
  <q-page class="detail-page">
    <!-- ── 儿童信息头卡 ── -->
    <div v-if="child" class="detail-child-header">
      <img
        :src="getAvatar(child)"
        alt=""
        class="detail-child-header__avatar"
      />
      <div class="detail-child-header__info">
        <span class="detail-child-header__name">{{ child.childInfo?.name }}</span>
        <span class="detail-child-header__badge">
          {{ child.childInfo?.gender === 'girl' ? i18n('meta.female') : i18n('meta.male') }}
          {{ childAge(child.childInfo?.birthday) }}{{ i18n('meta.yearsUnit') }}
        </span>
      </div>
      <span v-if="group" class="detail-child-header__device">
        {{ child.childInfo?.name }}{{ i18n('meta.deviceSuffix') }}
      </span>
    </div>

    <!-- ── 成员列表区域 ── -->
    <p v-if="members.length > 0" class="detail-section-title">
      {{ i18n('labels.membersTitle', { count: members.length }) }}
    </p>

    <template v-if="adultMembers.length">
      <div
        v-for="member in adultMembers"
        :key="member.id"
        class="detail-member-card"
        role="button"
        @click="onMemberClick(member)"
      >
        <img :src="getAvatar(member)" alt="" class="detail-member-card__avatar" />
        <div class="detail-member-card__info">
          <div class="detail-member-card__name-row">
            <span class="detail-member-card__name">{{ member.nickname }}</span>
            <span v-if="member.isCreator" class="detail-member-card__creator-tag">{{ i18n('labels.creator') }}</span>
          </div>
          <span class="detail-member-card__role">{{ roleLabel(member.role) }}</span>
        </div>
        <!-- 创建者标识 -->
        <q-icon
          v-if="member.isCreator"
          name="star"
          size="16px"
          color="#FFB800"
          class="detail-member-card__creator-badge"
        />
        <q-icon v-else name="chevron_right" size="16px" color="#C4C4CC" />
      </div>
    </template>

    <!-- 底部操作区：仅创建者可见邀请按钮 -->
    <button
      v-if="isCreator"
      class="family-group-add-btn detail-invite-btn"
      type="button"
      @click="onInvite"
    >
      {{ i18n('labels.invite') }}
    </button>
  </q-page>
</template>

<style scoped lang="scss">
.detail-page {
  padding-top: 24px;
}

// ── 儿童头卡 ──
.detail-child-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 20px 24px;
  margin-bottom: 4px;
  background: var(--clr-white);
  border-radius: 12px;
}

.detail-child-header__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.detail-child-header__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.detail-child-header__name {
  font-family: var(--font-family);
  font-size: 18px;
  font-weight: 600;
  color: var(--clr-text-primary);
}

.detail-child-header__badge {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  color: #08A8DC;
  background: rgba(32, 204, 249, 0.1);
  border-radius: 10px;
}

.detail-child-header__device {
  font-size: 13px;
  color: var(--clr-link);
}

// ── Section 标题 ──
.detail-section-title {
  padding: 16px 20px 8px;
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: 500;
  color: var(--clr-caption);
}

// ── 成员卡片 ──
.detail-member-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  margin-bottom: 1px;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover,
  &:active {
    background: rgba(0, 0, 0, 0.02);
  }
}

.detail-member-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.detail-member-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.detail-member-card__name {
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 400;
  color: var(--clr-text-primary);
}

.detail-member-card__name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-member-card__creator-tag {
  display: inline-block;
  padding: 0 6px;
  font-size: 10px;
  line-height: 16px;
  color: #FFB800;
  background: rgba(255, 184, 0, 0.1);
  border-radius: 8px;
  white-space: nowrap;
}

.detail-member-card__role {
  font-size: 13px;
  color: var(--clr-caption);
}

.detail-member-card__creator-badge {
  flex-shrink: 0;
}

// ── 邀请按钮 ──
.detail-invite-btn {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
