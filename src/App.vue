<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

import { validateAccessToken } from 'src/utils/api/auth';
import { retrieveProfileInfo } from 'src/utils/api/profile';
import { useAuthStore } from 'stores/auth';
import { useProfileStore } from 'stores/profile';
import { useSettingsStore } from 'stores/settings';

const { accessToken } = storeToRefs(useAuthStore());
const { tryResetSendCodeCooldown } = useAuthStore();
const { updateProfile } = useProfileStore();
const { applyTheme } = useSettingsStore();

onMounted(async () => {
  tryResetSendCodeCooldown();
  applyTheme();
  if (accessToken.value) {
    try {
      if ((await validateAccessToken(accessToken.value)).data.success) {
        const { data } = await retrieveProfileInfo(accessToken.value);
        if (data?.success) {
          updateProfile(data.data);
        } else {
          console.error(data.message);
          updateProfile();
        }
      } else {
        accessToken.value = '';
        updateProfile();
      }
    } catch (error) {
      console.error('Failed to validate access token', error);
      accessToken.value = '';
      updateProfile();
    }
  } else {
    updateProfile();
  }
});
</script>
<template>
  <router-view />
</template>
