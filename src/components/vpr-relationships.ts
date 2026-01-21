import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('components.vprRelationships');

export const RELATIONSHIP_MAPPINGS = {
  self: i18n('self'),
  family: i18n('family'),
  friend: i18n('friend'),
  colleague: i18n('colleague'),
  other: i18n('other'),
} as const;

export type VprRelationship = keyof typeof RELATIONSHIP_MAPPINGS;

export const RELATIONSHIP_OPTIONS = Object.entries(RELATIONSHIP_MAPPINGS).map(([k, v]) => ({
  label: v,
  value: k as VprRelationship,
}));
