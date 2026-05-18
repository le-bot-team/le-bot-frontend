# Le Bot 前端 Code Wiki

> 本文档为 le-bot-frontend 项目（乐宝 AI 机器人 Web 前端）的完整代码知识库，涵盖项目架构、模块职责、核心组件、API 规范及运行指南。
>
> **最后更新**: 2026-05-15
> **技术栈**: Vue 3 + Quasar Framework + Pinia + TypeScript + WebSocket

---

## 1. 项目概述

### 1.1 项目定位

le-bot-frontend 是乐宝 AI 机器人项目的 Web 前端应用，采用 PWA（渐进式 Web 应用）模式开发，支持在浏览器中安装为独立应用。项目采用前后端分离架构，通过 REST API 与 WebSocket 实现与后端服务的通信。

### 1.2 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 核心框架 | Vue 3 | ^3.5.28 |
| UI 框架 | Quasar | ^2.18.6 |
| 状态管理 | Pinia | ^3.0.4 |
| 类型系统 | TypeScript | ~5.9.3 |
| 路由 | Vue Router | ^5.0.2 |
| 国际化 | Vue I18n | ^11.2.8 |
| HTTP 客户端 | Axios | ^1.13.5 |
| 构建工具 | Vite (via Quasar) | - |
| 包管理器 | pnpm | 10.16.1 |

### 1.3 核心功能模块

- **用户认证**: 邮箱验证码登录/注册、密码登录、个人资料管理
- **虚拟设备管理**: 多虚拟设备添加、切换、配置、解绑
- **语音对话系统**: WebSocket 实时语音交互、静音检测、智能打断
- **家庭组管理**: 家庭组成人/儿童成员管理、邀请码分享
- **声纹管理**: 声纹录入、识别、人员管理
- **成长数据中心**: 用户行为数据分析与可视化
- **遥测埋点**: 全链路用户行为追踪与转化分析

---

## 2. 项目结构

