<script setup lang="ts">
// SetupProfilePanel — lanhu designs ed71eb82 (完善个人信息) / fb8d01d5 (选择关系弹窗)
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { computed, ref, watch, onUnmounted } from 'vue';

import CropperDialog from 'components/CropperDialog.vue';
import BirthdayPicker from 'components/BirthdayPicker.vue';
import { retrieveProfileInfo, updateProfileInfo } from 'src/utils/api/profile';
import { mapAuthError, mapAuthBusinessError } from 'src/utils/auth-error';
import { getDefaultAvatarUrl } from 'src/utils/defaultAvatars';
import { useAuthStore } from 'stores/auth';
import { useProfileStore } from 'stores/profile';
import { useTracker } from 'src/composables/useTracker';
import { i18nSubPath } from 'src/utils/common';

defineProps<{
  name: string | number;
}>();
const emit = defineEmits<{
  finish: [];
  previous: [];
}>();

const { dialog, notify } = useQuasar();
const { accessToken } = storeToRefs(useAuthStore());
const { updateProfile } = useProfileStore();
const { trackConversion } = useTracker();
const i18n = i18nSubPath('components.auth.SetupProfilePanel');

const avatar = ref<string>(getDefaultAvatarUrl());
const nickname = ref<string>();
const birthday = ref<string>('');
const relationship = ref<string>();

const isSending = ref(false);

// Relationship options: order matches design fb8d01d5 grid (3-col, L-to-R, top-to-bottom).
// Raw JSON text frames at y=621/681/741: 妈妈/爸爸/奶奶 | 爷爷/外婆/外公 | 朋友/其他亲属 (8 items).
const relationOptionKeys = [
  'mother',
  'father',
  'grandma',
  'grandpa',
  'maternalGrandma',
  'maternalGrandpa',
  'friend',
  'otherRelative',
] as const;
const relationOptions = computed(() =>
  relationOptionKeys.map((key) => ({
    key,
    label: i18n(`labels.relations.${key}`),
  })),
);

const showRelationSheet = ref(false);

// Close relationship sheet on Escape key (window-level since overlay may not have focus)
const onEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') showRelationSheet.value = false;
};
watch(showRelationSheet, (open) => {
  if (open) {
    window.addEventListener('keydown', onEscape);
  } else {
    window.removeEventListener('keydown', onEscape);
  }
});
onUnmounted(() => window.removeEventListener('keydown', onEscape));

const editAvatar = () => {
  dialog({
    component: CropperDialog,
    componentProps: {
      src: avatar.value,
      userType: 'parent' as const,
    },
    persistent: true,
  }).onOk((data) => {
    avatar.value = data;
  });
};

const selectRelationship = (val: string) => {
  relationship.value = val;
  showRelationSheet.value = false;
};

const canSubmit = computed(() => !!nickname.value?.trim().length && !isSending.value);

const confirm = async () => {
  if (!accessToken.value || !canSubmit.value) return;
  isSending.value = true;
  try {
    const { data } = await updateProfileInfo(accessToken.value, {
      avatar: avatar.value,
      nickname: nickname.value,
      birthday: birthday.value || undefined,
      relationship: relationship.value,
    });
    if (!data.success) {
      notify({
        type: 'negative',
        message: mapAuthBusinessError(data.message || '', 'authErrors.unknownError'),
      });
      isSending.value = false;
      return;
    }

    const profileRes = await retrieveProfileInfo(accessToken.value);
    if (!profileRes.data.success) {
      notify({
        type: 'negative',
        message: mapAuthBusinessError(profileRes.data.message || '', 'authErrors.unknownError'),
      });
      isSending.value = false;
      return;
    }
    updateProfile(profileRes.data.data);
    trackConversion('profile_setup');
    emit('finish');
  } catch (err) {
    notify({
      type: 'negative',
      message: mapAuthError(err, 'authErrors.unknownError'),
    });
  }
  isSending.value = false;
};
</script>

