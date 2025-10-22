import { router } from 'src/router';
import { retrieveProfileAvatar, retrieveProfileInfo } from 'src/utils/api/profile';
import { useAuthStore } from 'stores/auth';
import { useProfileStore } from 'stores/profile';
import type { UserProfile } from 'stores/profile/types';

export const logoutAccount = () => {
  const authStore = useAuthStore();
  const { updateProfile } = useProfileStore();

  authStore.accessToken = '';
  updateProfile();
  router.replace('/').catch(console.error);
  setTimeout(() => location.reload(), 100);
};

export const retrieveProfile = async (): Promise<UserProfile> => {
  const authStore = useAuthStore();
  const profileStore = useProfileStore();

  if (!authStore.accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data: infoResponse } = await retrieveProfileInfo(authStore.accessToken);
  if (!infoResponse.success) {
    throw new Error('Failed to retrieve profile information');
  }
  if (
    profileStore.profile?.avatarHash != infoResponse.data.avatarHash ||
    !profileStore.profile?.avatar?.length
  ) {
    const { data: avatarResponse } = await retrieveProfileAvatar(authStore.accessToken);
    if (!avatarResponse.success) {
      throw new Error('Failed to retrieve profile avatar');
    }
    infoResponse.data.avatar = avatarResponse.data.avatar;
  }
  return infoResponse.data;
};
