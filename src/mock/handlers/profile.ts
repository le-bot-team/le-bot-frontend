import type MockAdapter from 'axios-mock-adapter';

import { MOCK_PROFILE, MOCK_PROFILE_AVATAR_DATA } from 'src/mock/data/profile';
import { mockSuccess } from 'src/mock/utils';

import type { UpdateProfileInfoRequest } from 'src/types/api/profile';

/** Mutable copy of the profile that mock endpoints operate on */
const profile = { ...MOCK_PROFILE };
const profileAvatar = { ...MOCK_PROFILE_AVATAR_DATA };

/**
 * Register mock handlers for the profile module:
 *   GET /profiles/avatar
 *   GET /profiles/info
 *   PUT /profiles/info
 */
export function setupProfileMock(mock: MockAdapter): void {
  // Retrieve avatar
  mock.onGet('/profiles/avatar').reply(() => {
    return [200, mockSuccess({ ...profileAvatar })];
  });

  // Retrieve profile info
  mock.onGet('/profiles/info').reply(() => {
    return [200, mockSuccess({ ...profile })];
  });

  // Update profile info
  mock.onPut('/profiles/info').reply((config) => {
    const data = JSON.parse(config.data ?? '{}') as UpdateProfileInfoRequest;

    if (data.nickname !== undefined) profile.nickname = data.nickname;
    if (data.bio !== undefined) profile.bio = data.bio;
    if (data.region !== undefined) profile.region = data.region;
    if (data.avatar !== undefined) {
      profile.avatar = data.avatar;
      profileAvatar.avatar = data.avatar;
    }
    if (data.birthday !== undefined) profile.birthday = data.birthday;
    if (data.relationship !== undefined) profile.relationship = data.relationship;

    profile.updated_at = new Date();
    console.log('[Mock Profile] Profile updated:', {
      nickname: profile.nickname,
      birthday: profile.birthday,
      relationship: profile.relationship,
    });
    return [200, mockSuccess(undefined)];
  });
}
