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

/** 全局白名单实例 (internal mutable, exposed as ReadonlySet) */
const _whitelistInternal: Set<string> = new Set(DEFAULT_DATA_WHITELIST);
let _whitelist: DataKeyWhitelist = _whitelistInternal;

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
    _whitelistInternal.add(key);
  }
  _whitelist = _whitelistInternal;
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
  /^(first|last|middle|child|user|full|display|real|given|family)[-_]?name$/i,  // 匹配 childName, firstName 等
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

/** Keys that are allowed to pass through as objects without recursive filtering (with size limit) */
const PASSTHROUGH_OBJECT_KEYS = new Set(['routeQuery', 'routeParams']);

/** Maximum JSON size for passthrough object values (bytes) */
const PASSTHROUGH_MAX_SIZE = 1024;

/**
 * 过滤事件 data 字段：
 * 1. 只保留白名单中的 key
 * 2. 即使在白名单中，也排除匹配 PII 模式的 key
 * 3. 对象类型的值：若 key 在 PASSTHROUGH_OBJECT_KEYS 中则直接保留（受大小限制），否则丢弃
 */
export function filterEventData(
  data: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!data || Object.keys(data).length === 0) return undefined;

  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    // Check PII first, then whitelist
    if (isPIIKey(key)) continue;
    if (!_whitelist.has(key)) continue;

    // Handle object values
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      if (PASSTHROUGH_OBJECT_KEYS.has(key)) {
        // Allow passthrough with size limit
        try {
          const serialized = JSON.stringify(value);
          if (serialized.length <= PASSTHROUGH_MAX_SIZE) {
            filtered[key] = value;
          }
        } catch {
          // Skip non-serializable values
        }
      }
      // Non-passthrough objects are dropped (inner keys unlikely to be whitelisted)
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

  let result: string;
  try {
    if (!crypto?.subtle?.digest) {
      throw new Error('crypto.subtle not available');
    }
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    const hashArray = Array.from(new Uint8Array(buffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    // Take first 16 hex chars (64 bit) as user identifier
    result = hashHex.slice(0, 16);
  } catch {
    // Fallback: simple non-cryptographic hash for non-secure contexts
    result = simpleHash(input);
  }

  _hashCache.set(cacheKey, result);
  return result;
}

/** Simple non-cryptographic hash fallback (FNV-1a inspired, 64-bit as hex) */
function simpleHash(str: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch;
    h2 = Math.imul(h2, 0x811c9dc5);
  }
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}