```
le-bot-frontend/
├── src/                          # 源代码目录
│   ├── boot/                     # 应用启动插件
│   │   ├── axios.ts              # Axios 实例配置
│   │   ├── bus.ts                # 全局事件总线
│   │   ├── i18n.ts               # 国际化初始化
│   │   ├── media-encoder.ts      # 媒体编码器
│   │   ├── mock.ts               # Mock 数据配置
│   │   └── telemetry.ts          # 遥测引擎初始化
│   │
│   ├── components/               # Vue 组件库
│   │   ├── auth/                 # 认证相关组件
│   │   ├── chat/                 # 聊天相关组件
│   │   ├── family-group/         # 家庭组组件
│   │   ├── growth-data/          # 成长数据组件
│   │   ├── home/                 # 首页组件
│   │   ├── me/                   # "我的"页面组件
│   │   ├── settings/             # 设置相关组件
│   │   │   └── voiceprint/       # 声纹设置组件
│   │   ├── AudioRecorder.vue     # 音频录制组件
│   │   ├── BirthdayPicker.vue    # 生日选择器
│   │   ├── ConfirmDialog.vue     # 确认对话框
│   │   ├── CropperDialog.vue    # 头像裁剪弹窗
│   │   ├── PersonalityEditor.vue # AI 个性编辑器
│   │   └── ShareSheetDialog.vue # 分享弹窗
│   │
│   ├── composables/              # Composition API 复用逻辑
│   │   ├── useChatPlayer.ts      # 音频播放器
│   │   ├── useChatRecorder.ts    # 音频录制器
│   │   ├── useChatSession.ts     # WebSocket 会话管理
│   │   ├── useSilenceDetector.ts # 静音检测器
│   │   ├── useTracker.ts         # 遥测埋点
│   │   ├── useWakeWord.ts        # 唤醒词检测
│   │   └── useWsClient.ts       # WebSocket 客户端封装
│   │
│   ├── css/                      # 全局样式
│   │   ├── app.scss              # 全局样式入口
│   │   └── quasar.variables.scss # Quasar 主题变量
│   │
│   ├── directives/               # Vue 指令
│   │   └── track.ts             # v-track 点击埋点指令
│   │
│   ├── i18n/                     # 国际化资源
│   │   ├── en-US/index.ts       # 英文翻译
│   │   ├── zh-CN/index.ts        # 中文翻译
│   │   └── index.ts             # i18n 入口
│   │
│   ├── layouts/                  # 页面布局
│   │   ├── MainLayout.vue        # 主布局（底部 Tab）
│   │   ├── StackLayout.vue       # 堆栈布局（带头部导航）
│   │   ├── drawers/              # 抽屉组件
│   │   ├── footers/              # 底部导航
│   │   └── headers/              # 顶部导航栏
│   │
│   ├── mock/                     # Mock 数据系统
│   │   ├── data/                 # Mock 数据文件
│   │   ├── handlers/             # Mock 处理器
│   │   ├── ws/                   # WebSocket Mock
│   │   ├── index.ts             # Mock 入口
│   │   └── utils.ts             # Mock 工具函数
│   │
│   ├── pages/                    # 页面组件
│   │   ├── main/                 # 主导航页面
│   │   │   ├── HomePage.vue     # 首页
│   │   │   └── MePage.vue        # "我的"页面
│   │   ├── stack/                # 堆栈页面
│   │   │   ├── chat/            # 聊天相关页面
│   │   │   ├── device-config/   # 设备配置页面
│   │   │   ├── family-group/    # 家庭组页面
│   │   │   ├── growth-data/     # 成长数据页面
│   │   │   ├── help/            # 帮助页面
│   │   │   ├── messages/        # 消息页面
│   │   │   ├── profile/         # 个人资料页面
│   │   │   └── settings/        # 设置页面
│   │   │       └── voiceprint/  # 声纹设置页面
│   │   ├── ErrorNotFound.vue     # 404 页面
│   │   └── SplashPage.vue       # 启动页
│   │
│   ├── router/                   # 路由配置
│   │   ├── index.ts             # 路由创建与守卫
│   │   └── routes.ts            # 路由表定义
│   │
│   ├── stores/                   # Pinia 状态管理
│   │   ├── auth/                # 认证状态
│   │   ├── chat/                # 聊天状态
│   │   ├── device/              # 设备状态
│   │   ├── family-group/        # 家庭组状态
│   │   ├── profile/             # 用户资料状态
│   │   ├── settings/            # 设置状态
│   │   ├── telemetry/           # 遥测状态
│   │   └── index.ts            # Store 入口
│   │
│   ├── types/                    # TypeScript 类型定义
│   │   ├── api/                 # API 类型
│   │   ├── audio/              # 音频类型
│   │   ├── chat/               # 聊天类型
│   │   └── websocket/          # WebSocket 类型
│   │
│   ├── utils/                   # 工具函数
│   │   ├── api/                # API 调用函数
│   │   ├── telemetry/          # 遥测引擎模块
│   │   ├── account.ts          # 账户工具
│   │   ├── audio.ts            # 音频工具
│   │   ├── common.ts           # 通用工具
│   │   ├── device.ts           # 设备工具
│   │   └── validation.ts       # 验证工具
│   │
│   ├── App.vue                  # 根组件
│   └── env.d.ts                # 环境类型声明
│
├── src-pwa/                     # PWA 配置
│   ├── custom-service-worker.ts # Service Worker
│   ├── manifest.json            # Web App Manifest
│   └── register-service-worker.ts
│
├── public/                      # 静态资源
│   ├── icons/                  # PWA 图标
│   └── lanhu-slices/           # 蓝湖切图资源
│
├── docs/                        # 文档目录
│   ├── api-specification.md    # API 接口规范
│   ├── build-and-run.md        # 构建运行指南
│   ├── core-flows.md          # 核心业务流程
│   └── *.md                    # 其他技术文档
│
├── quasar.config.ts            # Quasar 配置
├── tsconfig.json               # TypeScript 配置
├── package.json                # 依赖配置
├── eslint.config.js            # ESLint 配置
└── AGENTS.md                   # Agent 指南
```

