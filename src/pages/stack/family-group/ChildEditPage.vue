<script setup lang="ts">
/**
 * ChildEditPage — 儿童信息编辑/创建页
 *
 * 两种模式（通过路由名区分）:
 * - 创建模式 (family-group-create): 填写儿童信息后创建新家庭组
 * - 编辑模式 (family-group-child-edit): 修改已有儿童信息并同步到 Store
 */

import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import boyAvatar from 'src/assets/lanhu/child-edit/boy-avatar.png';
import girlAvatar from 'src/assets/lanhu/child-edit/girl-avatar.png';
import { router } from 'src/router';
import { i18nSubPath } from 'src/utils/common';
import BirthdayPicker from 'components/BirthdayPicker.vue';
import { useFamilyGroupStore } from 'stores/family-group';
import type { ChildInfo } from 'stores/device/types';
import type { FamilyGroup } from 'stores/family-group/types';
import { useProfileStore } from 'stores/profile';

const i18n = i18nSubPath('pages.stack.family-group.ChildEditPage');
const $q = useQuasar();
const route = useRoute();
const familyGroupStore = useFamilyGroupStore();
const profileStore = useProfileStore();

const isCreateMode = computed(() => route.name === 'family-group-create' || route.name === 'add-virtual-device');

// Sync groupId from route query to store (supports deep-link / refresh)
const urlGroupId = computed(() => route.query.groupId as string | undefined);
watch(urlGroupId, (id) => {
  if (id) familyGroupStore.setCurrentGroup(id);
}, { immediate: true });

// ── 表单数据 ──
const childGender = ref<'boy' | 'girl'>('boy');
const childName = ref('');
const childBirthday = ref('');

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
  }
}

// 路由变化时重新加载（如从详情页返回编辑）
watch(() => route.query.childId, () => {
  loadFromStore();
}, { immediate: true });

function selectGender(gender: 'boy' | 'girl') {
  childGender.value = gender;
}

/** 提交表单 */
function onSubmit() {
  if (!childName.value.trim() || !childBirthday.value.trim()) {
    $q.notify({ message: i18n('notifications.fieldsRequired'), type: 'warning' });
    return;
  }

  const childInfo: ChildInfo = {
    name: childName.value.trim(),
    gender: childGender.value,
    birthday: childBirthday.value.trim(),
  };

  if (isCreateMode.value) {
    // TODO: replace with createFamilyGroup API call once backend endpoint is available.
    // For now, create a local placeholder group so the list reflects the new group.
    const groupId = `local-${Date.now()}`;
    const newGroup: FamilyGroup = {
      id: groupId,
      name: `${childInfo.name}的家庭组`,
      childName: childInfo.name,
      deviceId: '',
      creatorId: profileStore.profile?.id ?? '',
      createdAt: new Date().toISOString(),
      members: [
        {
          id: `child-${Date.now()}`,
          memberType: 'child',
          childInfo,
          isCreator: false,
          joinedAt: new Date().toISOString(),
        },
      ],
    };
    familyGroupStore.addGroup(newGroup);
    $q.notify({ message: i18n('notifications.createSuccess'), type: 'positive' });
    setTimeout(() => {
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
    setTimeout(() => {
      router.go(-1);
    }, 600);
  } catch (err) {
    console.error('Failed to update child info:', err);
    $q.notify({ message: i18n('notifications.updateFailed'), type: 'negative' });
  }
}

function onSkip() {
  void router.replace({ name: 'family-groups' });
}
</script>

<template>
  <q-page class="child-edit-page">
    <p class="child-edit-question child-edit-question--first">
      {{ i18n('questions.gender') }}
    </p>
    <div class="child-edit-gender-row">
      <button type="button" class="child-edit-gender-option" @click="selectGender('boy')">
        <span class="child-edit-avatar">
          <img :src="boyAvatar" alt="boy avatar" />
        </span>
        <span
          class="child-edit-gender-label"
          :class="{ 'child-edit-gender-label--active': childGender === 'boy' }"
        >
          {{ i18n('labels.male') }}
        </span>
      </button>
      <button type="button" class="child-edit-gender-option" @click="selectGender('girl')">
        <span class="child-edit-avatar">
          <img :src="girlAvatar" alt="girl avatar" />
        </span>
        <span
          class="child-edit-gender-label"
          :class="{ 'child-edit-gender-label--active': childGender === 'girl' }"
        >
          {{ i18n('labels.female') }}
        </span>
      </button>
    </div>

    <p class="child-edit-question child-edit-question--followup">
      {{ i18n('questions.name') }}
    </p>
    <input
      v-model="childName"
      class="child-edit-input"
      type="text"
      :placeholder="i18n('placeholders.name')"
    />

    <p class="child-edit-question child-edit-question--followup">
      {{ i18n('questions.birthday') }}
    </p>
    <BirthdayPicker
      v-model="childBirthday"
      :placeholder="i18n('placeholders.birthday')"
    />

    <button
      type="button"
      class="child-edit-primary-btn"
      :class="{ 'child-edit-primary-btn--single': !isCreateMode }"
      @click="onSubmit"
    >
      {{ isCreateMode ? i18n('labels.next') : i18n('labels.submitChanges') }}
    </button>
    <button v-if="isCreateMode" type="button" class="child-edit-skip-btn" @click="onSkip">
      {{ i18n('labels.skip') }}
    </button>
  </q-page>
</template>

<style scoped></style>
