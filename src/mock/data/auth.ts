/** Mock verification code used across all mock phone/email verification flows. */
export const MOCK_VERIFICATION_CODE = '123456';

/** Cooldown in milliseconds between verification code sends. */
export const MOCK_CODE_COOLDOWN_MS = 60_000;

/** Mock password for password-based login. */
export const MOCK_PASSWORD = 'password123';

/** Mock email that triggers the new-user registration flow. */
export const MOCK_NEW_USER_EMAIL = 'new@lebot.ai';

/** Mock email that simulates a challenge send failure (server error). */
export const MOCK_FAIL_EMAIL = 'fail@lebot.ai';

/** Mock email that simulates a permanently blocked/banned address. */
export const MOCK_BLOCKED_EMAIL = 'blocked@lebot.ai';

/** Mock auth response for existing users. */
export const MOCK_AUTH_DATA = {
  accessToken: 'mock-access-token-existing',
  isNew: false,
};

/** Mock auth response for new users (triggers registration flow). */
export const MOCK_AUTH_DATA_NEW_USER = {
  accessToken: 'mock-access-token-new',
  isNew: true,
};