---

## 3. 核心模块详解

### 3.1 状态管理 (Pinia Stores)

#### 3.1.1 authStore - 认证状态

**文件位置**: `src/stores/auth/index.ts`

```typescript
// 核心状态
interface AuthState {
  accessToken: string;           // 访问令牌
  sendCodeTime: number;           // 验证码发送时间（用于冷却计时）
}

// 核心方法
- setAccessToken(token: string): void
- clearAccessToken(): void
- tryResetSendCodeCooldown(): void  // 重置验证码冷却
```

**持久化**: `persist: true`，数据存储在 `localStorage`，key 为 `ai-pet-team.le-bot-frontend.auth`

#### 3.1.2 deviceStore - 设备状态

**文件位置**: `src/stores/device/index.ts`

```typescript
// 核心状态
interface DeviceState {
  currentDevice: DeviceInfo | undefined;  // 当前活跃设备
  devices: DeviceInfo[];                  // 设备列表
}

// 计算属性
- virtualDevices: DeviceInfo[]  // 仅虚拟设备

// 核心方法
- updateDevices(devices?: DeviceInfo[]): void    // 批量更新
- addDevice(device: DeviceInfo): void            // 添加设备（含5个上限校验）
- removeDevice(deviceId: string): void            // 移除设备
- setCurrentDevice(deviceId: string): void        // 切换当前设备
```

**关键类型**:

```typescript
interface DeviceInfo {
  id: string;                    // UUID
  identifier: string;            // SN 序列号
  type: 'robot' | 'virtual';     // 设备类型
  model: string;                 // 设备型号
  name: string | null;           // 自定义名称
  config: {
    voiceStyle: string;          // 语音风格
    aiPersonality?: {
      enabled: boolean;
      traits?: string;           // 性格特征
      goals?: string;           // 目标
    };
  } | null;
  childInfo?: ChildInfo | null;   // 关联儿童信息
  boundPhysicalDeviceId: string | null;  // 绑定的物理设备
}
```

#### 3.1.3 chatStore - 聊天状态

**文件位置**: `src/stores/chat/index.ts`

```typescript
// 核心状态
interface ChatState {
  conversationId: string | null;  // 当前会话 ID
}

// 持久化: conversationId 持久化，用于恢复会话
```

#### 3.1.4 familyGroupStore - 家庭组状态

**文件位置**: `src/stores/family-group/index.ts`

```typescript
// 核心状态
interface FamilyGroupState {
  groups: FamilyGroup[];           // 家庭组列表
  currentGroupId: string | null;   // 当前家庭组 ID
}

// 计算属性
- currentGroup: FamilyGroup | undefined
- currentMembers: FamilyMember[]
- currentChild: FamilyMember | undefined
```

#### 3.1.5 profileStore - 用户资料状态

**文件位置**: `src/stores/profile/index.ts`

```typescript
// 核心状态
interface ProfileState {
  profile: UserProfile | null;     // 用户资料
}

// 核心方法
- updateProfile(profile?: UserProfile): void
```

#### 3.1.6 settingsStore - 设置状态

**文件位置**: `src/stores/settings/index.ts`

```typescript
// 核心状态
interface SettingsState {
  theme: 'light' | 'dark' | 'auto';  // 主题设置
  language: string;                   // 应用语言
}

// 核心方法
- applyTheme(): void     // 应用主题到 DOM
- setLanguage(lang: string): void
```

#### 3.1.7 telemetryStore - 遥测状态

**文件位置**: `src/stores/telemetry/index.ts`

