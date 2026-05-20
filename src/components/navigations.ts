import { i18nSubPath } from 'src/utils/common';

interface Navigation {
  label: string;
  icon: string;
  available: boolean;
  route: string;
}

const i18n = i18nSubPath('components.navigations');

export const MAIN_NAVIGATIONS: Navigation[] = [
  {
    label: i18n('main.home'),
    icon: 'home',
    available: true,
    route: 'home',
  },
  {
    label: i18n('main.growth'),
    icon: 'mdi-sprout',
    available: false,
    route: 'growth',
  },
  {
    label: i18n('main.mall'),
    icon: 'mdi-shopping',
    available: false,
    route: 'mall',
  },
  {
    label: i18n('main.me'),
    icon: 'person',
    available: true,
    route: 'me',
  },
];

export const STACK_NAVIGATIONS: Navigation[] = [
  {
    label: i18n('stack.about'),
    icon: 'information',
    available: true,
    route: 'about',
  },
  {
    label: i18n('stack.auth'),
    icon: 'lock',
    available: true,
    route: 'auth',
  },
  {
    label: i18n('stack.chat'),
    icon: 'chat',
    available: true,
    route: 'chat',
  },
  {
    label: i18n('stack.profile'),
    icon: 'account-circle',
    available: true,
    route: 'profile',
  },
  {
    label: i18n('stack.deviceConfig'),
    icon: 'cog',
    available: true,
    route: 'device-config',
  },
  {
    label: i18n('stack.settings'),
    icon: 'cog',
    available: true,
    route: 'settings',
  },
  {
    label: i18n('stack.settingsVoiceprint'),
    icon: 'mdi-account-voice',
    available: true,
    route: 'settings-voiceprint',
  },
  {
    label: i18n('stack.settingsVoiceprintDetail'),
    icon: 'mdi-account-voice',
    available: true,
    route: 'settings-voiceprint-detail',
  },
  {
    label: i18n('stack.settingsVoiceprintNew'),
    icon: 'mdi-microphone-plus',
    available: true,
    route: 'settings-voiceprint-new',
  },
  {
    label: i18n('stack.familyGroups'),
    icon: 'mdi-account-group',
    available: true,
    route: 'family-groups',
  },
  {
    label: i18n('stack.familyGroupDetail'),
    icon: 'mdi-account-group',
    available: true,
    route: 'family-group-detail',
  },
  {
    label: i18n('stack.familyGroupMember'),
    icon: 'mdi-account',
    available: true,
    route: 'family-group-member',
  },
  {
    label: i18n('stack.familyGroupInvite'),
    icon: 'mdi-account-plus',
    available: true,
    route: 'family-group-invite',
  },
  {
    label: i18n('stack.familyGroupChildEdit'),
    icon: 'mdi-baby-face',
    available: true,
    route: 'family-group-child-edit',
  },
  {
    label: i18n('stack.familyGroupCreate'),
    icon: 'mdi-plus-circle',
    available: true,
    route: 'family-group-create',
  },
  {
    label: i18n('stack.addVirtualDevice'),
    icon: 'mdi-plus-circle',
    available: true,
    route: 'add-virtual-device',
  },
  {
    label: i18n('stack.familyGroupJoin'),
    icon: 'mdi-account-plus',
    available: true,
    route: 'family-group-join',
  },
  {
    label: i18n('stack.settingsAddresses'),
    icon: 'mdi-map-marker',
    available: true,
    route: 'settings-addresses',
  },
  {
    label: i18n('stack.settingsAppLanguage'),
    icon: 'mdi-web',
    available: true,
    route: 'settings-language',
  },
  {
    label: i18n('stack.settingsNotifications'),
    icon: 'mdi-bell',
    available: true,
    route: 'settings-notifications',
  },
  {
    label: i18n('stack.settingsGeneral'),
    icon: 'mdi-cog',
    available: true,
    route: 'settings-general',
  },
  {
    label: i18n('stack.settingsPrivacy'),
    icon: 'mdi-shield',
    available: true,
    route: 'settings-privacy',
  },
  {
    label: i18n('stack.settingsPermissions'),
    icon: 'mdi-lock',
    available: true,
    route: 'settings-permissions',
  },
  {
    label: i18n('stack.settingsWordFilter'),
    icon: 'mdi-filter',
    available: true,
    route: 'settings-word-filter',
  },
  {
    label: i18n('stack.settingsClearCache'),
    icon: 'mdi-broom',
    available: true,
    route: 'settings-clear-cache',
  },
  {
    label: i18n('stack.settingsNetwork'),
    icon: 'mdi-wifi',
    available: true,
    route: 'settings-network',
  },
  {
    label: i18n('stack.settingsStorage'),
    icon: 'mdi-database',
    available: true,
    route: 'settings-storage',
  },
  {
    label: i18n('stack.settingsInfoList'),
    icon: 'mdi-information',
    available: true,
    route: 'settings-info-list',
  },
  {
    label: i18n('stack.settingsPrivacyPolicy'),
    icon: 'mdi-file-document',
    available: true,
    route: 'settings-privacy-policy',
  },
  {
    label: i18n('stack.settingsTermsOfService'),
    icon: 'mdi-file-document',
    available: true,
    route: 'settings-terms-of-service',
  },
  {
    label: i18n('stack.settingsUserAgreement'),
    icon: 'mdi-file-document',
    available: true,
    route: 'settings-user-agreement',
  },
];
