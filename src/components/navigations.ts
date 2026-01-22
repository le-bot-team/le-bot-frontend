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
];
