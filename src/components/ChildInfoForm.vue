<script setup lang="ts">
/**
 * ChildInfoForm — shared child info form component (gender + name + birthday).
 *
 * Used by both ChildEditPage and AddVirtualDevicePage (Step 1).
 * All i18n keys are resolved under ChildEditPage's namespace so the same
 * text is shown regardless of which parent page renders this component.
 */

import { computed } from 'vue';

import boyAvatar from 'src/assets/lanhu/child-edit/boy-avatar.png';
import girlAvatar from 'src/assets/lanhu/child-edit/girl-avatar.png';
import questionIcon from 'src/assets/lanhu/child-edit/question-icon.png';
import { i18nSubPath } from 'src/utils/common';
import AvatarPicker from 'components/AvatarPicker.vue';
import BirthdayPicker from 'components/BirthdayPicker.vue';

const i18n = i18nSubPath('pages.stack.family-group.ChildEditPage');

interface Props {
  gender: 'boy' | 'girl';
  name: string;
  birthday: string;
  avatar?: string | undefined;
  nameMaxlength?: number;
  defaultYear?: number;
  /** Whether to show the avatar picker (default: true) */
  showAvatar?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  nameMaxlength: 20,
  showAvatar: true,
});

const emit = defineEmits<{
  'update:gender': [value: 'boy' | 'girl'];
  'update:name': [value: string];
  'update:birthday': [value: string];
  'update:avatar': [value: string | undefined];
}>();

const genderValue = computed({
  get: () => props.gender,
  set: (v: 'boy' | 'girl') => emit('update:gender', v),
});

const avatarValue = computed({
  get: () => props.avatar,
  set: (v: string | undefined) => emit('update:avatar', v),
});

function selectGender(g: 'boy' | 'girl') {
  emit('update:gender', g);
}
</script>

<template>
  <!-- Info card: why fill child info -->
  <div class="child-edit-info-card">
    <img :src="questionIcon" alt="" class="child-edit-info-icon" />
    <div class="child-edit-info-text">
      <p class="child-edit-info-title">{{ i18n('infoCard.title') }}</p>
      <p class="child-edit-info-desc">{{ i18n('infoCard.description') }}</p>
    </div>
  </div>

  <!-- Avatar picker (optional) -->
  <template v-if="showAvatar">
    <p class="child-edit-label">
      {{ i18n('avatar.title') }}
    </p>
    <div class="child-edit-avatar-picker-wrapper">
      <AvatarPicker
        :model-value="avatarValue"
        :gender="gender"
        @update:model-value="emit('update:avatar', $event)"
      />
    </div>
  </template>

  <!-- Gender section -->
  <p class="child-edit-label">
    {{ i18n('questions.gender') }}
  </p>
  <div class="child-edit-gender-row">
    <button type="button" class="child-edit-gender-option" @click="selectGender('boy')">
      <span class="child-edit-avatar">
        <img :src="boyAvatar" alt="boy avatar" />
      </span>
      <span
        class="child-edit-gender-label"
        :class="{ 'child-edit-gender-label--active': genderValue === 'boy' }"
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
        :class="{ 'child-edit-gender-label--active': genderValue === 'girl' }"
      >
        {{ i18n('labels.female') }}
      </span>
    </button>
  </div>

  <!-- Name section -->
  <p class="child-edit-label">
    {{ i18n('questions.name') }}
  </p>
  <input
    class="child-edit-input"
    type="text"
    :value="name"
    :maxlength="nameMaxlength"
    :placeholder="i18n('placeholders.name')"
    @input="emit('update:name', ($event.target as HTMLInputElement).value)"
  />

  <!-- Birthday section -->
  <p class="child-edit-label">
    {{ i18n('questions.birthday') }}
  </p>
  <div class="child-edit-birthday-wrapper">
    <BirthdayPicker
      :model-value="birthday"
      :placeholder="i18n('placeholders.birthday')"
      :default-year="props.defaultYear ?? 2020"
      @update:model-value="emit('update:birthday', $event)"
    />
  </div>
</template>

<style scoped>
/* Spacing between form elements — compact to fit within single viewport */
.child-edit-label + .child-edit-avatar-picker-wrapper {
  margin-top: 8px;
}

.child-edit-avatar-picker-wrapper + .child-edit-label {
  margin-top: 12px;
}

.child-edit-label + .child-edit-gender-row {
  margin-top: 8px;
}

.child-edit-gender-row + .child-edit-label {
  margin-top: 12px;
}

.child-edit-input + .child-edit-label {
  margin-top: 12px;
}

/* Birthday wrapper: same margin-top as .child-edit-input so label-to-input gap is identical */
.child-edit-birthday-wrapper {
  margin-top: 8px;
}
</style>
