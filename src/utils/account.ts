import { router } from 'src/router';
import { useAuthStore } from 'stores/auth';
import { useProfileStore } from 'stores/profile';

export const logoutAccount = () => {
  const authStore = useAuthStore();
  const { updateProfile } = useProfileStore();

  authStore.accessToken = '';
  updateProfile();
  router.replace('/').catch(console.error);
  setTimeout(() => location.reload(),100)
};
