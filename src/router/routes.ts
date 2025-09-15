import { Platform } from 'quasar';
import type { RouteRecordRaw } from 'vue-router';

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
        components: Platform.is.mobile
          ? {
              default: () => import('pages/HomePage.vue'),
              footer: () => import('layouts/footers/MainFooter.vue'),
            }
          : {
              default: () => import('pages/HomePage.vue'),
              leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
              header: () => import('layouts/headers/MainHeader.vue'),
            },
      },
      {
        name: 'auth',
        path: 'auth',
        components: Platform.is.mobile
          ? {
              default: () => import('pages/AuthPage.vue'),
              footer: () => import('layouts/footers/MainFooter.vue'),
            }
          : {
              default: () => import('pages/AuthPage.vue'),
              leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
              header: () => import('layouts/headers/MainHeader.vue'),
            },
      },
      {
        name: 'me',
        path: 'me',
        components: Platform.is.mobile
          ? {
              default: () => import('pages/MePage.vue'),
              footer: () => import('layouts/footers/MainFooter.vue'),
            }
          : {
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
