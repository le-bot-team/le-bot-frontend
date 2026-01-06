<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

import { validateAccessToken } from 'src/utils/api/auth';
import { retrieveMine } from 'src/utils/api/device';
import { retrieveProfileAvatar, retrieveProfileInfo } from 'src/utils/api/profile';
import { useAuthStore } from 'stores/auth';
import { useDeviceStore } from 'stores/device';
import { useProfileStore } from 'stores/profile';
import { useSettingsStore } from 'stores/settings';

const { accessToken } = storeToRefs(useAuthStore());
const { tryResetSendCodeCooldown } = useAuthStore();
const { updateDevices } = useDeviceStore();
const { profile } = storeToRefs(useProfileStore());
const { updateProfile } = useProfileStore();
const { applyTheme } = useSettingsStore();

const clearLoginState = (reload = true) => {
  accessToken.value = '';
  updateDevices();
  updateProfile();
  if (reload) {
    location.reload();
  }
};

const updateLocalDevices = async (accessToken: string) => {
  const { data: retrieveResult } = await retrieveMine(accessToken);
  if (retrieveResult?.success) {
    updateDevices(retrieveResult.data.devices);
  } else {
    console.error(retrieveResult.message);
    updateDevices();
  }
};

const updateLocalProfile = async (accessToken: string) => {
  const { data: retrieveResult } = await retrieveProfileInfo(accessToken);
  if (retrieveResult?.success) {
    if (
      profile.value?.avatarHash != retrieveResult.data.avatarHash ||
      !profile.value?.avatar?.length
    ) {
      const { data: avatarData } = await retrieveProfileAvatar(accessToken);
      if (avatarData?.success) {
        retrieveResult.data.avatar = avatarData.data.avatar;
      }
    }
    updateProfile(retrieveResult.data);
  } else {
    console.error(retrieveResult.message);
    updateProfile();
  }
};

onMounted(async () => {
  tryResetSendCodeCooldown();
  applyTheme();
  if (accessToken.value) {
    try {
      const { data: validateResult } = await validateAccessToken(accessToken.value);
      if (validateResult.success) {
        await Promise.all([
          updateLocalDevices(accessToken.value),
          updateLocalProfile(accessToken.value),
        ]);
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