```typescript
// 核心状态
interface TelemetryState {
  sessionId: string;                  // 会话 ID
  deviceFingerprint: string;          // 设备指纹
  deviceId: string | null;           // 当前设备 ID
  batchSeq: number;                  // 批次序列号
}
```

---

### 3.2 路由系统

#### 3.2.1 路由结构

**文件位置**: `src/router/routes.ts`

```
/                           → 重定向到 /main/home

/stack                     → StackLayout (带头部导航)
├── /stack/auth            → 认证页
├── /stack/chat            → 聊天主页面
├── /stack/chat/history    → 聊天历史
├── /stack/chat/voice-call → 语音通话模式
├── /stack/chat/mute-settings → 静音设置
├── /stack/devices         → 设备列表
├── /stack/device-config   → 设备配置主页
│   ├── /stack/device-config/voice     → 语音风格
│   ├── /stack/device-config/language  → 语言设置
│   ├── /stack/device-config/personality → AI 个性调节
│   ├── /stack/device-config/wifi      → WiFi 管理
│   ├── /stack/device-config/update    → 固件更新
│   └── /stack/device-config/about    → 关于本机
├── /stack/family-groups   → 家庭组列表
│   ├── /stack/family-groups/detail   → 家庭组详情
│   ├── /stack/family-groups/member   → 成员信息
│   ├── /stack/family-groups/invite   → 邀请成员
│   └── /stack/family-groups/child-edit → 编辑儿童信息
├── /stack/growth-data     → 成长数据中心
│   ├── /stack/growth-data/weekly-report    → 周报
│   └── /stack/growth-data/capability/:key  → 能力详情
├── /stack/help           → 帮助与反馈
│   ├── /stack/help/faq       → 常见问题
│   └── /stack/help/feedback   → 意见反馈
├── /stack/messages       → 消息列表
│   └── /stack/messages/:id   → 消息详情
├── /stack/profile        → 个人资料
│   ├── /stack/profile/edit          → 字段编辑
│   ├── /stack/profile/change-password → 修改密码
│   └── /stack/profile/change-phone    → 修改手机号
├── /stack/settings       → 设置主页
│   ├── /stack/settings/voiceprint     → 声纹管理
│   │   ├── /stack/settings/voiceprint/detail/:personId → 声纹详情
│   │   ├── /stack/settings/voiceprint/new      → 新建声纹
│   │   └── /stack/settings/voiceprint/test      → 声纹测试
│   └── /stack/settings/*     → 其他设置页面
├── /stack/add-virtual-device → 添加虚拟设备
├── /stack/onboarding-complete → 引导完成页
└── /stack/onboarding          → 功能引导页

/main                      → MainLayout (底部 Tab)
├── /main/home            → 首页
└── /main/me              → "我的"页面
```

#### 3.2.2 路由守卫

**文件位置**: `src/router/index.ts`

- **认证守卫**: 无 `accessToken` 时自动跳转 `/stack/auth?from=<当前路径>`
- **登录后跳转**: 登录成功后跳回 `from` 参数指定页面
- **遥测埋点**: `afterEach` 守卫自动采集页面 PV/停留时长

---

### 3.3 API 调用层

#### 3.3.1 Axios 实例配置

**文件位置**: `src/boot/axios.ts`

```typescript
// API 基础配置
const api = axios.create({
  baseURL: process.env.LE_BOT_BACKEND_HTTP_BASE_URL + '/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// 请求拦截器: 自动添加 x-access-token
// 响应拦截器: 统一处理错误提示
```

#### 3.3.2 API 模块划分

