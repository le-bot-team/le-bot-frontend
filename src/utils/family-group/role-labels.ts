import type { FamilyMemberRole, FamilyUserRole } from 'stores/family-group/types';

/**
 * Create a role label resolver using the provided i18n function.
 * Reusable across pages that need to display role labels.
 *
 * @param i18n - An i18n function scoped to a namespace containing `role.*` keys
 * @returns A function that maps a role value to its localized label
 */
export function createRoleLabel(i18n: (key: string) => string) {
  return (role?: FamilyUserRole | FamilyMemberRole): string => {
    if (!role) return '-';
    const map: Record<string, string> = {
      father: i18n('role.father'),
      mother: i18n('role.mother'),
      grandpa: i18n('role.grandpa'),
      grandma: i18n('role.grandma'),
      paternal_grandmother: i18n('role.paternalGrandmother'),
      maternal_grandfather: i18n('role.maternalGrandfather'),
      maternal_grandma: i18n('role.maternalGrandma'),
      friend: i18n('role.friend'),
      other: i18n('role.other'),
    };
    return map[role] ?? role;
  };
}
