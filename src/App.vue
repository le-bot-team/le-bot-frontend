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
      if ((await validateAccessToken(accessToken.value)).data.success) {
        const { data } = await retrieveProfileInfo(accessToken.value);
        if (data?.success) {
          if (
            profile.value?.avatarHash != data.data.avatarHash ||
            !profile.value?.avatar?.length
          ) {
            const { data: avatarData } = await retrieveProfileAvatar(accessToken.value);
            if (avatarData?.success) {
              data.data.avatar = avatarData.data.avatar;
            }
          }
          updateProfile(data.data);
        } else {
          console.error(data.message);
          updateProfile();
        }
      } else {
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
