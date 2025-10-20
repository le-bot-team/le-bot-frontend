import { Platform } from 'quasar';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '',
    redirect: '/main/home',
  },
  {
    path: '/main',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'home',
        components: Platform.is.mobile
          ? {
              default: () => import('pages/main/HomePage.vue'),
              footer: () => import('layouts/footers/MainFooter.vue'),
            }
          : {
              default: () => import('pages/main/HomePage.vue'),
              leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
              header: () => import('layouts/headers/MainHeader.vue'),
            },
      },
      {
        path: 'me',
        components: Platform.is.mobile
          ? {
              default: () => import('pages/main/MePage.vue'),
              footer: () => import('layouts/footers/MainFooter.vue'),
            }
          : {
              default: () => import('pages/main/MePage.vue'),
              leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
              header: () => import('layouts/headers/MainHeader.vue'),
            },
      },
    ],
  },
  {
    path: '/stack',
    component: () => import('layouts/StackLayout.vue'),
    children: [
      {
        name: 'about',
        path: 'about',
        components: {
          default: () => import('pages/stack/AboutPage.vue'),
          header: () => import('layouts/headers/StackHeader.vue'),
        },
      },
      {
        name: 'auth',
        path: 'auth',
        components: {
          default: () => import('pages/stack/AuthPage.vue'),
          header: () => import('layouts/headers/StackHeader.vue'),
        },
      },
      {
        name: 'chat',
        path: 'chat',
        components: {
          default: () => import('pages/stack/ChatPage.vue'),
          header: () => import('layouts/headers/StackHeader.vue'),
        },
      },
      {
        name: 'profile',
        path: 'profile',
        components: {
          default: () => import('pages/stack/ProfilePage.vue'),
          header: () => import('layouts/headers/StackHeader.vue'),
        },
      },
      {
        name: 'settings',
        path: 'settings',
        components: {
          default: () => import('pages/stack/SettingsPage.vue'),
          header: () => import('layouts/headers/StackHeader.vue'),
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
