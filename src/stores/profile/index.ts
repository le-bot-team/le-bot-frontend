import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { UserProfile } from 'stores/profile/types';

export const useProfileStore = defineStore(
  'profile',
  () => {
    const profile = ref<UserProfile>();

    const updateProfile = (newProfile?: UserProfile) => {
      profile.value = newProfile;
    };

    return {
      profile,
      updateProfile,
    };
  },
  { persist: true },
);
