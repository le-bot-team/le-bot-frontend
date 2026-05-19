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
const AUTH_ROUTES = new Set(['auth', 'onboarding-complete']);

router.beforeEach((to) => {
  // Allow auth-related routes without restriction
  if (AUTH_ROUTES.has(to.name as string)) return true;

  const authStore = useAuthStore();
  const profileStore = useProfileStore();

  // No token: redirect to auth
  if (!authStore.accessToken) {
    return { name: 'auth' };
  }

  // Has token but profile incomplete (no nickname): redirect to auth to finish onboarding
  if (!profileStore.profile?.nickname) {
    return { name: 'auth' };
  }

  return true;
});

export default defineRouter(function (/* { store, ssrContext } */) {
  return router;
});