<template>
  <q-tab-panel :name="name" class="auth-panel q-pa-none">
    <!-- Avatar: 87x87px circular, fill rgba(229,229,239,1), 3px white border -->
    <button
      type="button"
      class="setup-profile-avatar-shell"
      :disabled="isSending"
      @click="editAvatar"
      :aria-label="i18n('labels.uploadAvatar')"
    >
      <div class="setup-profile-avatar-circle">
        <img
          v-if="avatar"
          :src="avatar"
          class="setup-profile-avatar-img"
          :alt="i18n('labels.avatar')"
        />
        <div v-else class="setup-profile-avatar-placeholder">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="10" r="6" stroke="#9398A9" stroke-width="1.5" />
            <path
              d="M4 26C4 20.477 9.373 16 16 16C22.627 16 28 20.477 28 26"
              stroke="#9398A9"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </div>
      </div>
    </button>
    <!-- Nickname -->
    <div class="setup-profile-field-row">
      <label class="setup-profile-field-label">{{ i18n('labels.nickname') }}</label>
      <div class="auth-input-group">
        <input
          class="auth-input"
          v-model="nickname"
          :placeholder="i18n('labels.nicknamePlaceholder')"
          maxlength="20"
          :disabled="isSending"
        />
      </div>
    </div>

    <!-- Birthday -->
    <div class="setup-profile-field-row">
      <label class="setup-profile-field-label">{{ i18n('labels.birthday') }}</label>
      <BirthdayPicker v-model="birthday" :default-year="1995" :disabled="isSending" />
    </div>

    <!-- Relationship -->
    <div class="setup-profile-field-row">
      <label class="setup-profile-field-label">{{ i18n('labels.relationship') }}</label>
      <button
        type="button"
        class="auth-input-group auth-input-group--clickable"
        :disabled="isSending"
        @click="showRelationSheet = true"
        aria-haspopup="dialog"
        :aria-expanded="showRelationSheet"
      >
        <span
          class="setup-profile-field-value"
          :class="{ 'setup-profile-field-value--placeholder': !relationship }"
        >
          {{
            relationship
              ? i18n(`labels.relations.${relationship}`)
              : i18n('labels.selectPlaceholder')
          }}
        </span>
        <span class="setup-profile-field-arrow">
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path
              d="M1 1L6 6L1 11"
              stroke="#9398A9"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </button>
    </div>

    <!-- Primary button -->
    <button
      class="auth-btn-primary setup-profile-btn-primary"
      :disabled="!canSubmit"
      @click="confirm"
    >
      <q-spinner v-if="isSending" size="20px" class="q-mr-sm" />
      {{ isSending ? i18n('labels.processing') : i18n('labels.confirm') }}
    </button>

    <!-- Relationship bottom sheet — teleported to body to avoid multi-root in q-tab-panels -->
    <Teleport to="body">
      <transition name="sheet">
        <div
          v-if="showRelationSheet"
          class="setup-profile-relation-overlay"
          role="dialog"
          aria-modal="true"
          :aria-label="i18n('labels.selectRelationship')"
          @click.self="showRelationSheet = false"
        >
          <div class="setup-profile-relation-sheet">
            <div class="setup-profile-relation-head">
              <span class="setup-profile-relation-title">{{
                i18n('labels.selectRelationship')
              }}</span>
            </div>
            <div class="setup-profile-relation-body">
              <button
                v-for="opt in relationOptions"
                :key="opt.key"
                class="setup-profile-relation-chip"
                :class="{ 'setup-profile-relation-chip--active': relationship === opt.key }"
                @click="selectRelationship(opt.key)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </q-tab-panel>
</template>

<style scoped>
/* All structural styles live in src/css/app.scss under
   "===== SetupProfilePanel patterns, designs ed71eb82 / fb8d01d5 =====".
   Only the Vue <transition name="sheet"> hooks remain scoped, since those
   class names are generated and only apply within this component. */
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
</style>