| 模块 | 文件位置 | 主要函数 |
|------|----------|----------|
| 认证 | `src/utils/api/auth.ts` | `validateAccessToken`, `sendEmailChallenge`, `emailCodeLogin`, `emailPasswordLogin`, `resetPassword` |
| 设备 | `src/utils/api/device.ts` | `retrieveMine`, `activateVirtualDevice`, `unbindDevice` |
| 资料 | `src/utils/api/profile.ts` | `retrieveProfileInfo`, `retrieveProfileAvatar`, `updateProfileInfo`, `updatePassword` |
| 声纹 | `src/utils/api/voiceprint.ts` | `recognize`, `register`, `getPersons`, `getPersonDetail`, `updatePerson`, `deletePerson` |
| 家庭组 | `src/utils/api/family-group.ts` | `getMyGroups`, `getGroupDetail`, `generateInviteCode`, `joinGroup`, `leaveGroup` |
| 遥测 | `src/utils/api/telemetry.ts` | `batchSend` |

---

### 3.4 WebSocket 通信

#### 3.4.1 连接管理

**文件位置**: `src/composables/useWsClient.ts`

```typescript
interface WsClient {
  connect(url: string): void;           // 建立连接
  disconnect(): void;                   // 断开连接
  send(action: string, data?: object): void;  // 发送消息
  on(action: string, handler: Function): void;  // 注册消息处理器
  off(action: string): void;            // 移除消息处理器
}
```

#### 3.4.2 聊天会话管理

**文件位置**: `src/composables/useChatSession.ts`

```typescript
// 核心方法
- connect(token: string, deviceId?: string): Promise<void>
- disconnect(): void
- sendAudioChunk(buffer: ArrayBuffer): void
- sendAudioComplete(): void
- cancelOutput(cancelType: 'manual' | 'voice'): void
- clearContext(): void

// 状态
- connectionState: 'idle' | 'connecting' | 'connected' | 'disconnected'
- isPlaying: boolean
```

#### 3.4.3 WebSocket 消息协议

**客户端 → 服务端**:

| Action | 说明 | Data |
|--------|------|------|
| `updateConfig` | 更新配置 | conversationId, outputText, timezone, voiceId, speechRate, sampleRate, location |
| `inputAudioStream` | 音频流 | buffer (Base64 PCM) |
| `inputAudioComplete` | 音频结束 | - |
| `cancelOutput` | 取消输出 | cancelType |
| `clearContext` | 清除上下文 | - |

**服务端 → 客户端**:

| Action | 说明 | Data |
|--------|------|------|
| `establishConnection` | 连接确认 | - |
| `updateConfig` | 配置更新 | conversationId |
| `outputAudioStream` | 音频流 | chatId, conversationId, buffer |
| `outputAudioComplete` | 音频结束 | chatId, conversationId |
| `outputTextStream` | 文本流 | chatId, conversationId, role, text |
| `outputTextComplete` | 文本结束 | 同 outputTextStream |
| `chatComplete` | 对话结束 | chatId, conversationId, createdAt, completedAt |
| `cancelOutput` | 输出取消 | cancelType |

---

### 3.5 音频处理

#### 3.5.1 音频录制

**文件位置**: `src/composables/useChatRecorder.ts`

```typescript
interface AudioRecorder {
  start(): Promise<void>;        // 开始录制
  stop(): void;                  // 停止录制
  isRecording: boolean;           // 录制状态
  onDataAvailable: (buffer: ArrayBuffer) => void;  // 数据回调
}
```

#### 3.5.2 音频播放

**文件位置**: `src/composables/useChatPlayer.ts`

```typescript
interface AudioPlayer {
  play(buffer: ArrayBuffer): void;    // 播放音频
  stop(): void;                       // 停止播放
  isPlaying: boolean;                  // 播放状态
}
```

#### 3.5.3 静音检测

**文件位置**: `src/composables/useSilenceDetector.ts`

```typescript
interface SilenceDetector {
  start(): void;          // 开始检测
  stop(): void;           // 停止检测
  onSilenceDetected: () => void;  // 静音回调
}

// 配置参数
- 检测间隔: 500ms
- RMS 阈值: 200.0
- 静音触发: 连续 6 次 (3s)
```

---

### 3.6 遥测埋点系统

#### 3.6.1 引擎架构

**文件位置**: `src/utils/telemetry/`

