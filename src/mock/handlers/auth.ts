import type MockAdapter from 'axios-mock-adapter';

import {
  MOCK_AUTH_DATA,
  MOCK_AUTH_DATA_NEW_USER,
  MOCK_NEW_USER_EMAIL,
  MOCK_FAIL_EMAIL,
  MOCK_BLOCKED_EMAIL,
  MOCK_CODE_COOLDOWN_MS,
  MOCK_VERIFICATION_CODE,
  MOCK_PASSWORD,
} from 'src/mock/data/auth';
import { mockError, mockSuccess } from 'src/mock/utils';

const lastCodeSentAt = new Map<string, number>();

/** Safely parse JSON body, returning empty object on failure. */
function safeParseBody<T = Record<string, unknown>>(data: unknown): Partial<T> {
  try {
    return JSON.parse((data as string) ?? '{}') as Partial<T>;
  } catch {
    return {};
  }
}

/**
 * Resolve which auth data to return based on the email.
 * `new@lebot.ai` triggers the full registration flow (isNew=true).
 */
const resolveAuthData = (email: string) =>
  email === MOCK_NEW_USER_EMAIL ? MOCK_AUTH_DATA_NEW_USER : MOCK_AUTH_DATA;

/**
 * Register mock handlers for the auth module.
 */
export function setupAuthMock(mock: MockAdapter): void {
  // Check if email is registered
  mock.onGet('/auth/email/check').reply((config) => {
    const email = config.params?.email as string | undefined;
    if (!email) {
      return [200, mockError('邮箱不能为空')];
    }
    const isNew = email === MOCK_NEW_USER_EMAIL;
    console.log(`[Mock Auth] Email check: ${email} (isNew=${isNew})`);
    return [200, mockSuccess({ isNew })];
  });

  // Send verification code
  mock.onPost('/auth/email/challenge').reply((config) => {
    const { email } = safeParseBody<{ email: string }>(config.data);

    if (!email) {
      return [200, mockError('邮箱不能为空')];
    }

    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn(`[Mock Auth] Challenge rejected — invalid email format: ${email}`);
      return [200, mockError('邮箱格式不正确')];
    }

    // Simulate server-side send failure for specific test email
    if (email === MOCK_FAIL_EMAIL) {
      console.error(`[Mock Auth] Challenge FAILED (simulated server error) for ${email}`);
      return [500, mockError('邮件发送失败，请稍后重试')];
    }

    // Simulate permanently blocked address
    if (email === MOCK_BLOCKED_EMAIL) {
      console.warn(`[Mock Auth] Challenge rejected — address blocked: ${email}`);
      return [200, mockError('该邮箱已被限制，无法发送验证码')];
    }

    // Cooldown rate-limit check (per-email)
    const now = Date.now();
    const lastSent = lastCodeSentAt.get(email) ?? 0;
    const elapsed = now - lastSent;
    if (elapsed < MOCK_CODE_COOLDOWN_MS) {
      const remainingSec = Math.ceil((MOCK_CODE_COOLDOWN_MS - elapsed) / 1000);
      console.warn(`[Mock Auth] Challenge rate-limited for ${email} (retry in ${remainingSec}s)`);
      return [200, mockError(`发送频率过高，请 ${remainingSec} 秒后再试`)];
    }
    lastCodeSentAt.set(email, now);

    console.log(
      `[Mock Auth] ✓ Verification code sent to ${email}\n` +
        `           code = ${MOCK_VERIFICATION_CODE}  (cooldown ${MOCK_CODE_COOLDOWN_MS / 1000}s)`,
    );
    return [200, mockSuccess(undefined)];
  });

  // Login/Register with verification code
  mock.onPost('/auth/email/code').reply((config) => {
    const { email, code } = safeParseBody<{ email: string; code: string }>(config.data);

    if (!email || !code) {
      return [400, mockError('邮箱和验证码不能为空')];
    }

    if (code !== MOCK_VERIFICATION_CODE) {
      return [400, mockError('验证码错误或已过期')];
    }

    const authData = resolveAuthData(email);
    const flowTag = authData.isNew
      ? 'NEW USER → registration flow'
      : 'existing user → direct login';
    console.log(`[Mock Auth] Code login succeeded for ${email} (${flowTag})`);
    return [200, mockSuccess(authData)];
  });

  // Login with password
  mock.onPost('/auth/email/password').reply((config) => {
    const { email, password } = safeParseBody<{ email: string; password: string }>(config.data);

    if (!email || !password) {
      return [200, mockError('邮箱和密码不能为空')];
    }

    if (password !== MOCK_PASSWORD) {
      return [200, mockError('邮箱或密码错误')];
    }

    const authData = resolveAuthData(email);
    const flowTag = authData.isNew
      ? 'NEW USER → registration flow'
      : 'existing user → direct login';
    console.log(`[Mock Auth] Password login succeeded for ${email} (${flowTag})`);
    return [200, mockSuccess(authData)];
  });

  // Reset password
  mock.onPost('/auth/email/reset').reply((config) => {
    const { email, code, newPassword } = safeParseBody<{
      email: string;
      code: string;
      newPassword: string;
    }>(config.data);

    if (!email || !code || !newPassword) {
      return [400, mockError('参数不完整')];
    }

    if (code !== MOCK_VERIFICATION_CODE) {
      return [400, mockError('验证码错误或已过期')];
    }

    console.log(`[Mock Auth] Password reset succeeded for ${email}`);
    return [200, mockSuccess(undefined)];
  });

  // Validate access token
  mock.onGet('/auth/validate').reply((config) => {
    const token: string | undefined = (config.headers as Record<string, string> | undefined)?.[
      'x-access-token'
    ];

    if (!token || !token.startsWith('mock-')) {
      return [200, { success: false, message: 'Token无效或已过期' }];
    }

    return [200, { success: true, message: 'Token is valid' }];
  });
}
