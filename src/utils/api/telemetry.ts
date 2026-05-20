/**
 * Telemetry API 客户端
 *
 * 批量上报遥测事件到后端，复用现有 axios 实例。
 */

import { api } from 'boot/axios';

import type {
  TelemetryBatchRequest,
  TelemetryBatchResponse,
} from 'src/types/api/telemetry';

// ---------------------------------------------------------------------------
// API 端点
// ---------------------------------------------------------------------------

const BATCH_ENDPOINT = '/telemetry/batch';

// ---------------------------------------------------------------------------
// 批量上报
// ---------------------------------------------------------------------------

/**
 * 批量上报遥测事件。
 *
 * 注意：此接口不要求 x-access-token 认证，
 * 因为未登录用户也需要上报事件（如注册流程中的行为）。
 * 用户标识通过 userIdHash（SHA-256 哈希）匿名化传递。
 *
 * @param request 批量上报请求体
 * @returns 上报结果
 */
export async function sendTelemetryBatch(
  request: TelemetryBatchRequest,
): Promise<TelemetryBatchResponse> {
  try {
    const response = await api.post<TelemetryBatchResponse>(
      BATCH_ENDPOINT,
      request,
      {
        // 不携带 x-access-token，使用匿名上报
        // 避免因 token 过期导致埋点失败
        headers: {
          'Content-Type': 'application/json',
        },
        // 超时时间较短，避免埋点请求阻塞
        timeout: 5000,
      },
    );
    return response.data;
  } catch (err) {
    // Determine if the error is retryable (network/5xx) or not (4xx)
    const isRetryable = isRetryableError(err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Unknown error',
      retryable: isRetryable,
    };
  }
}

/** Check if an error is retryable (network errors, 5xx) vs non-retryable (4xx) */
function isRetryableError(err: unknown): boolean {
  // axios wraps HTTP errors with a response property
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { status?: number } }).response;
    if (response?.status) {
      // 4xx errors are not retryable (bad payload, auth issues, etc.)
      return response.status >= 500;
    }
  }
  // Network errors (no response) are retryable
  return true;
}
