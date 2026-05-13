<script setup lang="ts">
/**
 * FamilyGroupMemberPage — 成员信息页
 *
 * 展示成人成员的详细信息：头像、昵称、角色、性别、生日、加入时间、声纹。
 * 创建者可见"移除成员"操作（带二次确认）。
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
import { router } from 'src/router';

const i18n = i18nSubPath('pages.stack.family-group.MemberPage');
const $q = useQuasar();
const route = useRoute();
const familyGroupStore = useFamilyGroupStore();
const authStore = useAuthStore();

/** 当前查看的成员 */
const member = computed<FamilyMember>(() => {
  const memberId = (route.query.memberId as string | undefined) ?? '';
  return familyGroupStore.currentMembers.find((m) => m.id === memberId) ?? createPlaceholder(memberId);
});

function createPlaceholder(id: string): FamilyMember {
  // Fallback for members not yet in store (backward compat with old mock)
  const map: Record<string, Partial<FamilyMember>> = {
    'father-1': { nickname: '广志', role: 'father', gender: 'male' },
    'mother-1': { nickname: '美伢', role: 'mother', gender: 'female' },
    'grandpa-1': { nickname: '小新爷爷', role: 'grandpa', gender: 'male' },
  };
  const data = map[id] ?? {};
  return {
    id,
    memberType: 'user',
    nickname: data.nickname ?? id,
    ...(data.role ? { role: data.role } : {}),
    gender: data.gender ?? 'male',
    isCreator: false,
    joinedAt: new Date().toISOString(),
  };
}

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

/** 格式化日期 */
function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return `${d.getFullYear()}年${d.getMonth() + 1}月`;
  } catch {
    return '-';
  }
}

/** 是否为创建者（可执行删除） */
const canRemove = computed(() => {
  // TODO: 与 authStore.userId 比对当前用户是否为 creator
  return !member.value.isCreator;
});

function onRemove() {
  $q.dialog({
    title: i18n('confirm.title'),
    message: i18n('confirm.message', { name: member.value.nickname }),
    cancel: { label: i18n('confirm.cancel'), flat: true },
    ok: { label: i18n('confirm.ok'), color: 'negative' },
    persistent: true,
  }).onOk(() => {
    const token = authStore.accessToken;
    const groupId = familyGroupStore.currentGroupId;
    if (!token || !groupId) return;

    removeMemberApi(groupId, member.value.id, token)
      .then((res) => {
        if (res.data?.success) {
          familyGroupStore.removeMember(member.value.id);
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
  <q-page class="family-member-page">
    <!-- 头部：大头像 + 昵称 + 角色 -->
    <div class="member-header">
      <div class="member-header__avatar">
        <img v-if="member.avatar" :src="member.avatar" alt="" />
        <q-icon v-else name="person" size="40px" color="#C4C4CC" />
      </div>
      <span class="member-header__name">{{ member.nickname }}</span>
      <span class="member-header__badge">{{ roleLabel(member.role) }}</span>
      <p class="member-header__joined">
        {{ i18n('labels.joinedAt', { time: formatDate(member.joinedAt) }) }}
      </p>
    </div>

    <!-- 信息卡片 -->
    <div class="member-info-card">
      <div class="member-info-row">
        <span class="member-info-label">{{ i18n('labels.nickname') }}</span>
        <span class="member-info-value">{{ member.nickname }}</span>
      </div>
      <div class="member-info-row">
        <span class="member-info-label">{{ i18n('labels.gender') }}</span>
        <span class="member-info-value">
          {{ member.gender === 'female' ? i18n('meta.female') : i18n('meta.male') }}
        </span>
      </div>
      <div class="member-info-row">
        <span class="member-info-label">{{ i18n('labels.roleLabel') }}</span>
        <span class="member-info-value">{{ roleLabel(member.role) }}</span>
      </div>
      <div class="member-info-row">
        <span class="member-info-label">{{ i18n('labels.birthday') }}</span>
        <span class="member-info-value">{{ member.birthday ? formatDate(member.birthday) : '-' }}</span>
      </div>

      <!-- 声纹信息行 -->
      <div
        v-if="member.hasVoiceprint"
        class="member-info-row member-info-row--clickable"
        @click="
          void router.push({
            name: 'settings-voiceprint-detail',
            params: { personId: member.voiceprintPersonId },
          })
        "
      >
        <span class="member-info-label">
          <q-icon name="graphic_eq" size="16px" color="#08A8DC" class="q-mr-xs" />
          {{ i18n('labels.voiceprint') }}
        </span>
        <span class="member-info-value member-info-value--link">
          {{ i18n('labels.viewVoiceprint') }}
          <q-icon name="chevron_right" size="14px" color="#C4C4CC" />
        </span>
      </div>
    </div>

    <!-- 危险操作区：仅非本人且当前用户为 creator 时显示 -->
    <button v-if="canRemove" type="button" class="member-remove-btn" @click="onRemove">
      {{ i18n('buttons.remove') }}
    </button>
  </q-page>
</template>

<style scoped lang="scss">
.family-member-page {
  padding-top: 24px;
}

// ── 头部 ──
.member-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-bottom: 28px;
}

.member-header__avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F5F5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.member-header__name {
  font-family: var(--font-family);
  font-size: 20px;
  font-weight: 600;
  color: var(--clr-text-primary);
}

.member-header__badge {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  color: #08A8DC;
  background: rgba(32, 204, 249, 0.08);
  border-radius: 8px;
}

.member-header__joined {
  font-size: 13px;
  color: var(--clr-caption);
  margin: 0;
}

// ── 信息卡片 ──
.member-info-card {
  background: var(--clr-white);
  border-radius: 12px;
  padding: 0 20px;
  border: 1.5px solid rgba(200, 200, 210, 0.2);
}

.member-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);

  &:last-child {
    border-bottom: none;
  }

  &--clickable {
    cursor: pointer;

    &:hover {
      background: rgba(32, 204, 249, 0.03);
    }
  }
}

.member-info-label {
  font-size: 14px;
  color: var(--clr-caption);
}

.member-info-value {
  font-size: 14px;
  color: var(--clr-text-primary);

  &--link {
    display: flex;
    align-items: center;
    gap: 2px;
    color: #08A8DC;
  }
}

// ── 删除按钮 ──
.member-remove-btn {
  width: calc(100% - 64px);
  max-width: 311px;
  height: 48px;
  margin: 36px auto 20px;
  display: block;
  background: transparent;
  border: none;
  font-family: var(--font-family);
  font-size: 15px;
  color: var(--clr-danger-bg, #FF5C5C);
  cursor: pointer;
  text-align: center;

  &:hover {
    opacity: 0.75;
  }
}
</style>
