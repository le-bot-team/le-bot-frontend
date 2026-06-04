/**
 * Auth module error message mapper.
 *
 * Translates technical error messages (HTTP status codes, axios errors,
 * backend English messages) into user-friendly i18n strings.
 */
import { i18nGlobal } from 'boot/i18n';

/**
 * Check whether the given error is an axios HTTP error with a response.
 */
function isAxiosHttpError(err: unknown): err is { response: { status: number; data?: unknown } } {
  return (
    err !== null &&
    typeof err === 'object' &&
    'response' in err &&
    (err as { response?: unknown }).response !== undefined &&
    typeof (err as { response: { status?: unknown } }).response.status === 'number'
  );
}

/**
 * Check whether the error message indicates a network-level failure.
 */
function isNetworkErrorMessage(msg: string): boolean {
  const lower = msg.toLowerCase();
  return (
    lower.includes('network error') ||
    lower.includes('networkerror') ||
    lower.includes('failed to fetch') ||
    lower.includes('net::err')
  );
}

/**
 * Check whether the error message indicates a timeout.
 */
function isTimeoutErrorMessage(msg: string): boolean {
  const lower = msg.toLowerCase();
  return lower.includes('timeout') || lower.includes('aborted');
}

/**
 * Try to map a business-level error message to a friendly i18n string.
 * Returns `null` if no specific mapping exists (caller should use fallback).
 */
function mapBusinessMessage(message: string): string | null {
  const lower = message.toLowerCase();

  // Invalid credentials (email / password)
  if (
    lower.includes('invalid email or password') ||
    lower.includes('invalid credentials') ||
    lower.includes('邮箱或密码') ||
    lower.includes('密码错误') ||
    lower.includes('密码不正确')
  ) {
    return i18nGlobal.t('authErrors.invalidCredentials');
  }

  // Invalid or expired verification code
  if (
    lower.includes('invalid code') ||
    lower.includes('incorrect code') ||
    lower.includes('wrong code') ||
    lower.includes('code expired') ||
    lower.includes('code is invalid') ||
    lower.includes('code has expired') ||
    lower.includes('验证码错误') ||
    lower.includes('验证码过期') ||
    lower.includes('验证码无效') ||
    lower.includes('验证码已过期')
  ) {
    return i18nGlobal.t('authErrors.invalidCode');
  }

  // Token expired / invalid
  if (
    lower.includes('invalid or expired') ||
    lower.includes('token is invalid') ||
    lower.includes('token无效') ||
    lower.includes('token过期')
  ) {
    return i18nGlobal.t('authErrors.tokenExpired');
  }

  // Email blocked
  if (lower.includes('blocked') || lower.includes('限制')) {
    return i18nGlobal.t('authErrors.emailBlocked');
  }

  // Rate limited
  if (
    lower.includes('rate limit') ||
    lower.includes('too many') ||
    lower.includes('频率') ||
    lower.includes('频繁')
  ) {
    return i18nGlobal.t('authErrors.rateLimited');
  }

  // Messages already in Chinese (from mock or backend) — pass through directly
  // if they contain common Chinese error keywords
  if (
    /[\u4e00-\u9fff]/.test(message) &&
    (lower.includes('验证码') ||
      lower.includes('邮箱') ||
      lower.includes('密码') ||
      lower.includes('发送') ||
      lower.includes('参数'))
  ) {
    return message;
  }

  return null;
}

/**
 * Map an unknown error to a user-friendly i18n message string.
 *
 * @param err - The caught error (axios error, Error, string, etc.)
 * @param fallbackKey - i18n key to use when no specific mapping is found.
 *                      Defaults to `'authErrors.unknownError'`.
 *
 * @returns A localized, user-friendly error message string.
 */
export function mapAuthError(err: unknown, fallbackKey = 'authErrors.unknownError'): string {
  const fallback = i18nGlobal.t(fallbackKey);

  // --- 1. Axios HTTP errors (4xx / 5xx) ---
  if (isAxiosHttpError(err)) {
    const status = err.response.status;

    // Robust body message extraction — handles object, stringified JSON, or plain string.
    // Checks multiple common field names: message, msg, error.
    let bodyMessage: string | undefined;
    const rawData = err.response.data;
    if (rawData && typeof rawData === 'object') {
      const obj = rawData as Record<string, unknown>;
      const candidate = obj.message ?? obj.msg ?? obj.error;
      if (typeof candidate === 'string') bodyMessage = candidate;
    } else if (typeof rawData === 'string' && rawData.length > 0) {
      try {
        const parsed = JSON.parse(rawData) as Record<string, unknown>;
        const candidate = parsed?.message ?? parsed?.msg ?? parsed?.error;
        if (typeof candidate === 'string') bodyMessage = candidate;
      } catch {
        bodyMessage = rawData;
      }
    }

    // Try business-level mapping for any extracted message
    if (bodyMessage) {
      const mapped = mapBusinessMessage(bodyMessage);
      if (mapped) return mapped;
      // Chinese messages from backend — pass through directly
      if (/[\u4e00-\u9fff]/.test(bodyMessage)) return bodyMessage;
    }

    if (status === 400) return fallback;
    if (status === 401) {
      // Differentiate: invalid credentials vs token expired
      const bodyMsg = (bodyMessage ?? '').toLowerCase();
      if (
        bodyMsg.includes('invalid email or password') ||
        bodyMsg.includes('invalid credentials') ||
        bodyMsg.includes('密码') ||
        bodyMsg.includes('password')
      ) {
        return i18nGlobal.t('authErrors.invalidCredentials');
      }
      return i18nGlobal.t('authErrors.unauthorized');
    }
    if (status === 403) return i18nGlobal.t('authErrors.forbidden');
    if (status === 404) return i18nGlobal.t('authErrors.notFound');
    if (status === 422) return i18nGlobal.t('authErrors.validationError');
    if (status === 429) return i18nGlobal.t('authErrors.rateLimited');
    if (status >= 500) return i18nGlobal.t('authErrors.serverError');
    return fallback;
  }

  // --- 2. String / Error objects ---
  const rawMessage =
    typeof err === 'string'
      ? err
      : err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
          ? String(err.message)
          : '';

  if (!rawMessage) return fallback;

  // --- 3. Network errors ---
  if (isNetworkErrorMessage(rawMessage)) {
    return i18nGlobal.t('authErrors.networkError');
  }

  // --- 4. Timeout errors ---
  if (isTimeoutErrorMessage(rawMessage)) {
    return i18nGlobal.t('authErrors.timeout');
  }

  // --- 5. Business-level message mapping ---
  const businessMapped = mapBusinessMessage(rawMessage);
  if (businessMapped) return businessMapped;

  // --- 6. Fallback ---
  return fallback;
}

/**
 * Convenience overload for mapping a business-level `{ success: false, message }` response.
 *
 * @param message - The `message` field from the API response body.
 * @param fallbackKey - i18n key to use when no mapping is found.
 */
export function mapAuthBusinessError(
  message: string,
  fallbackKey = 'authErrors.unknownError',
): string {
  const mapped = mapBusinessMessage(message);
  return mapped ?? i18nGlobal.t(fallbackKey);
}
