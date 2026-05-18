<script setup lang="ts">
/**
 * FamilyGroupMemberPage — 成员信息页
 *
 * 展示成人成员的详细信息：称呼、性别、身份、生日。
 * 创建者可见"删除成员"操作（带二次确认），不可删除自己。
 * 数据从 FamilyGroupStore.currentMembers 读取。
 */

import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { useQuasar } from 'quasar';

import { i18nSubPath } from 'src/utils/common';
import { useFamilyGroupStore } from 'stores/family-group';
import type { FamilyMember, FamilyUserRole } from 'stores/family-group/types';
import { removeMember as removeMemberApi } from 'src/utils/api/family-group';
import { useAuthStore } from 'stores/auth';
import { useProfileStore } from 'stores/profile';
import { router } from 'src/router';

const i18n = i18nSubPath('pages.stack.family-group.MemberPage');
const $q = useQuasar();
const route = useRoute();
const familyGroupStore = useFamilyGroupStore();
const authStore = useAuthStore();
const profileStore = useProfileStore();

/** 当前查看的成员（找不到时为 undefined） */
const member = computed<FamilyMember | undefined>(() => {
  const memberId = (route.query.memberId as string | undefined) ?? '';
  return familyGroupStore.currentMembers.find((m) => m.id === memberId);
});

/** 成员是否有效（非 placeholder） */
const isMemberFound = computed(() => !!member.value);

/** 角色映射 */
function roleLabel(role?: FamilyUserRole): string {
  if (!role) return '-';
  const labels: Record<FamilyUserRole, string> = {
    father: i18n('role.father'),
    mother: i18n('role.mother'),
    grandpa: i18n('role.grandpa'),
    grandma: i18n('role.grandma'),
    paternal_grandmother: i18n('role.paternalGrandmother'),
    maternal_grandfather: i18n('role.maternalGrandfather'),
    maternal_grandma: i18n('role.maternalGrandma'),
    friend: i18n('role.friend'),
    other: i18n('role.other'),
  };
  return labels[role] ?? role;
}

/** 格式化日期（年 / 月 / 日） */
function formatDate(isoString: string): string {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '-';
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 当前家庭组 */
const group = computed(() => familyGroupStore.currentGroup);

/**
 * 是否可以删除该成员：
 * - 成员必须存在
 * - 当前用户必须是家庭组创建者
 * - 目标成员不能是创建者自己（不能删除自己）
 * - 目标成员不能是当前登录用户
 */
const canRemove = computed(() => {
  if (!member.value || !group.value) return false;
  const currentUserId = profileStore.profile?.id;
  const isCurrentUserCreator = group.value.creatorId === currentUserId;
  // Block removal of self (by userId match) or creator
  const isSelf = member.value.userId === currentUserId;
  return isCurrentUserCreator && !member.value.isCreator && !isSelf;
});

function onRemove() {
  if (!member.value) return;
  const m = member.value;
  $q.dialog({
    title: i18n('confirm.title'),
    message: i18n('confirm.message', { name: m.nickname ?? '-' }),
    cancel: { label: i18n('confirm.cancel'), flat: true },
    ok: { label: i18n('confirm.ok'), color: 'negative' },
    persistent: true,
  }).onOk(() => {
    const token = authStore.accessToken;
    const groupId = familyGroupStore.currentGroupId;
    if (!token || !groupId) return;

    removeMemberApi(groupId, m.id, token)
      .then((res) => {
        if (res.data?.success) {
          familyGroupStore.removeMember(m.id);
          $q.notify({ message: i18n('notifications.removed'), type: 'positive' });
          router.go(-1);
        } else {
          $q.notify({
            message: res.data && !res.data.success ? res.data.message : i18n('errors.removeFailed'),
            type: 'negative',
          });
        }
      })
      .catch((err) => {
        console.error('Failed to remove member:', err);
        $q.notify({ message: i18n('errors.removeFailed'), type: 'negative' });
      });
  });
}
</script>

<template>
  <q-page class="family-group-page member-page">
    <!-- 成员未找到时显示空状态 -->
    <div v-if="!isMemberFound" class="member-not-found">
      <p>{{ i18n('errors.memberNotFound') }}</p>
    </div>

    <template v-else>
      <!-- 信息卡片（复用全局 .family-member-info-* class） -->
      <div class="family-member-info-card">
        <div class="family-member-info-row">
          <span class="family-member-info-label">{{ i18n('labels.nickname') }}</span>
          <span class="family-member-info-value">{{ member!.nickname }}</span>
        </div>
        <div class="family-member-info-row">
          <span class="family-member-info-label">{{ i18n('labels.gender') }}</span>
          <span class="family-member-info-value">
            {{ member!.gender === 'female' ? i18n('meta.female') : member!.gender === 'male' ? i18n('meta.male') : '-' }}
          </span>
        </div>
        <div class="family-member-info-row">
          <span class="family-member-info-label">{{ i18n('labels.roleLabel') }}</span>
          <span class="family-member-info-value">{{ roleLabel(member!.role) }}</span>
        </div>
        <div class="family-member-info-row">
          <span class="family-member-info-label">{{ i18n('labels.birthday') }}</span>
          <span class="family-member-info-value">{{ member!.birthday ? formatDate(member!.birthday) : '-' }}</span>
        </div>
      </div>

      <!-- 删除成员按钮（复用全局 .family-member-delete-btn） -->
      <button v-if="canRemove" type="button" class="family-member-delete-btn" @click="onRemove">
        {{ i18n('buttons.remove') }}
      </button>
    </template>
  </q-page>
</template>

<style scoped lang="scss">
// 页面级微调，所有主要样式复用 app.scss 中的全局 class
.member-page {
  padding-top: 16px;
}

.member-not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 20px;
  color: var(--clr-caption);
  font-size: 15px;
}
</style>