```
engine.ts       → 事件调度中心
sampling.ts     → 采样过滤
buffer.ts       → 缓冲队列
offline.ts      → 离线队列 (IndexedDB)
privacy.ts      → 隐私过滤
fingerprint.ts  → 设备指纹
```

#### 3.6.2 事件类型

| 类型 | 说明 |
|------|------|
| `page_enter` | 页面进入 (PV) |
| `page_leave` | 页面离开 (含停留时长) |
| `click` | 点击事件 |
| `custom` | 自定义业务事件 |
| `session_start` | 会话开始 |
| `app_resume` | App 从后台恢复 |
| `conversion` | 转化节点事件 |

#### 3.6.3 转化节点

| 节点 | 说明 |
|------|------|
| `auth_view` | 打开认证页 |
| `auth_code_sent` | 发送验证码 |
| `auth_login_success` | 登录成功 |
| `profile_setup` | 完善个人信息 |
| `onboarding_complete` | 引导完成 |
| `device_activated` | 虚拟设备激活 |
| `voiceprint_registered` | 声纹录入 |
| `personality_set` | AI 个性设置 |
| `first_chat` | 首次进入聊天 |
| `family_group_joined` | 加入家庭组 |

#### 3.6.4 采样率配置

| 页面类型 | 采样率 |
|----------|--------|
| 核心页面 (首页/聊天/认证等) | 100% |
| 次要页面 (设置/帮助等) | 30% |

---

## 4. 核心业务流程

### 4.1 用户注册登录流程

```
入口页 (AuthPage)
  │
  ├── 验证码模式
  │   ├── POST /auth/email/challenge  → 发送验证码
  │   └── POST /auth/email/code       → 验证码登录/注册
  │
  └── 密码模式
      └── POST /auth/email/password   → 密码登录

返回 { accessToken, isNew, noPassword }
  │
  ├── isNew=true 或 noPassword=true → 设置密码页 → POST /auth/email/reset
  │
  └── 完成后 → 完善个人信息页 (SetupProfilePanel)
      └── PUT /profiles/info → trackConversion('profile_setup')
      └── 跳转到 /stack/onboarding-complete
```

### 4.2 添加虚拟设备流程

```
OnboardingCompletePage 或 DevicesPage
  │
  ▼
AddVirtualDevicePage (5步引导)
  │
  ├── Step 1: 填写儿童信息 (必填)
  │   └── 性别/姓名/生日
  │
  ├── Step 2: 激活虚拟设备 (自动)
  │   └── POST /devices/virtual/activate
  │
  ├── Step 3: 录制声纹 (必填)
  │   └── POST /voiceprint/register
  │   └── trackConversion('voiceprint_registered')
  │
  ├── Step 4: AI 个性调节 (可选)
  │   └── 设置 enabled/traits/goals
  │
  └── Step 5: 完成
      └── trackConversion('device_activated')
      └── 跳转到 /stack/chat 或 /main/home
```

### 4.3 聊天状态机

```
Idle ──wake(按住说话)──> WaitingResponse ──outputAudioComplete──> Active
  ^                           │                                      │
  |                    30s 超时                              检测到静音
  |                           │                                      │
  └───────────────────────────┴──────────────────────────────────────┘
```

**状态说明**:

| 状态 | 说明 |
|------|------|
| **Idle** | 空闲，等待唤醒。WebSocket 已连接，唤醒词检测运行 |
| **WaitingResponse** | 已唤醒，正在录音并流式发送音频，等待服务端响应 |
| **Active** | 对话进行中，同时录音和播放，静音检测运行 |

**超时与打断**:

- 30s 无响应 → 自动发送 `inputAudioComplete` 回到 Idle
- 检测到 3s 静音 → 发送 `inputAudioComplete`
- 语音打断 → 服务端发送 `cancelOutput`

---

## 5. 关键类型定义

### 5.1 API 响应格式

