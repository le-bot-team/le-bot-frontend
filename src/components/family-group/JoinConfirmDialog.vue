<script setup lang="ts">
/**
 * JoinConfirmDialog — 扫码加入家庭组确认弹窗
 *
 * 全局组件，用于被邀请用户扫描二维码后确认加入：
 * 1. 显示邀请人信息 + 家庭组名称
 * 2. 用户选择自己在该家庭中的角色
 * 3. 确认后调用 acceptInvite API 加入
 */

import { ref } from 'vue';

import { useQuasar } from 'quasar';
import { i18nSubPath } from 'src/utils/common';
import { FAMILY_ROLE_OPTIONS, type FamilyUserRole } from 'stores/family-group/types';
import { useFamilyGroupStore } from 'stores/family-group';
import { acceptInvite } from 'src/utils/api/family-group';
import { useAuthStore } from 'stores/auth';

const i18n = i18nSubPath('components.family-group.JoinConfirmDialog');
const $q = useQuasar();
const familyGroupStore = useFamilyGroupStore();
const authStore = useAuthStore();

// ── Props / Emits ──
const props = defineProps<{
  modelValue: boolean;
  inviteCode?: string;
  groupName?: string;
  childName?: string;
  inviterNickname?: string;
  inviterAvatar?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean | null): void;
  (e: 'success', groupId: string): void;
  (e: 'cancel'): void;
}>();

// ── State ──
const selectedRole = ref<FamilyUserRole>('father');
const isJoining = ref(false);
/** Track whether the close was due to a successful join */
const joinSucceeded = ref(false);

function onConfirm() {
  if (!props.inviteCode) return;

  isJoining.value = true;

  const accessToken = authStore.accessToken;
  if (!accessToken) {
    $q.notify({ message: i18n('errors.notLoggedIn'), type: 'negative' });
    isJoining.value = false;
    return;
  }

  acceptInvite(accessToken, {
    code: props.inviteCode,
    role: selectedRole.value,
  })
    .then((res) => {
      if (res.data?.success && res.data.data?.group) {
        familyGroupStore.addGroup(res.data.data.group);
        $q.notify({ message: i18n('notifications.joinSuccess'), type: 'positive' });
        joinSucceeded.value = true;
        emit('update:modelValue', false);
        emit('success', res.data.data.group.id);
      } else {
        const msg = res.data && !res.data.success ? res.data.message : undefined;
        $q.notify({ message: msg ?? i18n('errors.joinFailed'), type: 'negative' });
      }
    })
    .catch((err) => {
      console.error('Failed to join family group:', err);
      $q.notify({ message: i18n('errors.joinFailed'), type: 'negative' });
    })
    .finally(() => {
      isJoining.value = false;
    });
}

function onCancel() {
  emit('update:modelValue', false);
}

function onDialogHide() {
  // Only emit cancel if the close was NOT due to a successful join
  if (!joinSucceeded.value) {
    emit('cancel');
  }
  joinSucceeded.value = false;
}
</script>

<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" @hide="onDialogHide">
    <q-card class="join-confirm-card">
      <!-- 拖拽指示条 -->
      <div class="join-confirm-card__drag-handle" />

      <!-- 邀请人信息 -->
      <div class="join-inviter-row">
        <img
          :src="inviterAvatar"
          alt=""
          class="join-inviter-avatar"
          v-if="inviterAvatar"
        />
        <div class="join-inviter-avatar" v-else>
          <q-icon name="person" size="24px" class="join-inviter-avatar__icon" />
        </div>
        <span class="join-inviter-name">{{ inviterNickname }}</span>
        <span class="join-inviter-label">{{ i18n('labels.invitesYou') }}</span>
      </div>

      <!-- 家庭组名称 -->
      <p class="join-group-name">{{ groupName || childName }}</p>

      <!-- 说明文字 -->
      <p class="join-hint-text">
        {{ i18n('labels.hintText', { childName: childName || '' }) }}
      </p>

      <!-- 角色选择 -->
      <p class="join-role-title">{{ i18n('labels.roleTitle') }}</p>
      <div class="join-role-grid">
        <button
          v-for="opt in FAMILY_ROLE_OPTIONS"
          :key="opt.value"
          type="button"
          class="join-role-chip"
          :class="{ 'join-role-chip--active': selectedRole === opt.value }"
          @click="selectedRole = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- 底部按钮 -->
      <div class="join-actions">
        <button
          type="button"
          class="join-btn join-btn--cancel"
          :disabled="isJoining"
          @click="onCancel"
        >
          {{ i18n('buttons.cancel') }}
        </button>
        <button
          type="button"
          class="join-btn join-btn--confirm"
          :disabled="isJoining"
          @click="onConfirm"
        >
          <template v-if="isJoining">
            <q-spinner-dots size="16px" color="white" class="join-spinner" />
          </template>
          {{ isJoining ? i18n('buttons.joining') : i18n('buttons.confirm') }}
        </button>
      </div>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.join-confirm-card {
  width: calc(100vw - 48px);
  max-width: 360px;
  border-radius: 16px;
  padding: 12px 20px 24px;
}

.join-confirm-card__drag-handle {
  width: 36px;
  height: 4px;
  background: #E0E0E0;
  border-radius: 2px;
  margin: 0 auto 20px;
}

// ── 邀请人信息行 ──
.join-inviter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  margin-bottom: 8px;
}

.join-inviter-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F5F5;
}

.join-inviter-name {
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 500;
  color: var(--clr-text-primary);
}

.join-inviter-avatar__icon {
  color: #BDBDBD;
}

.join-inviter-label {
  font-size: 14px;
  color: var(--clr-caption);
}

// ── 家庭组名称 ──
.join-group-name {
  text-align: center;
  font-family: var(--font-family);
  font-size: 20px;
  font-weight: 600;
  color: #08A8DC;
  margin: 4px 0 6px;
}

.join-hint-text {
  text-align: center;
  font-size: 13px;
  color: var(--clr-caption);
  margin: 0 0 24px;
  line-height: 1.5;
}

// ── 角色选择 ──
.join-role-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--clr-text-primary);
  margin: 0 0 12px;
}

.join-role-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 28px;
}

.join-role-chip {
  padding: 8px 0;
  border: 1.5px solid #E0E0E0;
  border-radius: 10px;
  background: transparent;
  font-family: var(--font-family);
  font-size: 13px;
  color: var(--clr-text);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;

  &:hover {
    border-color: #B0E5F7;
  }

  &--active {
    border-color: #20CCF9;
    background: rgba(32, 204, 249, 0.06);
    color: #08A8DC;
    font-weight: 500;
  }
}

// ── 按钮 ──
.join-actions {
  display: flex;
  gap: 12px;
}

.join-btn {
  flex: 1;
  height: 48px;
  border-radius: 24px;
  font-family: var(--font-family);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &--cancel {
    background: transparent;
    border: 1.5px solid #E0E0E0;
    color: var(--clr-weak);

    &:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.02);
    }
  }

  &--confirm {
    background: var(--clr-btn-primary-bg);
    border: none;
    color: var(--clr-white);

    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  }
}
</style>
