import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'stores/auth';
import { useProfileStore } from 'stores/profile';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

const createHistory = process.env.SERVER
  ? createMemoryHistory
  : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

export const router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,

  // Leave this as is and make changes in quasar.conf.js instead!
  // quasar.conf.js -> build -> vueRouterMode
  // quasar.conf.js -> build -> publicPath
  history: createHistory(process.env.VUE_ROUTER_BASE),
});

// Route guard: protect main app routes from users with incomplete onboarding
const PUBLIC_ROUTES = new Set(['auth', 'splash', 'onboarding', 'onboarding-guide']);

// Track whether the initial profile sync has completed
let profileSynced = false;

router.beforeEach(async (to) => {
  // Allow public pages without restriction
  if (typeof to.name === 'string' && PUBLIC_ROUTES.has(to.name)) return true;

  const authStore = useAuthStore();
  const profileStore = useProfileStore();

  // No token: redirect to auth
  if (!authStore.accessToken) {
    return { name: 'auth' };
  }

  // On first navigation with a token, wait for profile to be fetched from API
  // (App.vue onMounted does this, but we need to ensure it completes before
  // the guard makes its decision)
  if (!profileSynced && !profileStore.profile?.nickname) {
    try {
      const { retrieveProfileInfo } = await import('src/utils/api/profile');
      const { data } = await retrieveProfileInfo(authStore.accessToken);
      if (data?.success) {
        profileStore.updateProfile(data.data);
      }
    } catch {
      // If fetch fails, fall through to the nickname check below
    }
    profileSynced = true;
  }

  // Has token but profile incomplete (no nickname): allow onboarding flow
  if (!profileStore.profile?.nickname) {
    const onboardingRoutes = ['onboarding-complete', 'onboarding-guide', 'add-virtual-device'];
    if (typeof to.name === 'string' && onboardingRoutes.includes(to.name)) return true;
    return { name: 'onboarding-complete' };
  }

  return true;
});

export default defineRouter(function (/* { store, ssrContext } */) {
  return router;
});
