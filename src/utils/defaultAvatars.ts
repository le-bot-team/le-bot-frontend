/**
 * Default avatar utilities — supports three categories:
 *   parent (man / woman), child-boy, child-girl.
 *
 * File naming convention (src/assets/default-avatars/):
 *   img_default_avatar_(man|woman|boy|girl)(\d+)[@2x|@3x].png
 *
 * Provides:
 *   - Avatars by category + gender
 *   - Deterministic fallback default avatar per category
 */

// ─── Glob imports (Vite resolves at build time) ────────────────

const avatarModules3x = import.meta.glob('src/assets/default-avatars/img_default_avatar_*@3x.png', {
  eager: true,
  import: 'default',
});

const avatarModulesBase = import.meta.glob('src/assets/default-avatars/img_default_avatar_*.png', {
  eager: true,
  import: 'default',
});

// ─── Types ──────────────────────────────────────────────────────

export type ParentGender = 'man' | 'woman';
export type ChildGender = 'boy' | 'girl';
export type AvatarGender = ParentGender | ChildGender;
export type UserType = 'parent' | 'child';

export interface DefaultAvatar {
  gender: AvatarGender;
  index: number;
  url: string;
}

// ─── Internal parsing ───────────────────────────────────────────

function parseAvatars(modules: Record<string, unknown>): DefaultAvatar[] {
  return Object.entries(modules)
    .map(([path, url]) => {
      const match = /img_default_avatar_(man|woman|boy|girl)(\d+)/.exec(path);
      if (!match) return null;
      return {
        gender: match[1] as AvatarGender,
        index: Number(match[2]),
        url: url as string,
      };
    })
    .filter((a): a is DefaultAvatar => a !== null);
}

/** Deduplicate & prefer @3x over base resolution. */
function buildAvatarList(): DefaultAvatar[] {
  const base = parseAvatars(avatarModulesBase);
  const hires = parseAvatars(avatarModules3x);

  const map = new Map<string, DefaultAvatar>();
  for (const a of base) map.set(`${a.gender}${a.index}`, a);
  for (const a of hires) map.set(`${a.gender}${a.index}`, a); // overwrite with @3x

  return Array.from(map.values()).sort((a, b) => {
    const order: Record<AvatarGender, number> = { man: 0, woman: 1, boy: 2, girl: 3 };
    if (a.gender !== b.gender) return order[a.gender] - order[b.gender];
    return a.index - b.index;
  });
}

const ALL_AVATARS = buildAvatarList();

// ─── Gender fallback mapping ────────────────────────────────────
// When child-specific assets (boy/girl) don't exist, fall back to parent (man/woman).
// This ensures the avatar grid is never empty even before dedicated child slices are added.
const CHILD_FALLBACK: Record<ChildGender, ParentGender> = { boy: 'man', girl: 'woman' };

function withFallbackGender(avatars: DefaultAvatar[], target: ChildGender): DefaultAvatar[] {
  if (avatars.length > 0) return avatars;
  // Remap parent avatars to the requested child gender
  const fallbackGender = CHILD_FALLBACK[target];
  return ALL_AVATARS.filter((a) => a.gender === fallbackGender).map((a) => ({
    ...a,
    gender: target,
  }));
}

// ─── Public API ─────────────────────────────────────────────────

/** Parent avatars (man / woman). */
export const allParentAvatars: DefaultAvatar[] = ALL_AVATARS.filter(
  (a) => a.gender === 'man' || a.gender === 'woman',
);

/** Child avatars (boy / girl), with fallback to parent assets when child files are absent. */
export const allChildAvatars: DefaultAvatar[] = (() => {
  const native = ALL_AVATARS.filter((a) => a.gender === 'boy' || a.gender === 'girl');
  if (native.length > 0) return native;
  // Fallback: combine man→boy + woman→girl
  return [
    ...withFallbackGender([], 'boy'),
    ...withFallbackGender([], 'girl'),
  ];
})();

/** Get avatars for a specific gender. */
export function avatarsByGender(gender: AvatarGender): DefaultAvatar[] {
  const result = ALL_AVATARS.filter((a) => a.gender === gender);
  if (result.length > 0) return result;
  // Child gender fallback to parent assets
  if (gender === 'boy' || gender === 'girl') {
    return withFallbackGender(result, gender);
  }
  return result;
}

/** Get parent avatars filtered by gender (convenience wrapper). */
export function parentAvatarsByGender(gender: ParentGender): DefaultAvatar[] {
  return avatarsByGender(gender);
}

/** Get child avatars filtered by gender (convenience wrapper). Falls back to parent assets. */
export function childAvatarsByGender(gender: ChildGender): DefaultAvatar[] {
  return avatarsByGender(gender);
}

/**
 * Get the gender tabs for a given user type.
 * Returns { key, i18nSuffix }[] where i18nSuffix can be used with i18n('labels.<suffix>').
 */
export function getGenderTabsForUserType(
  userType: UserType,
): { key: AvatarGender; i18nSuffix: string }[] {
  if (userType === 'parent') {
    return [
      { key: 'man', i18nSuffix: 'man' },
      { key: 'woman', i18nSuffix: 'woman' },
    ];
  }
  return [
    { key: 'boy', i18nSuffix: 'boy' },
    { key: 'girl', i18nSuffix: 'girl' },
  ];
}

/**
 * Returns a deterministic default avatar URL.
 * - parent: first man avatar
 * - child:  first boy avatar (falls back to first parent avatar if no child assets)
 */
export function getDefaultAvatarUrl(userType: UserType = 'parent'): string {
  if (userType === 'child') {
    return allChildAvatars[0]?.url ?? allParentAvatars[0]?.url ?? '';
  }
  return allParentAvatars[0]?.url ?? '';
}
