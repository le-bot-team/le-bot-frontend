import { i18nSubPath } from 'src/utils/common';

interface Navigation {
  label: string;
  icon: string;
  available: boolean;
  route: string;
}

const i18n = i18nSubPath('components.navigations');

export const NAVIGATIONS: Navigation[] = [
  {
    label: i18n('labels.home'),
    icon: 'home',
    available: true,
    route: 'home',
  },
  {
    label: i18n('labels.growth'),
    icon: 'mdi-sprout',
    available: false,
    route: 'growth',
  },
  {
    label: i18n('labels.mall'),
    icon: 'mdi-shopping',
    available: false,
    route: 'mall',
  },
  {
    label: i18n('labels.me'),
    icon: 'person',
    available: true,
    route: 'me',
  },
];
