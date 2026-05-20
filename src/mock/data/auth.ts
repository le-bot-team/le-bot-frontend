/**
 * Preset mock user credentials and tokens for authentication testing.
 */

/** Fixed verification code accepted by the mock email/code endpoint */
export const MOCK_VERIFICATION_CODE = '123456';

/** Fixed password accepted by the mock email/password endpoint */
export const MOCK_PASSWORD = 'password123';

/** A preset access token the mock `validate` endpoint will accept */
export const MOCK_ACCESS_TOKEN = 'mock-access-token-00000000-0000-0000-0000-000000000000';

/** Preset test email for mock authentication flows */
export const MOCK_EMAIL = 'test@lebot.ai';

/**
 * A specific email that triggers the "new user" registration flow:
 * isNew=true, noPassword=true → password setup → profile completion.
 */
export const MOCK_NEW_USER_EMAIL = 'new@lebot.ai';

/** Email cooldown interval in ms — matches SEND_CODE_COOLDOWN_INTERVAL */
export const MOCK_CODE_COOLDOWN_MS = 60_000;

/**
 * Mock user data returned after successful login/registration.
 * Default: existing user with password, goes directly to profile setup.
 */
export const MOCK_AUTH_DATA = {
  accessToken: MOCK_ACCESS_TOKEN,
  isNew: false,
  noPassword: false,
};

/**
 * Mock auth data for new user registration flow.
 * isNew=true, noPassword=true triggers:
 *   password setup (NewPasswordPanel) → profile completion (SetupProfilePanel)
 */
export const MOCK_AUTH_DATA_NEW_USER = {
  accessToken: MOCK_ACCESS_TOKEN,
  isNew: true,
  noPassword: true,
};
