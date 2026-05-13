<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { i18nSubPath } from 'src/utils/common';
import { updateProfileInfo } from 'src/utils/api/profile';
import type { UpdateProfileInfoRequest } from 'src/types/api/profile';
import { useAuthStore } from 'stores/auth';
import { useProfileStore } from 'stores/profile';
import BirthdayPicker from 'components/BirthdayPicker.vue';

type FieldKey = 'nickname' | 'birthday' | 'bio';

const i18n = i18nSubPath('pages.stack.ProfileFieldEditPage');

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const authStore = useAuthStore();
const { accessToken } = storeToRefs(authStore);

const profileStore = useProfileStore();
const { profile } = storeToRefs(profileStore);
const { updateProfile } = profileStore;

const fieldKey = computed<FieldKey>(() => {
  const raw = Array.isArray(route.query.field) ? route.query.field[0] : route.query.field;
  if (raw === 'nickname' || raw === 'birthday' || raw === 'bio') return raw;
  return 'nickname';
});

const fieldLabel = computed(() => i18n(`labels.${fieldKey.value}`));
const placeholder = computed(() => {
  if (fieldKey.value === 'nickname') return i18n('labels.placeholderNickname');
  if (fieldKey.value === 'birthday') return i18n('labels.placeholderBirthday');
  return i18n('labels.placeholderBio');
});

const value = ref<string>('');
const isSubmitting = ref(false);

const syncFromProfile = () => {
  const p = profile.value;
  if (!p) {
    value.value = '';
    return;
  }
  switch (fieldKey.value) {
    case 'nickname':
      value.value = p.nickname ?? '';
      break;
    case 'birthday':
      value.value = p.birthday ?? '';
      break;
    case 'bio':
      value.value = p.bio ?? '';
      break;
  }
};

syncFromProfile();
watch([fieldKey, profile], syncFromProfile);

const canSubmit = computed(() => !isSubmitting.value);

const onSave = async () => {
  if (!canSubmit.value) return;
  const token = accessToken.value;
  if (!token) {
    $q.notify({ type: 'negative', message: i18n('notifications.saveFailed') });
    return;
  }

  isSubmitting.value = true;
  try {
    const payload: UpdateProfileInfoRequest = {};
    payload[fieldKey.value] = value.value;
    const { data } = await updateProfileInfo(token, payload);
    if (data.success) {
      if (profile.value) {
        updateProfile({ ...profile.value, [fieldKey.value]: value.value });
      }
      $q.notify({ type: 'positive', message: i18n('notifications.saveSuccess') });
      router.back();
    } else {
      $q.notify({ type: 'negative', message: data.message ?? i18n('notifications.saveFailed') });
    }
  } catch {
    $q.notify({ type: 'negative', message: i18n('notifications.saveFailed') });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <q-page class="me-page column items-center q-pa-lg q-gutter-y-lg">
    <div class="field-edit-container column q-gutter-y-md">
      <label class="field-edit-label">{{ fieldLabel }}</label>

      <div v-if="fieldKey === 'bio'" class="field-edit-input-group field-edit-input-group--area">
        <textarea
          v-model="value"
          class="design-input design-textarea"
          :placeholder="placeholder"
          rows="4"
          maxlength="200"
          :disabled="isSubmitting"
        />
      </div>
      <div v-else-if="fieldKey === 'birthday'" class="field-edit-input-group">
        <BirthdayPicker
          v-model="value"
          :disabled="isSubmitting"
        />
      </div>
      <div v-else class="field-edit-input-group">
        <input
          v-model="value"
          class="design-input"
          type="text"
          :placeholder="placeholder"
          :disabled="isSubmitting"
          :maxlength="fieldKey === 'nickname' ? 30 : undefined"
        />
      </div>

      <button
        class="btn-primary"
        type="button"
        :class="{ 'btn-primary--disabled': !canSubmit }"
        :disabled="!canSubmit"
        @click="onSave"
      >
        {{ i18n('labels.save') }}
      </button>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.field-edit-container {
  width: 100%;
  max-width: 480px;
}

.field-edit-label {
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-text);
}

.field-edit-input-group {
  width: 100%;
  height: 48px;
  border: 1px solid rgba(147, 152, 169, 0.2);
  border-radius: 8px;
  background: var(--clr-card-bg);
  display: flex;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: var(--clr-link);
  }

  &--area {
    height: auto;
    min-height: 120px;
    align-items: stretch;
  }
}

.design-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-text);
  padding: 13px 16px;
  box-sizing: border-box;

  &::placeholder {
    font-weight: 400;
    color: var(--clr-caption);
  }
}

.design-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 22px;
}

.btn-primary {
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 28px;
  background: rgba(18, 14, 44, 1);
  color: #fff;
  font-family: var(--font-family);
  font-size: 17px;
  font-weight: 500;
  line-height: 24px;
  cursor: pointer;
  margin-top: 24px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
