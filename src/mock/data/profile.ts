import type { UserProfile } from 'stores/profile/types';

/**
 * A minimal 1x1 transparent PNG encoded as a data URI for mock avatar.
 */
export const MOCK_AVATAR_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

/**
 * Preset mock user profile returned by /profiles/info.
 */
export const MOCK_PROFILE: UserProfile = {
  id: '1',
  created_at: new Date('2024-06-01T08:00:00.000Z'),
  updated_at: new Date('2024-12-15T10:30:00.000Z'),
  nickname: '乐宝用户',
  bio: '一个热爱AI的可爱用户',
  avatar: MOCK_AVATAR_BASE64,
  avatarHash: 'mock-avatar-hash-00000000',
  region: '中国',
  phone: '18758326895',
  last_active: new Date('2024-12-15T12:00:00.000Z'),
  last_login: new Date('2024-12-15T08:00:00.000Z'),
};

/**
 * Preset mock avatar data returned by /profiles/avatar.
 */
export const MOCK_PROFILE_AVATAR_DATA = {
  id: 1,
  avatar: MOCK_AVATAR_BASE64,
  avatarHash: 'mock-avatar-hash-00000000',
};
