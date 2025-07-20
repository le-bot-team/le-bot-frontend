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
        components: {
          default: () => import('pages/HomePage.vue'),
          leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
          header: () => import('layouts/headers/MainHeader.vue'),
        },
      },
      {
        name: 'signInAndSignUp',
        path: 'sign-in-and-sign-up',
        components: {
          default: () => import('pages/SignInAndSignUpPage.vue'),
          leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
          header: () => import('layouts/headers/MainHeader.vue'),
        },
      }
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
