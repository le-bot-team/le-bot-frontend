/**
 * 采样过滤
 *
 * 按页面类型和事件类型独立可配的采样率控制，
 * 避免海量数据冲击后端。
 */

import type { SamplingConfig, SamplingRateMap, TelemetryEventType } from 'src/types/api/telemetry';

// ---------------------------------------------------------------------------
// 默认采样率配置
// ---------------------------------------------------------------------------

/** 核心页面：100% 全量采集 */
const CORE_PAGES: SamplingRateMap = {
  home: 1.0,
  chat: 1.0,
  'chat-voice-call': 1.0,
  'chat-history': 1.0,
  'chat-mute-settings': 1.0,
  'device-config': 1.0,
  'device-config-voice': 1.0,
  'device-config-language': 1.0,
  'device-config-personality': 1.0,
  'device-config-personality-detail': 1.0,
  devices: 1.0,
  'add-virtual-device': 1.0,
  'family-groups': 1.0,
  'family-group-detail': 1.0,
  'family-group-member': 1.0,
  'family-group-invite': 1.0,
  auth: 1.0,
  profile: 1.0,
  'onboarding-complete': 1.0,
  onboarding: 1.0,
  splash: 1.0,
};

/** 次要页面：30% 采样 */
const SECONDARY_PAGES: SamplingRateMap = {
  settings: 0.3,
  'settings-voiceprint': 0.3,
  'settings-voiceprint-detail': 0.3,
  'settings-voiceprint-new': 0.3,
  'settings-voiceprint-test': 0.3,
  'settings-addresses': 0.3,
  'settings-language': 0.3,
  'settings-notifications': 0.3,
  'settings-general': 0.3,
  'settings-privacy': 0.3,
  'settings-permissions': 0.3,
  'settings-word-filter': 0.3,
  'settings-clear-cache': 0.3,
  'settings-network': 0.3,
  'settings-storage': 0.3,
  'settings-privacy-policy': 0.3,
  'settings-terms-of-service': 0.3,
  'settings-user-agreement': 0.3,
  'settings-info-list': 0.3,
  'growth-data': 0.3,
  'growth-data-weekly-report': 0.3,
  'growth-data-capability': 0.3,
  help: 0.3,
  'help-faq': 0.3,
  'help-feedback': 0.3,
  messages: 0.3,
  'messages-detail': 0.3,
  'messages-activity': 0.3,
  orders: 0.3,
  about: 0.3,
  'profile-edit': 0.3,
  'profile-change-password': 0.3,
  'profile-change-phone': 0.3,
  'device-config-wifi': 0.3,
  'device-config-update': 0.3,
  'device-config-about': 0.3,
  'family-group-child-edit': 0.3,
};

/** 默认采样配置 */
export const DEFAULT_SAMPLING_CONFIG: SamplingConfig = {
  pageRates: { ...CORE_PAGES, ...SECONDARY_PAGES },
  defaultRate: 0.3,
  clickRate: 1.0,     // click 事件默认全量（受页面采样率控制）
  customRate: 1.0,    // custom 事件默认全量
};

// ---------------------------------------------------------------------------
// 采样判定
// ---------------------------------------------------------------------------

/**
 * 根据事件类型和页面名称判定是否命中采样。
 *
 * 采样规则：
 * - page_enter / page_leave / session_start / app_resume → 查 pageRates
 * - click → 查 pageRates × clickRate
 * - custom → 查 pageRates × customRate
 * - conversion → 始终 100%（转化漏斗不能丢）
 *
 * @param eventType 事件类型
 * @param pageName  路由名（用于查表）
 * @param config    采样配置
 * @returns true = 命中采样（保留），false = 被丢弃
 */
export function shouldSample(
  eventType: TelemetryEventType,
  pageName: string,
  config: SamplingConfig = DEFAULT_SAMPLING_CONFIG,
): boolean {
  // 转化节点事件始终全量采集
  if (eventType === 'conversion') return true;

  // 查页面采样率
  const pageRate = config.pageRates[pageName] ?? config.defaultRate;

  // 根据事件类型乘以额外采样率
  let finalRate = pageRate;
  if (eventType === 'click') {
    finalRate = pageRate * config.clickRate;
  } else if (eventType === 'custom') {
    finalRate = pageRate * config.customRate;
  }

  // 随机判定
  return Math.random() < finalRate;
}

/**
 * 判断页面优先级
 */
export function getPagePriority(
  pageName: string,
  config: SamplingConfig = DEFAULT_SAMPLING_CONFIG,
): 'core' | 'secondary' {
  const rate = config.pageRates[pageName] ?? config.defaultRate;
  return rate >= 1.0 ? 'core' : 'secondary';
}
