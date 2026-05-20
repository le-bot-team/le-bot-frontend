/**
 * 设备指纹生成
 *
 * 基于浏览器特征组合生成一个相对稳定的设备标识，
 * 用于未登录用户的追踪和匿名化统计。
 *
 * 注意：设备指纹不是 100% 稳定的（浏览器更新、设置变更可能导致变化），
 * 但对于遥测场景足够用。
 */

// ---------------------------------------------------------------------------
// 指纹缓存
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'lebot_device_fp';
const FP_VERSION = 1; // 指纹算法版本，变更时会使旧指纹失效

// ---------------------------------------------------------------------------
// 特征采集
// ---------------------------------------------------------------------------

/** 采集浏览器特征字符串 */
function collectBrowserSignals(): string {
  const signals: string[] = [];

  // 基础浏览器信息
  signals.push(navigator.userAgent);
  signals.push(navigator.language);
  signals.push(String(navigator.hardwareConcurrency || 0));
  signals.push(String(navigator.maxTouchPoints || 0));

  // 屏幕信息
  signals.push(String(screen.width));
  signals.push(String(screen.height));
  signals.push(String(screen.colorDepth));
  signals.push(String(window.devicePixelRatio || 1));

  // 时区
  try {
    signals.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    signals.push(String(new Date().getTimezoneOffset()));
  }

  // 平台
  if (navigator.platform) {
    signals.push(navigator.platform);
  }

  // Canvas 指纹（轻量级，不画复杂图形）
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('LeBot-FP-v1', 2, 2);
      signals.push(canvas.toDataURL().slice(-50)); // 只取尾部，减少长度
    }
  } catch {
    // Canvas 不可用时忽略
  }

  return signals.join('|');
}

// ---------------------------------------------------------------------------
// 哈希
// ---------------------------------------------------------------------------

/** 简单哈希函数（djb2），用于生成设备指纹（不需要密码学安全） */
function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return (hash >>> 0).toString(36);
}

// ---------------------------------------------------------------------------
// 公开 API
// ---------------------------------------------------------------------------

/**
 * 获取或生成设备指纹。
 *
 * 优先从 localStorage 读取缓存指纹（保持稳定性），
 * 缓存不存在时重新生成并持久化。
 *
 * @returns 设备指纹字符串
 */
export function getDeviceFingerprint(): string {
  // 尝试从 localStorage 读取
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // 检查版本兼容
      if (parsed.version === FP_VERSION && typeof parsed.fp === 'string') {
        return parsed.fp;
      }
    }
  } catch {
    // 读取失败，重新生成
  }

  // 生成新指纹
  const signals = collectBrowserSignals();
  const fp = `fp-${FP_VERSION}-${djb2Hash(signals)}`;

  // 持久化
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: FP_VERSION, fp }));
  } catch {
    // localStorage 不可用时忽略（如隐私模式）
  }

  return fp;
}

/**
 * 重置设备指纹（用于调试或用户要求重置标识时）。
 */
export function resetDeviceFingerprint(): string {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return getDeviceFingerprint();
}
