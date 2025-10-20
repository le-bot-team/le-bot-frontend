<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

import { validateAccessToken } from 'src/utils/api/auth';
import { retrieveProfileAvatar, retrieveProfileInfo } from 'src/utils/api/profile';
import { useAuthStore } from 'stores/auth';
import { useProfileStore } from 'stores/profile';
import { useSettingsStore } from 'stores/settings';

const { accessToken } = storeToRefs(useAuthStore());
const { tryResetSendCodeCooldown } = useAuthStore();
const { profile } = storeToRefs(useProfileStore());
const { updateProfile } = useProfileStore();
const { applyTheme } = useSettingsStore();

const clearLoginState = (reload = true) => {
  accessToken.value = '';
  updateProfile();
  if (reload) {
    location.reload();
  }
};

onMounted(async () => {
  tryResetSendCodeCooldown();
  applyTheme();
  if (accessToken.value) {
    try {
      const { data: validateResult } = await validateAccessToken(accessToken.value);
      if (validateResult.success) {
        const { data: retrieveResult } = await retrieveProfileInfo(accessToken.value);
        if (retrieveResult?.success) {
          if (profile.value?.avatarHash != retrieveResult.data.avatarHash || !profile.value?.avatar?.length) {
            const { data: avatarData } = await retrieveProfileAvatar(accessToken.value);
            if (avatarData?.success) {
              retrieveResult.data.avatar = avatarData.data.avatar;
            }
          }
          updateProfile(retrieveResult.data);
        } else {
          console.error(retrieveResult.message);
          updateProfile();
        }
      } else {
        console.error(validateResult.message);
        clearLoginState();
      }
    } catch (error) {
      console.error('Failed to validate access token', error);
      clearLoginState();
    }
  } else {
    clearLoginState(false);
  }
});
</script>
<template>
  <router-view />
</template>
