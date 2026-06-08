import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('components.vprRelationships');

/** All supported relationship keys — aligned with SetupProfilePanel (design fb8d01d5).
 *  'self' is a programmatic-only value used when registering the child's own
 *  voiceprint (AddVirtualDevicePage); it is NOT included in getRelationshipOptions(). */
export type VprRelationship =
  | 'mother'
  | 'father'
  | 'grandma'
  | 'grandpa'
  | 'maternalGrandma'
  | 'maternalGrandpa'
  | 'friend'
  | 'otherRelative'
  | 'self';

/** Get localized display text for a relationship key. Evaluated lazily on each call. */
export const getRelationshipLabel = (key: VprRelationship): string => i18n(key);

/** Options list for relationship selectors. Order matches SetupProfilePanel grid. */
export const getRelationshipOptions = (): { label: string; value: VprRelationship }[] => {
  const keys: VprRelationship[] = [
    'mother',
    'father',
    'grandma',
    'grandpa',
    'maternalGrandma',
    'maternalGrandpa',
    'friend',
    'otherRelative',
  ];
  return keys.map((k) => ({ label: i18n(k), value: k }));
};
