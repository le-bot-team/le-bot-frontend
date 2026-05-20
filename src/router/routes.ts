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
        name: 'onboarding-complete',
        path: 'onboarding-complete',
        components: {
          default: () => import('pages/stack/OnboardingCompletePage.vue'),
          header: () => import('layouts/headers/StackHeader.vue'),
        },
      },
      {
        name: 'chat',
        path: 'chat',
        meta: {
          headerActions: [
            { icon: 'chat-mute', event: 'chat:mute', ariaLabel: 'Toggle mute' },
            { icon: 'chat-call', event: 'chat:call', ariaLabel: 'Voice call' },
          ],
        },
        components: {
          default: () => import('pages/stack/ChatPage.vue'),
          header: () => import('layouts/headers/StackHeader.vue'),
        },
      },
      {
        name: 'chat-voice-call',
        path: 'chat/voice-call',
        meta: {
          headerActions: [
            { icon: 'chat-mute', event: 'chat:mute', ariaLabel: 'Toggle mute' },
            { icon: 'chat-text-toggle', event: 'chat:text-toggle', ariaLabel: 'Toggle text mode' },
          ],
        },
        components: {
          default: () => import('pages/stack/chat/VoiceCallPage.vue'),
          header: () => import('layouts/headers/StackHeader.vue'),
        },
      },
      {
        name: 'chat-history',
        path: 'chat/history',
        components: {
          default: () => import('pages/stack/chat/ChatHistoryPage.vue'),
          header: () => import('layouts/headers/StackHeader.vue'),
        },
      },
      {
        name: 'chat-mute-settings',
        path: 'chat/mute-settings',
        components: {
          default: () => import('pages/stack/chat/MuteSettingsPage.vue'),
          header: () => import('layouts/headers/StackHeader.vue'),
        },
      },
      {
        name: 'growth-data',
        path: 'growth-data',
        components: {
          default: () => import('pages/stack/GrowthDataPage.vue'),
          header: () => import('layouts/headers/StackHeader.vue'),
        },
      },
      {
        path: 'profile',
        children: [
          {
            name: 'profile',
            path: '',
            components: {
              default: () => import('pages/stack/ProfilePage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'profile-edit',
            path: 'edit',
            components: {
              default: () => import('pages/stack/profile/ProfileFieldEditPage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'profile-change-password',
            path: 'change-password',
            components: {
              default: () => import('pages/stack/profile/ChangePasswordPage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'profile-change-phone',
            path: 'change-phone',
            components: {
              default: () => import('pages/stack/profile/ChangePhonePage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
        ],
      },
      {
        name: 'devices',
        path: 'devices',
        components: {
          default: () => import('pages/stack/DevicesPage.vue'),
          header: () => import('layouts/headers/StackHeader.vue'),
        },
      },
      {
        name: 'add-virtual-device',
        path: 'add-virtual-device',
        components: {
          default: () => import('pages/stack/AddVirtualDevicePage.vue'),
          header: () => import('layouts/headers/StackHeader.vue'),
        },
      },
      {
        path: 'device-config',
        children: [
          {
            name: 'device-config',
            path: '',
            components: {
              default: () => import('pages/stack/DeviceConfigPage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'device-config-voice',
            path: 'voice',
            components: {
              default: () => import('pages/stack/device-config/VoiceStylePage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'device-config-language',
            path: 'language',
            components: {
              default: () => import('pages/stack/device-config/LanguagePage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'device-config-personality',
            path: 'personality',
            components: {
              default: () => import('pages/stack/device-config/PersonalityPage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'device-config-personality-detail',
            path: 'personality/detail',
            components: {
              default: () => import('pages/stack/device-config/PersonalityDetailPage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'device-config-wifi',
            path: 'wifi',
            components: {
              default: () => import('pages/stack/device-config/WifiPage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'device-config-firmware',
            path: 'update',
            components: {
              default: () => import('pages/stack/device-config/FirmwareUpdatePage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'device-config-about',
            path: 'about',
            components: {
              default: () => import('pages/stack/device-config/AboutDevicePage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
        ],
      },
      {
        path: 'settings',
        children: [
          {
            name: 'settings',
            path: '',
            components: {
              default: () => import('pages/stack/SettingsPage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'settings-terms-of-service',
            path: 'terms-of-service',
            components: {
              default: () => import('pages/stack/settings/LegalPage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'settings-user-agreement',
            path: 'user-agreement',
            components: {
              default: () => import('pages/stack/settings/LegalPage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'settings-privacy-policy',
            path: 'privacy-policy',
            components: {
              default: () => import('pages/stack/settings/LegalPage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            path: 'voiceprint',
            children: [
              {
                name: 'settings-voiceprint',
                path: '',
                components: {
                  default: () => import('pages/stack/settings/VoiceprintPage.vue'),
                  header: () => import('layouts/headers/StackHeader.vue'),
                },
              },
              {
                name: 'settings-voiceprint-detail',
                path: 'detail/:personId',
                components: {
                  default: () => import('pages/stack/settings/voiceprint/DetailPage.vue'),
                  header: () => import('layouts/headers/StackHeader.vue'),
                },
              },
              {
                name: 'settings-voiceprint-new',
                path: 'new',
                components: {
                  default: () => import('pages/stack/settings/voiceprint/NewPage.vue'),
                  header: () => import('layouts/headers/StackHeader.vue'),
                },
              },
              {
                name: 'settings-voiceprint-test',
                path: 'test',
                components: {
                  default: () => import('pages/stack/settings/voiceprint/TestPage.vue'),
                  header: () => import('layouts/headers/StackHeader.vue'),
                },
              },
            ],
          },
        ],
      },
      {
        path: 'family-group',
        children: [
          {
            name: 'family-groups',
            path: '',
            components: {
              default: () => import('pages/stack/FamilyGroupPage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'family-group-detail',
            path: 'detail',
            components: {
              default: () => import('pages/stack/family-group/DetailPage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'family-group-child-edit',
            path: 'child-edit',
            components: {
              default: () => import('pages/stack/family-group/ChildEditPage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'family-group-member',
            path: 'member',
            components: {
              default: () => import('pages/stack/family-group/MemberPage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'family-group-invite',
            path: 'invite',
            components: {
              default: () => import('pages/stack/family-group/InvitePage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'family-group-create',
            path: 'create',
            components: {
              default: () => import('pages/stack/family-group/ChildEditPage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
          {
            name: 'family-group-join',
            path: 'join',
            components: {
              default: () => import('pages/stack/family-group/JoinPage.vue'),
              header: () => import('layouts/headers/StackHeader.vue'),
            },
          },
        ],
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