```typescript
// 成功响应
interface SuccessResponse<T> {
  success: true;
  data: T;
}

// 失败响应
interface ErrorResponse {
  success: false;
  message: string;
}

// 联合类型
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
```

### 5.2 声纹类型

```typescript
type VprRelationship = 'self' | 'family' | 'friend' | 'colleague' | 'other';

interface Person {
  person_id: string;
  voice_count: number;
  is_temporal: boolean;
  expire_date?: string;
  name?: string;
  age?: number;
  relationship: VprRelationship;
}

interface RecognitionData {
  person_id: string;
  voice_id: string;
  confidence: number;
  similarity: number;
  name?: string;
}
```

### 5.3 家庭组类型

```typescript
type FamilyUserRole = 'father' | 'mother' | 'grandpa' | 'grandma' | 'friend' | 'other';

interface FamilyMember {
  id: string;
  memberType: 'user' | 'child';
  userId?: string;
  nickname?: string;
  avatar?: string;
  role?: FamilyUserRole;
  hasVoiceprint?: boolean;
  voiceprintPersonId?: string;
  childInfo?: ChildInfo;
  isCreator: boolean;
}

interface FamilyGroup {
  id: string;
  name: string;
  childName: string;
  deviceId: string;
  members: FamilyMember[];
  inviteCode?: InviteCode;
}
```

### 5.4 WebSocket 消息类型

```typescript
interface WsMessage {
  id: string;
  action: string;
  data?: object;
}

interface WsAudioStream {
  buffer: string;  // Base64 encoded
}

interface WsTextStream {
  chatId: string;
  conversationId: string;
  role: 'user' | 'assistant';
  text: string;
}
```

---

## 6. 环境变量与配置

### 6.1 环境变量

| 变量 | 开发环境 | 生产环境 |
|------|----------|----------|
| `LE_BOT_BACKEND_HTTP_BASE_URL` | `http://localhost:3000` | `https://cafuuchino.studio26f.org:10543` |
| `LE_BOT_BACKEND_WS_BASE_URL` | `ws://localhost:3000` | `wss://cafuuchino.studio26f.org:10543` |
| `VITE_MOCK_ENABLED` | `true` | `false` |
| `VITE_MOCK_WS_ENABLED` | `true` | `false` |
| `DEPLOY_GITHUB_PAGE` | 未设置 | `1` |

### 6.2 构建配置

**文件位置**: `quasar.config.ts`

- **路由模式**: Hash (`vueRouterMode: 'hash'`)
- **PWA 模式**: InjectManifest
- **构建目标**: es2022, firefox115, chrome115, safari14

---

## 7. 运行与构建

### 7.1 环境要求

- Node.js: ^18 || ^20 || ^22 || ^24 || ^26 || ^28
- pnpm: 10.16.1

### 7.2 安装依赖

```bash
pnpm install
```

### 7.3 开发模式

```bash
pnpm dev
# 访问 http://localhost:3001
```

### 7.4 生产构建

```bash
pnpm build
# 产物输出到 dist/pwa/
```

### 7.5 GitHub Pages 部署

```bash
$env:DEPLOY_GITHUB_PAGE="1"; pnpm build
```

### 7.6 代码检查

```bash
pnpm lint    # ESLint 检查
pnpm format  # Prettier 格式化
```

---

## 8. 目录规范

### 8.1 组件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 页面组件 | PascalCase, 以 Page 结尾 | `HomePage.vue` |
| 布局组件 | PascalCase, 以 Layout 结尾 | `MainLayout.vue` |
| 业务组件 | PascalCase, 以功能命名 | `DeviceSwitchPanel.vue` |
| 基础组件 | PascalCase, 通用命名 | `ConfirmDialog.vue` |

### 8.2 Composables 命名

- 文件名: `camelCase`, 以 `use` 开头
- 示例: `useChatSession.ts`, `useTracker.ts`

### 8.3 Store 命名

