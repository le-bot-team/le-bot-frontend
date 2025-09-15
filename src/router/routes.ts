import type { RouteRecordRaw } from 'vue-router';
import { useQuasar } from 'quasar';

const { platform } = useQuasar();

const routes: RouteRecordRaw[] = [
  {
    path: '',
    redirect: 'home',
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'home',
        path: 'home',
        components: {
          default: () => import('pages/HomePage.vue'),
          leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
          header: platform.is.mobile ? undefined : () => import('layouts/headers/MainHeader.vue'),
        },
      },
      {
        name: 'auth',
        path: 'auth',
        components: {
          default: () => import('pages/AuthPage.vue'),
          leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
          header: () => import('layouts/headers/MainHeader.vue'),
        },
      },
      {
        name: 'me',
        path: 'me',
        components: {
          default: () => import('pages/MePage.vue'),
          leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
          header: () => import('layouts/headers/MainHeader.vue'),
        },
      },
    ],
  },

  // Always leave this as the last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
