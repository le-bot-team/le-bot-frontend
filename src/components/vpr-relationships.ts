import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('components.vprRelationships');

/** All supported relationship keys */
export type VprRelationship = 'self' | 'family' | 'friend' | 'colleague' | 'other';

/** Get localized display text for a relationship key. Evaluated lazily on each call. */
export const getRelationshipLabel = (key: VprRelationship): string => i18n(key);

/** Options list for relationship selectors. Evaluated fresh on each call. */
export const getRelationshipOptions = (): { label: string; value: VprRelationship }[] => {
  const keys: VprRelationship[] = ['self', 'family', 'friend', 'colleague', 'other'];
  return keys.map((k) => ({ label: i18n(k), value: k }));
};