- 目录名: `kebab-case`
- 文件名: `index.ts`
- Store ID: `camelCase`
- 示例: `stores/auth/index.ts` → `useAuthStore()`

### 8.4 API 工具命名

- 文件名: `kebab-case`
- 函数名: `camelCase`
- 示例: `utils/api/device.ts` → `retrieveMine()`, `activateVirtualDevice()`

### 8.5 国际化键位

```
pages.<module>.<PageName>.labels.*
pages.<module>.<component>.labels.*
components.<component>.labels.*
common.* (通用文案)
```

---

## 9. Mock 数据系统

### 9.1 启用方式

```bash
# 开发模式默认启用
pnpm dev

# 或手动指定
VITE_MOCK_ENABLED=true pnpm dev
```

### 9.2 Mock 文件结构

```
src/mock/
├── data/           # 静态数据
│   ├── auth.ts
│   ├── device.ts
│   ├── profile.ts
│   └── voiceprint.ts
├── handlers/       # 请求处理器
│   ├── auth.ts
│   ├── device.ts
│   ├── profile.ts
│   └── voiceprint.ts
├── ws/            # WebSocket Mock
│   └── MockChatWebSocket.ts
└── index.ts       # 入口配置
```

### 9.3 Mock HTTP 拦截

通过 `axios-mock-adapter` 拦截指定路径的请求，返回预设数据。

### 9.4 Mock WebSocket

`MockChatWebSocket` 模拟服务端行为，响应 `inputAudioStream` 并发送 `outputAudioStream`。

---

## 10. 隐私合规

### 10.1 用户标识

- 登录用户: `userIdHash = SHA-256(accessToken + salt)`, 取前 16 位
- 未登录用户: 设备指纹哈希

### 10.2 数据过滤

`data` 字段仅上传白名单 key，自动过滤:
- 邮箱 (email)
- 手机号 (phone)
- 密码 (password)
- 姓名 (name)
- 头像 (avatar)
- 生日 (birthday)

### 10.3 儿童信息

不采集任何儿童个人信息明文。

---

## 11. 外部依赖关系

### 11.1 后端服务

| 服务 | 地址 | 用途 |
|------|------|------|
| le-bot-backend | localhost:3000 (开发) | REST API + WebSocket |
| Volcengine ASR | 云端 | 语音识别 |
| Volcengine TTS | 云端 | 语音合成 |

### 11.2 第三方资源

| 资源 | 用途 |
|------|------|
| Quasar Icons (MDI) | 图标库 |
| Roboto Font | 字体 |
| Material Icons | 图标库 |

---

## 12. 常见问题排查

### 12.1 麦克风权限

音频录制需要麦克风权限，在非 HTTPS 环境下必须使用 `localhost` 访问。

### 12.2 WebSocket 连接失败

1. 检查后端服务是否运行在 localhost:3000
2. 检查 `accessToken` 是否有效
3. 查看浏览器控制台 WebSocket 连接详情

### 12.3 Mock 数据不生效

确认 `VITE_MOCK_ENABLED=true` 已设置，且 Mock handlers 已正确注册。

### 12.4 PWA 无法安装

需要 HTTPS 环境或 localhost。检查 `manifest.json` 和 Service Worker 是否正确配置。

---

## 13. 相关文档

| 文档 | 说明 |
|------|------|
| `AGENTS.md` | Agent 开发指南 |
| `docs/api-specification.md` | 完整 API 接口规范 |
| `docs/core-flows.md` | 核心业务流程详解 |
| `docs/build-and-run.md` | 构建运行详细指南 |
| `docs/telemetry-plan.md` | 遥测系统设计文档 |
| `docs/virtual-device-implementation.md` | 虚拟设备实施文档 |
| `.qoder/skills/lanhu-ui-sync/` | UI 同步技能 |

---

*本文档由代码分析自动生成，如有疑问请查阅源代码或联系项目维护者。*
