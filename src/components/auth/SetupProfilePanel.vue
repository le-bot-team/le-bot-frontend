<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { retrieveProfileInfo, updateProfileInfo } from 'src/utils/api/profile';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';
import { useProfileStore } from 'stores/profile';
import { useQuasar } from 'quasar';

defineProps<{
  name: string | number;
}>();
const emit = defineEmits<{
  finish: [];
  previous: [];
}>();

const i18n = i18nSubPath('components.auth.SetupProfilePanel');

const { notify } = useQuasar();
const { accessToken } = storeToRefs(useAuthStore());
const { updateProfile } = useProfileStore();

const avatar = ref<string>();
const bio = ref<string>();
const nickname = ref<string>();
const region = ref<string>();

const editAvatar = () => {
  console.log('edit avatar');
  emit('finish');
};
const confirm = async () => {
  if (!accessToken.value) {
    return;
  }
  {
    const { data } = await updateProfileInfo(accessToken.value, {
      avatar: avatar.value,
      bio: bio.value,
      nickname: nickname.value,
      region: region.value,
    });
    if (!data.success) {
      notify({
        type: 'negative',
        message: data.message || i18n('notifications.unknownError'),
      });
      return;
    }
  }
  const { data } = await retrieveProfileInfo(accessToken.value);
  if (!data.success) {
    notify({
      type: 'negative',
      message: data.message || i18n('notifications.unknownError'),
    });
    return;
  }
  updateProfile(data.data);
  emit('finish');
};
</script>

<template>
  <q-tab-panel class="q-gutter-y-md" :name="name">
    <div class="text-h6 text-center" style="white-space: pre-line">
      {{ i18n('labels.welcome', { username: 'guest' }) }}
    </div>
    <div class="row justify-center">
      <q-avatar
        class="cursor-pointer"
        size="6.75rem"
        style="border-radius: 25%; border: 1px solid #c2c2c2"
        text-color="white"
        @click="editAvatar"
      >
        <q-img v-if="avatar" :src="avatar" />
        <div v-else class="text-color-grey text-font-inter" style="font-size: 1rem">
          {{ i18n('labels.upload') }}
        </div>
      </q-avatar>
    </div>
    <q-input
      class="fullwidth"
      clearable
      counter
      :label="i18n('labels.nickname')"
      name="nickname"
      outlined
      :model-value="nickname"
    />
    <q-input
      class="fullwidth"
      clearable
      counter
      :label="i18n('labels.bio')"
      name="bio"
      outlined
      type="textarea"
      :model-value="bio"
    />
    <q-btn
      class="q-mt-lg full-width"
      color="primary"
      :label="i18n('labels.confirmNewPassword')"
      no-caps
      size="lg"
      @click="confirm"
    />
  </q-tab-panel>
</template>

<style scoped></style>
