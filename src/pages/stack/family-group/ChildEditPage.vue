<script setup lang="ts">
/**
 * ChildEditPage — 儿童信息编辑/创建页
 *
 * 两种模式（通过路由名区分）:
 * - 创建模式 (family-group-create): 填写儿童信息后创建新家庭组
 * - 编辑模式 (family-group-child-edit): 修改已有儿童信息并同步到 Store
 */

import { useQuasar } from 'quasar';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { router } from 'src/router';
import { i18nSubPath } from 'src/utils/common';
import ChildInfoForm from 'components/ChildInfoForm.vue';
import { useFamilyGroupStore } from 'stores/family-group';
import type { ChildInfo } from 'stores/device/types';
import type { FamilyGroup } from 'stores/family-group/types';
import { useProfileStore } from 'stores/profile';

const i18n = i18nSubPath('pages.stack.family-group.ChildEditPage');
const $q = useQuasar();
const route = useRoute();
const familyGroupStore = useFamilyGroupStore();
const profileStore = useProfileStore();

const isCreateMode = computed(
  () => route.name === 'family-group-create' || route.name === 'add-virtual-device',
);

// Navigation timer (cleared on unmount to prevent stale navigation)
let navTimer: ReturnType<typeof setTimeout> | null = null;

// Sync groupId from route query to store (supports deep-link / refresh)
const urlGroupId = computed(() => route.query.groupId as string | undefined);
watch(
  urlGroupId,
  (id) => {
    if (id) familyGroupStore.setCurrentGroup(id);
  },
  { immediate: true },
);

// ── 表单数据 ──
const childGender = ref<'boy' | 'girl'>('boy');
const childName = ref('');
const childBirthday = ref('');
const childAvatar = ref<string | undefined>(undefined);

// 编辑模式下从 store 加载已有数据
function loadFromStore() {
  if (isCreateMode.value) {
    // 创建模式使用空值或默认值
    return;
  }
  const currentChild = familyGroupStore.currentChild;
  if (currentChild?.childInfo) {
    childGender.value = currentChild.childInfo.gender ?? 'boy';
    childName.value = currentChild.childInfo.name ?? '';
    childBirthday.value = currentChild.childInfo.birthday ?? '';
    childAvatar.value = currentChild.childInfo.avatar;
  }
}

// 路由变化时重新加载（如从详情页返回编辑）
watch(
  () => route.query.childId,
  () => {
    loadFromStore();
  },
  { immediate: true },
);

/** Maximum allowed length for child name */
const MAX_NAME_LENGTH = 20;

/** 提交表单 */
function onSubmit() {
  if (!childName.value.trim() || !childBirthday.value.trim()) {
    $q.notify({ message: i18n('notifications.fieldsRequired'), type: 'warning' });
    return;
  }
  if (childName.value.trim().length > MAX_NAME_LENGTH) {
    $q.notify({ message: i18n('notifications.nameTooLong'), type: 'warning' });
    return;
  }

  const childInfo: ChildInfo = {
    name: childName.value.trim(),
    gender: childGender.value,
    birthday: childBirthday.value.trim(),
    avatar: childAvatar.value,
  };

  if (isCreateMode.value) {
    // TODO: replace with createFamilyGroup API call once backend endpoint is available.
    // Creates a local draft group so the list reflects the new group immediately.
    // Draft groups are marked with isLocalDraft and will be replaced by real groups
    // once the API is integrated.
    const groupId = crypto.randomUUID();
    const newGroup: FamilyGroup = {
      id: groupId,
      name: `${childInfo.name}的家庭组`,
      childName: childInfo.name,
      deviceId: '',
      creatorId: profileStore.profile?.id ?? '',
      createdAt: new Date().toISOString(),
      isLocalDraft: true,
      members: [
        {
          id: crypto.randomUUID(),
          memberType: 'child',
          childInfo,
          isCreator: false,
          joinedAt: new Date().toISOString(),
        },
      ],
    };
    familyGroupStore.addGroup(newGroup);
    $q.notify({ message: i18n('notifications.createSuccess'), type: 'positive' });
    navTimer = setTimeout(() => {
      void router.replace({ name: 'family-groups' });
    }, 600);
    return;
  }

  // 编辑模式: 更新 store 中的儿童信息 + 调用 API
  try {
    familyGroupStore.updateChildInfo(childInfo);

    // TODO: 接入 updateChildInfoApi 后取消注释以下调用
    // const token = authStore.accessToken;
    // const groupId = familyGroupStore.currentGroupId;
    // if (token && groupId) {
    //   await updateChildInfoApi(groupId, { childInfo }, token);
    // }

    $q.notify({ message: i18n('notifications.updateSuccess'), type: 'positive' });
    navTimer = setTimeout(() => {
      router.go(-1);
    }, 600);
  } catch (err) {
    console.error('Failed to update child info:', err);
    $q.notify({ message: i18n('notifications.updateFailed'), type: 'negative' });
  }
}

onBeforeUnmount(() => {
  if (navTimer) {
    clearTimeout(navTimer);
    navTimer = null;
  }
});
</script>

<template>
  <q-page class="child-edit-page">
    <ChildInfoForm
      v-model:gender="childGender"
      v-model:name="childName"
      v-model:birthday="childBirthday"
      v-model:avatar="childAvatar"
    />

    <!-- Primary action button -->
    <button type="button" class="child-edit-primary-btn" @click="onSubmit">
      {{ isCreateMode ? i18n('labels.next') : i18n('labels.submitChanges') }}
    </button>
  </q-page>
</template>
