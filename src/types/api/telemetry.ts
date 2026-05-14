/**
 * Telemetry (遥测) 系统类型定义
 *
 * 覆盖页面浏览、停留时长、交互点击、转化漏斗、行为路径、用户留存六大维度。
 * 所有事件经过隐私过滤和采样控制后批量上报至后端。
 */

// ---------------------------------------------------------------------------
// 事件类型
// ---------------------------------------------------------------------------

/** 遥测事件类型枚举 */
export type TelemetryEventType =
  | 'page_enter'       // 页面进入（PV）
  | 'page_leave'       // 页面离开（含停留时长）
  | 'click'            // 按钮/元素点击
  | 'custom'           // 自定义业务事件
  | 'session_start'    // 会话开始（用于留存计算）
  | 'app_resume'       // App 从后台恢复到前台
  | 'conversion';      // 转化节点事件（如注册完成、首次聊天等）

// ---------------------------------------------------------------------------
// 转化节点枚举
// ---------------------------------------------------------------------------

/** 转化漏斗关键节点 */
export type ConversionNode =
  | 'auth_view'              // 打开认证页
  | 'auth_code_sent'         // 发送验证码
  | 'auth_login_success'     // 登录/注册成功
  | 'profile_setup'          // 完善个人信息
  | 'onboarding_complete'    // 引导完成
  | 'device_activated'       // 虚拟设备激活
  | 'voiceprint_registered'  // 声纹录入
  | 'personality_set'        // AI 个性调节
  | 'first_chat'             // 首次进入聊天
  | 'first_voice_input'      // 首次语音输入
  | 'first_ai_response'      // 首次收到 AI 回复
  | 'family_group_joined'    // 加入家庭组
  | 'device_switched';       // 切换设备

// ---------------------------------------------------------------------------
// 页面优先级（用于采样率控制）
// ---------------------------------------------------------------------------

/** 页面埋点优先级 */
export type PagePriority = 'core' | 'secondary';

// ---------------------------------------------------------------------------
// 遥测事件
// ---------------------------------------------------------------------------

/** 遥测事件结构 */
export interface TelemetryEvent {
  /** 事件唯一标识 (UUID v4)，用于去重 */
  id: string;
  /** 事件类型 */
  type: TelemetryEventType;
  /** 事件名称：路由名（page_enter/leave）或业务事件名（click/custom/conversion） */
  name: string;
  /** 当前页面路径 */
  page: string;
  /** 来源页面路径 */
  referrer: string;
  /** 用户标识哈希 (SHA-256)，未登录时为设备指纹 */
  userIdHash: string;
  /** 会话 ID（单次访问期间不变，用于留存分析） */
  sessionId: string;
  /** 当前活跃设备 ID（如已选择设备） */
  deviceId: string | null;
  /** 客户端时间戳 (ms) */
  timestamp: number;
  /** 停留时长 (ms)，仅 page_leave 事件 */
  duration?: number;
  /** 事件自定义数据（白名单过滤后） */
  data?: Record<string, unknown> | undefined;
  /** 是否命中采样（true = 保留，false = 被采样丢弃但标记） */
  sampled: boolean;
}

// ---------------------------------------------------------------------------
// 批量上报接口
// ---------------------------------------------------------------------------

/** 批量上报请求体 */
export interface TelemetryBatchRequest {
  /** 事件列表 */
  events: TelemetryEvent[];
  /** 客户端发送时间 (ms) */
  clientTime: number;
  /** 批次序列号（单调递增，用于后端去重和排序） */
  batchSeq: number;
}

/** 批量上报成功响应 */
export interface TelemetryBatchSuccessResponse {
  success: true;
  data: {
    /** 服务端接收的事件数量 */
    received: number;
  };
}

/** 批量上报失败响应 */
export interface TelemetryBatchFailResponse {
  success: false;
  message: string;
}

/** 批量上报响应（discriminated union） */
export type TelemetryBatchResponse =
  | TelemetryBatchSuccessResponse
  | TelemetryBatchFailResponse;

// ---------------------------------------------------------------------------
// 采样率配置
// ---------------------------------------------------------------------------

/** 采样率配置表：路由名 → 采样率 (0~1) */
export type SamplingRateMap = Record<string, number>;

/** 采样率完整配置 */
export interface SamplingConfig {
  /** 页面级采样率映射 */
  pageRates: SamplingRateMap;
  /** 默认采样率（未在 pageRates 中匹配的页面） */
  defaultRate: number;
  /** click 事件额外采样率（0~1，与页面采样率取交集） */
  clickRate: number;
  /** custom 事件额外采样率 */
  customRate: number;
}

// ---------------------------------------------------------------------------
// 隐私过滤配置
// ---------------------------------------------------------------------------

/** 允许在 data 字段中上传的 key 白名单 */
export type DataKeyWhitelist = ReadonlySet<string>;

// ---------------------------------------------------------------------------
// 引擎配置
// ---------------------------------------------------------------------------

/** 遥测引擎配置 */
export interface TelemetryEngineConfig {
  /** 缓冲区最大容量（超过则立即 flush） */
  bufferSize: number;
  /** 定时 flush 间隔 (ms) */
  flushInterval: number;
  /** 离线队列 IndexedDB 数据库名 */
  offlineDbName: string;
  /** 离线队列 IndexedDB store 名 */
  offlineStoreName: string;
  /** 离线队列最大条目数（超过则 FIFO 淘汰） */
  offlineMaxEntries: number;
  /** 单次补发最大批次大小 */
  offlineFlushBatchSize: number;
  /** 采样率配置 */
  sampling: SamplingConfig;
  /** 是否启用遥测（可用于开发环境关闭） */
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// 路由守卫辅助类型
// ---------------------------------------------------------------------------

/** 页面进入时的元信息（保存在内存中用于计算停留时长） */
export interface PageEnterMeta {
  /** 进入时间戳 */
  enterTime: number;
  /** 页面路径 */
  path: string;
  /** 路由名 */
  name: string | null | undefined;
}

// ---------------------------------------------------------------------------
// v-track 指令绑定值
// ---------------------------------------------------------------------------

/** v-track 指令绑定值 */
export interface VTrackBinding {
  /** 事件名称（必填） */
  event: string;
  /** 事件自定义数据 */
  data?: Record<string, unknown>;
  /** 是否延迟到下一个微任务再上报（避免事件冒泡导致重复） */
  debounce?: boolean;
}
