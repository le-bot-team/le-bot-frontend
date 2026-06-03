import type MockAdapter from 'axios-mock-adapter';

import { MOCK_PROFILE, MOCK_PROFILE_AVATAR_DATA } from 'src/mock/data/profile';
import { MOCK_VERIFICATION_CODE, MOCK_CODE_COOLDOWN_MS } from 'src/mock/data/auth';
import { mockError, mockSuccess } from 'src/mock/utils';

import type { ChangePasswordRequest, UpdateProfileInfoRequest } from 'src/types/api/profile';

/** Mutable copy of the profile that mock endpoints operate on */
const profile = { ...MOCK_PROFILE };
const profileAvatar = { ...MOCK_PROFILE_AVATAR_DATA };

/** Mock stored password. Matches the default password used during mock sign-in. */
let mockPassword = 'password123';

/** Timestamp of last phone verification code sent, per phone number */
const phoneCodeSentAt: Record<string, number> = {};

/**
 * Register mock handlers for the profile module:
 *   GET  /profiles/avatar
 *   GET  /profiles/info
 *   PUT  /profiles/info
 *   POST /profiles/password
 *   POST /profiles/deactivate
 *   POST /profiles/phone/challenge
 *   POST /profiles/phone/verify
 *   POST /profiles/phone
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

    profile.updated_at = new Date().toISOString();
    console.log('[Mock Profile] Profile updated:', {
      nickname: profile.nickname,
      birthday: profile.birthday,
      relationship: profile.relationship,
    });
    return [200, { success: true as const }];
  });

  // Change password
  mock.onPost('/profiles/password').reply((config) => {
    const data = JSON.parse(config.data ?? '{}') as ChangePasswordRequest;
    // Allow empty oldPassword for new users setting their initial password
    if (data.oldPassword && data.oldPassword !== mockPassword) {
      return [
        200,
        { success: false as const, message: 'Old password is incorrect', code: 'wrongOldPassword' },
      ];
    }
    if (!data.newPassword || data.newPassword.length < 8) {
      return [
        200,
        {
          success: false as const,
          message: 'Password must be at least 8 characters',
          code: 'invalidPassword',
        },
      ];
    }
    mockPassword = data.newPassword;
    profile.updated_at = new Date().toISOString();
    console.log('[Mock Profile] Password changed');
    return [200, { success: true as const }];
  });

  // Deactivate account
  mock.onPost('/profiles/deactivate').reply(() => {
    console.log('[Mock Profile] Account deactivated');
    return [200, { success: true as const }];
  });

  // Send phone verification code
  mock.onPost('/profiles/phone/challenge').reply((config) => {
    const { phone } = JSON.parse(config.data ?? '{}') as { phone: string };

    if (!phone) {
      return [200, mockError('Phone number is required')];
    }

    const now = Date.now();
    const lastSent = phoneCodeSentAt[phone] ?? 0;
    if (now - lastSent < MOCK_CODE_COOLDOWN_MS) {
      return [200, mockError('Too many requests, please try again later')];
    }
    phoneCodeSentAt[phone] = now;

    console.log(
      `[Mock Profile] Verification code sent to ${phone} (use ${MOCK_VERIFICATION_CODE})`,
    );
    return [200, { success: true as const }];
  });

  // Verify phone code
  mock.onPost('/profiles/phone/verify').reply((config) => {
    const { phone, code } = JSON.parse(config.data ?? '{}') as { phone: string; code: string };

    if (!phone || !code) {
      return [200, mockError('Phone number and code are required')];
    }

    if (code !== MOCK_VERIFICATION_CODE) {
      return [200, mockError('Invalid verification code')];
    }

    console.log(`[Mock Profile] Phone code verified for ${phone}`);
    return [200, { success: true as const }];
  });

  // Change phone number
  mock.onPost('/profiles/phone').reply((config) => {
    const { phone, code } = JSON.parse(config.data ?? '{}') as { phone: string; code: string };

    if (!phone || !code) {
      return [200, mockError('Phone number and code are required')];
    }

    if (code !== MOCK_VERIFICATION_CODE) {
      return [200, mockError('Invalid verification code')];
    }

    profile.phone = phone;
    profile.updated_at = new Date().toISOString();
    console.log(`[Mock Profile] Phone changed to ${phone}`);
    return [200, { success: true as const }];
  });
}
