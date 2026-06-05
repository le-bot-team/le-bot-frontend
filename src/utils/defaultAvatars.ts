/**
 * Default avatar utilities for parent/guardian users.
 *
 * Loads all parent default avatar slices from src/assets/default-avatars/
 * (naming pattern: img_default_avatar_(man|woman)(1-6).png, @3x preferred).
 *
 * Provides:
 * - allParentAvatars: full list of { gender, index, url }
 * - parentAvatarsByGender: filtered by 'man' | 'woman'
 * - getDefaultAvatar: returns a deterministic default avatar URL
 */

// Use @3x for retina displays; fall back to base if @3x unavailable.
const avatarModules3x = import.meta.glob(
  'src/assets/default-avatars/img_default_avatar_*@3x.png',
  { eager: true, import: 'default' },
);

const avatarModulesBase = import.meta.glob(
  'src/assets/default-avatars/img_default_avatar_*.png',
  { eager: true, import: 'default' },
);

export type ParentGender = 'man' | 'woman';

export interface ParentAvatar {
  gender: ParentGender;
  index: number;
  url: string;
}

function parseAvatars(
  modules: Record<string, unknown>,
): ParentAvatar[] {
  return Object.entries(modules)
    .map(([path, url]) => {
      const match = /img_default_avatar_(man|woman)(\d+)/.exec(path);
      if (!match) return null;
      return {
        gender: match[1] as ParentGender,
        index: Number(match[2]),
        url: url as string,
      };
    })
    .filter((a): a is ParentAvatar => a !== null);
}

/** All parent default avatars (prefers @3x, deduped by gender+index). */
export const allParentAvatars: ParentAvatar[] = (() => {
  const hires = parseAvatars(avatarModules3x);
  const base = parseAvatars(avatarModulesBase);

  // Build a map keyed by "gender+index", prefer @3x
  const map = new Map<string, ParentAvatar>();
  for (const a of base) map.set(`${a.gender}${a.index}`, a);
  for (const a of hires) map.set(`${a.gender}${a.index}`, a); // overwrite with @3x

  // Sort: man1-6, woman1-6
  return Array.from(map.values()).sort((a, b) => {
    if (a.gender !== b.gender) return a.gender === 'man' ? -1 : 1;
    return a.index - b.index;
  });
})();

/** Get parent avatars filtered by gender. */
export function parentAvatarsByGender(gender: ParentGender): ParentAvatar[] {
  return allParentAvatars.filter((a) => a.gender === gender);
}

/**
 * Returns a deterministic default avatar.
 * Uses the first "man" avatar as the universal fallback.
 */
export function getDefaultAvatarUrl(): string {
  return allParentAvatars[0]?.url ?? '';
}
