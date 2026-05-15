/**
 * 隐私过滤与匿名化工具
 *
 * 职责：
 * 1. 对用户标识进行 SHA-256 哈希匿名化
 * 2. 过滤事件 data 字段中的 PII（个人可识别信息）
 * 3. 维护允许上传的 data key 白名单
 */

import type { DataKeyWhitelist } from 'src/types/api/telemetry';

// ---------------------------------------------------------------------------
// 白名单：允许在事件 data 字段中上传的 key
// ---------------------------------------------------------------------------

/**
 * 默认数据白名单。
 * 只有在此白名单中的 key 才会被保留在事件的 data 字段中上传。
 * 不在白名单中的 key 会被静默丢弃。
 */
const DEFAULT_DATA_WHITELIST: string[] = [
  // 页面/路由相关
  'routeName',
  'routePath',
  'routeQuery',
  'routeParams',
  // 设备相关
  'deviceType',
  'deviceModel',
  'deviceId',
  // 聊天相关（不含内容）
  'chatState',
  'audioDuration',
  'cancelType',
  // 转化节点
  'conversionNode',
  // 通用 UI
  'elementId',
  'elementClass',
  'elementTag',
  'tabIndex',
  'settingKey',
  'settingValue',
  // 添加设备流程
  'step',
  'voiceStyle',
  'personalityEnabled',
  // 家庭组
  'memberCount',
  'memberRole',
  'isCreator',
  // 其他
  'errorType',
  'errorCode',
  'networkType',
  'orientation',
];

/** 全局白名单实例 */
let _whitelist: DataKeyWhitelist = new Set(DEFAULT_DATA_WHITELIST);

// ---------------------------------------------------------------------------
// 白名单管理
// ---------------------------------------------------------------------------

/** 获取当前数据白名单 */
export function getWhitelist(): DataKeyWhitelist {
  return _whitelist;
}

/** 添加额外白名单 key（用于业务层扩展） */
export function addWhitelistKeys(keys: string[]): void {
  for (const key of keys) {
    _whitelist = new Set([..._whitelist, key]);
  }
}

// ---------------------------------------------------------------------------
// PII 过滤
// ---------------------------------------------------------------------------

/** 已知的 PII key 模式（即使出现在白名单中也会被阻止） */
const PII_PATTERNS = [
  /email/i,
  /phone/i,
  /password/i,
  /token/i,
  /secret/i,
  /name$/i,        // 匹配 childName, firstName 等
  /address/i,
  /birthday/i,
  /birth_date/i,
  /avatar/i,       // 头像 base64 过大且含 PII
  /bio/i,
  /nickname/i,
  /identifier/i,   // 设备序列号也属于 PII
];

/** 检查 key 是否为 PII */
function isPIIKey(key: string): boolean {
  return PII_PATTERNS.some((pattern) => pattern.test(key));
}

/**
 * 过滤事件 data 字段：
 * 1. 只保留白名单中的 key
 * 2. 即使在白名单中，也排除匹配 PII 模式的 key
 * 3. 递归过滤嵌套对象（只过滤一层）
 */
export function filterEventData(
  data: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!data || Object.keys(data).length === 0) return undefined;

  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    // 先检查 PII，再检查白名单
    if (isPIIKey(key)) continue;
    if (!_whitelist.has(key)) continue;

    // 嵌套对象只保留一层
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const nested = filterEventData(value as Record<string, unknown>);
      if (nested && Object.keys(nested).length > 0) {
        filtered[key] = nested;
      }
    } else {
      filtered[key] = value;
    }
  }

  return Object.keys(filtered).length > 0 ? filtered : undefined;
}

// ---------------------------------------------------------------------------
// 用户标识哈希
// ---------------------------------------------------------------------------

/** 哈希缓存，避免重复计算 */
const _hashCache = new Map<string, string>();

/**
 * 对用户标识进行 SHA-256 哈希匿名化。
 *
 * @param rawId 原始标识（accessToken 或设备指纹）
 * @param salt 盐值（使用固定盐增加哈希不可逆性）
 * @returns SHA-256 哈希的十六进制字符串（前 16 位，足够唯一且缩短传输量）
 */
export async function hashUserId(
  rawId: string,
  salt = 'lebot-telemetry-2026',
): Promise<string> {
  const cacheKey = `${salt}:${rawId}`;
  if (_hashCache.has(cacheKey)) return _hashCache.get(cacheKey)!;

  const input = `${salt}:${rawId}`;
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  const hashArray = Array.from(new Uint8Array(buffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  // 取前 16 位 (64 bit) 作为用户标识，足够去重且缩短传输
  const result = hashHex.slice(0, 16);
  _hashCache.set(cacheKey, result);
  return result;
}
