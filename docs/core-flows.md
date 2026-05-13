# LeBot 前端核心业务流程文档

> 基于代码实际实现梳理，涵盖用户、家庭组、虚拟设备三者的关系与交互流程。

---

## 整体架构概览

**技术栈**: Quasar Framework + Vue 3 + Pinia + TypeScript
**通信方式**: REST API（Axios，`x-access-token` 鉴权） + WebSocket（实时聊天）
**布局体系**: `MainLayout`（底部 Tab 主页） + `StackLayout`（带返回头的堆栈页面）
**核心实体关系**: 用户 → 拥有多个设备 → 每个虚拟设备关联一个家庭组 → 家庭组包含儿童+成人成员

```
用户 (User)
 ├── 虚拟设备1 (VirtualDevice) ── 家庭组1 (FamilyGroup)
 │    ├── 儿童成员 (Child)
 │    └── 成人成员 (User) × N
 ├── 虚拟设备2 ── 家庭组2
 │    └── ...
 └── 物理设备 (RobotDevice) [预留]
```

---

## 流程一：注册登录

### 流程图

```
/stack/auth (AuthPage)
  │
  ├── Step 0: 登录/注册 (SignInOrSignUpPanel)
  │    │
  │    ├── [验证码登录] POST /auth/email/challenge → POST /auth/email/code
  │    │    └── 返回 { accessToken, isNew, noPassword }
  │    │
  │    └── [密码登录] POST /auth/email/password
  │         └── 返回 { accessToken, isNew, noPassword }
  │
  ├── Step 1: 设置密码 (NewPasswordPanel) [仅 isNew 或 noPassword 时]
  │    └── POST /auth/email/reset → POST /auth/email/password
  │
  └── Step 2: 完善个人信息 (SetupProfilePanel) [必填，不可跳过]
       ├── 设置头像（CropperDialog 裁剪）
       ├── 设置昵称
       ├── 设置生日（BirthdayPicker）
       ├── 选择与孩子的关系（妈妈/爸爸/奶奶/爷爷/外婆/外公/朋友/其他亲属）
       └── PUT /profiles/info → GET /profiles/info
            └── 跳转到 /stack/onboarding-complete
```

### 关键 API

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/auth/email/challenge` | 发送邮箱验证码 |
| POST | `/auth/email/code` | 验证码登录/注册 |
| POST | `/auth/email/password` | 密码登录 |
| POST | `/auth/email/reset` | 重置密码 |
| GET | `/auth/validate` | 验证 token 有效性 |

### 关键 Store

- **authStore**: 持久化存储 `accessToken`、`sendCodeTime`（验证码 60s 冷却）

### 路由守卫逻辑

- 无 `accessToken` 时，自动跳转 `/stack/auth?from=<当前路径>`
- 登录成功后跳回 `from` 参数指定的页面

---

## 流程二：完善用户信息

### 注册流程中完善

在注册 Step 2（`SetupProfilePanel`）中完成首次信息填写，**不可跳过**。

### 后续修改

```
/stack/profile (ProfilePage)
  ├── 编辑昵称/生日 → /stack/profile/edit?field=nickname|birthday|bio
  ├── 修改手机号 → /stack/profile/change-phone (两步: 验证旧手机 → 绑定新手机)
  ├── 修改密码 → /stack/profile/change-password
  └── 注销账号 → POST /profiles/deactivate → 清空 token → 回首页
```

### Profile 数据模型

```typescript
interface UserProfile {
  id: string;
  nickname: string;
  bio: string;
  avatar: string;
  avatarHash: string;
  region: string;
  birthday: string;
  phone: string;
  relationship: string;
  created_at: string;
  updated_at: string;
  last_active: string;
  last_login: string;
}
```

---

## 流程三：添加虚拟乐宝 / 加入家庭组

### 注册完成引导页

```
/stack/onboarding-complete (OnboardingCompletePage)
  ├── 选项A: 添加虚拟乐宝设备 → /stack/add-virtual-device
  └── 选项B: 扫码加入家庭组 → TODO（暂未实现，提示"即将上线"）
```

### 扫码加入家庭组（TODO）

当前仅有入口 UI，实际扫码功能未实现。预期流程：
1. 扫描二维码获取邀请码
2. 调用 `POST /family-groups/:id/join` 加入
3. 自动成为该家庭组成人成员

---

## 流程四：添加虚拟乐宝

### 五步引导流程

```
/stack/add-virtual-device (AddVirtualDevicePage)
  │
  ├── Step 1: 填写儿童信息 [必填，不可跳过]
  │    ├── 选择性别（男孩/女孩）
  │    ├── 输入姓名（设备自动命名为 "{姓名}的乐宝"）
  │    ├── 输入生日
  │    └── 校验: 姓名和生日均为必填
  │
  ├── Step 2: 激活虚拟设备 [自动触发]
  │    ├── POST /devices/virtual/activate
  │    ├── 成功: 获得设备 ID，1s 后自动进入 Step 3
  │    └── 失败: 显示错误，可重试
  │
  ├── Step 3: 录制声纹 [可跳过]
  │    ├── RecordPanel: 按住录音
  │    └── SubmitPanel: 提交声纹（姓名默认儿童名，关系默认 "self"）
  │         └── POST /voiceprint/register
  │
  ├── Step 4: AI 个性调节 [可跳过]
  │    ├── PersonalityEditor: 设置 enabled/traits/goals
  │    ├── 跳过: 默认启用（无 traits/goals）
  │    └── 禁用: aiPersonality.enabled = false
  │
  └── Step 5: 完成
       ├── "开始聊天" → /stack/chat（自动创建家庭组 + 切换设备）
       └── "回到首页" → /main/home
```

### 关键约束

- 每个用户最多 **5 个虚拟设备**（`MAX_VIRTUAL_DEVICES = 5`）
- 添加设备时自动创建关联家庭组（本地创建，后续同步后端）

### 关键 API

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/devices/virtual/activate` | 激活虚拟设备 |
| POST | `/voiceprint/register` | 注册声纹 |

### 设备数据模型

```typescript
interface DeviceInfo {
  id: string;
  identifier: string;        // 序列号
  ownerId: string;
  type: 'robot' | 'virtual'; // 设备类型
  model: string;
  name: string | null;       // 如 "小新的乐宝"
  config: {
    voiceStyle: string;
    aiPersonality?: {
      enabled: boolean;
      traits?: string;       // AI 性格特征描述
      goals?: string;        // AI 目标描述
    };
  } | null;
  childInfo?: ChildInfo | null;
}
```

---

## 流程五：录制声纹 & AI 个性调节

### 5.1 声纹管理

#### 添加设备流程中的声纹录入

在 `AddVirtualDevicePage` Step 3 中内嵌声纹录制：
1. **RecordPanel**: 按住按钮录音，松开结束
2. **SubmitPanel**: 填写姓名（默认儿童名）、年龄、关系（默认 `self`），提交
3. 可跳过，跳过后不影响后续流程

#### 独立声纹管理页面

```
/stack/settings/voiceprint (VoiceprintPage)
  ├── 查看所有声纹人员列表 (GET /voiceprint/persons)
  ├── 点击人员 → /stack/settings/voiceprint/detail/:personId
  │    ├── 查看声纹详情 (GET /voiceprint/persons/:id)
  │    ├── 添加新声纹 (POST /voiceprint/persons/:id/voices/add)
  │    ├── 删除声纹 (DELETE /voiceprint/persons/:id/voices/:voiceId)
  │    └── 删除人员 (DELETE /voiceprint/persons/:id)
  └── 新建声纹 → /stack/settings/voiceprint/new
       └── POST /voiceprint/register

/stack/settings/voiceprint/test (TestPage)
  └── 声纹识别测试 (POST /voiceprint/recognize)
```

#### 声纹 API 完整列表

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/voiceprint/persons` | 获取所有声纹人员 |
| GET | `/voiceprint/persons/:id` | 获取人员详情（含声纹列表） |
| POST | `/voiceprint/register` | 注册新人员+声纹 |
| POST | `/voiceprint/persons/:id/voices/add` | 为已有人员添加声纹 |
| PUT | `/voiceprint/persons/:id/voices/:voiceId` | 更新声纹 |
| DELETE | `/voiceprint/persons/:id/voices/:voiceId` | 删除单条声纹 |
| DELETE | `/voiceprint/persons/:id` | 删除人员 |
| PUT | `/voiceprint/persons/:id` | 更新人员信息 |
| POST | `/voiceprint/recognize` | 声纹识别 |

#### 声纹人员数据模型

```typescript
interface Person {
  person_id: string;
  voice_count: number;
  is_temporal: boolean;
  expire_date?: string;
  name?: string;
  age?: number;
  address?: string;
  relationship: VprRelationship;
  metadata?: Record<string, unknown>;
}
```

### 5.2 AI 个性调节

#### 设备配置入口

```
/stack/device-config (DeviceConfigPage) — 设备配置主页
  ├── 语音风格 → /stack/device-config/voice
  ├── 语言 → /stack/device-config/language
  ├── 个性调节 → /stack/device-config/personality
  │    ├── 未启用: PersonalityPage (开关页)
  │    │    └── 开启后跳转 → /stack/device-config/personality/detail
  │    └── 已启用: PersonalityDetailPage (编辑页)
  │         ├── 设置性格特征 (traits)
  │         └── 设置目标 (goals)
  └── 删除设备 (解除绑定)
```

#### 个性调节数据模型

```typescript
interface AiPersonality {
  enabled: boolean;   // 是否启用 AI 个性
  traits?: string;    // 性格特征描述（如"温和、耐心、富有想象力"）
  goals?: string;     // 目标描述（如"陪伴孩子成长、激发创造力"）
}
```

#### 个性调节在两个场景中的使用

1. **添加设备时**: `AddVirtualDevicePage` Step 4，通过 `PersonalityEditor` 组件设置
2. **设备配置时**: `DeviceConfigPage` → `PersonalityPage` → `PersonalityDetailPage`

---

## 流程六：进入主页点击乐宝聊天

### 主页结构

```
/main/home (HomePage) — 主页
  ├── 顶部导航: 设备名称 + 设备切换 + 设置 + 消息
  ├── 陪伴天数 (mock 数据)
  ├── 乐宝形象 (点击 → 进入聊天)
  ├── 气泡文案
  └── 高频话题 (点击话题 → 带参数进入聊天)
       └── /stack/chat?topic=xxx
```

### 聊天页面

```
/stack/chat (ChatPage) — 聊天主页面
  ├── Header: 设备名 + 静音按钮 + 通话按钮
  ├── 消息列表 (ChatMessageList): 显示对话气泡
  └── 输入栏 (ChatInputBar): "按住说话" 交互
```

### 聊天核心流程（状态机）

```
Idle ──wake(按住说话)──> WaitingResponse ──outputAudioComplete──> Active
  ^                           |                                      |
  |                    30s 超时                              检测到静音
  |                           |                                      |
  └───────────────────────────┴──────────────────────────────────────┘
```

**三个状态**:

| 状态 | 说明 |
|------|------|
| **Idle** | 空闲，等待唤醒（唤醒词/按钮）。唤醒词检测运行中 |
| **WaitingResponse** | 已唤醒，正在录音并流式发送音频，等待服务端响应 |
| **Active** | 对话进行中，同时录音和播放，静音检测运行中 |

### WebSocket 聊天协议

#### 连接建立

```
WS: {LE_BOT_BACKEND_WS_BASE_URL}/api/v1/chat/ws?token={accessToken}&deviceId={deviceId}
```

#### 消息交互时序

```
客户端                                  服务端
  │                                       │
  │──── updateConfig ──────────────────>  │  (发送 conversationId, timezone, voiceId 等)
  │<─── updateConfig (conversationId) ──  │
  │                                       │
  │     [用户按住说话，开始录音]            │
  │                                       │
  │──── inputAudioStream (base64) ─────>  │  (每 200ms 发送一个音频块)
  │──── inputAudioStream (base64) ─────>  │
  │──── inputAudioStream (base64) ─────>  │
  │     ...                               │
  │                                       │
  │<─── outputTextStream (user text) ───  │  (ASR 识别结果)
  │<─── outputTextComplete (user text) ── │
  │                                       │
  │<─── outputAudioStream (base64) ────  │  (TTS 音频流式返回)
  │<─── outputAudioStream (base64) ────  │
  │<─── outputTextStream (assistant) ──  │  (AI 文本流式返回)
  │<─── outputTextComplete (assistant) ─  │
  │<─── outputAudioComplete ────────────  │
  │<─── chatComplete ───────────────────  │  (本轮对话结束)
  │                                       │
  │     [静音检测触发 → 发送 inputAudioComplete]
  │                                       │
  │──── inputAudioComplete ────────────>  │
  │                                       │
  │     [30s 无响应 → 自动超时回到 Idle]     │
```

#### 智能打断

- 服务端识别到用户说话（`outputTextStream` role=`user`，文本长度 >= 2）时，客户端自动停止当前播放
- 手动取消: 发送 `cancelOutput` (cancelType: `manual`)
- 语音打断: 服务端发送 `cancelOutput` (cancelType: `voice`)

#### 关键超时参数

| 参数 | 值 | 说明 |
|------|------|------|
| waitingResponseTimeout | 30s | 等待响应超时，超时后发送 `inputAudioComplete` 回到 Idle |
| cancelCooldown | 300ms | 发送取消后的冷却时间 |
| 静音检测间隔 | 500ms | RMS 采样间隔 |
| 静音触发 | 连续 6 次 (3s) | 连续静音采样次数 |
| 音频块间隔 | 200ms | 流式音频发送间隔 |

### 聊天子页面

| 路由 | 页面 | 说明 |
|------|------|------|
| `/stack/chat` | ChatPage | 主聊天页面（按住说话） |
| `/stack/chat/voice-call` | VoiceCallPage | 语音通话模式（全屏，无返回按钮） |
| `/stack/chat/history` | ChatHistoryPage | 聊天历史 |
| `/stack/chat/mute-settings` | MuteSettingsPage | 静音设置 |

---

## 流程七：查看我的家庭组

### 入口

```
/main/me (MePage) — "我的"页面
  └── 菜单: "家庭组" → /stack/family-groups
```

### 家庭组列表页

```
/stack/family-groups (FamilyGroupPage)
  ├── 展示所有家庭组卡片（以儿童信息为维度）
  │    ├── 儿童头像 + 家庭组名称 + 成员数量
  │    └── 点击 → /stack/family-groups/detail?groupId=xxx
  └── 空状态: 提示添加第一个设备 → /stack/add-virtual-device
```

### 家庭组详情页

```
/stack/family-groups/detail (DetailPage)
  ├── 儿童信息头卡（头像+姓名+性别/年龄+设备名）
  │    └── 点击儿童卡片 → 编辑儿童信息
  │
  ├── 成员列表
  │    ├── 成人卡片 → /stack/family-groups/member?memberId=xxx
  │    │    ├── 查看成员详情（头像、昵称、角色、性别、生日、加入时间、声纹）
  │    │    ├── 声纹点击 → /stack/settings/voiceprint/detail/:personId
  │    │    └── 创建者可移除成员 (DELETE /family-groups/:id/members/:memberId)
  │    │
  │    └── 儿童卡片 → /stack/family-groups/child-edit?childId=xxx
  │
  └── "邀请成员"按钮 [仅创建者可见]
       └── /stack/family-groups/invite?groupId=xxx
            ├── 展示邀请二维码
            ├── 生成/刷新邀请码 (POST /family-groups/:id/invite)
            └── 倒计时显示（邀请码有效期）
```

### 家庭组数据模型

```typescript
interface FamilyGroup {
  id: string;
  name: string;            // 如 "小新的家庭组"
  childName: string;
  deviceId: string;        // 关联的虚拟设备 ID
  creatorId: string;
  createdAt: string;
  inviteCode?: InviteCode;
  members: FamilyMember[];
}

interface FamilyMember {
  id: string;
  memberType: 'user' | 'child';
  userId?: string;
  nickname?: string;
  avatar?: string;
  role?: FamilyMemberRole; // father|mother|grandpa|...|child
  gender?: string;
  birthday?: string;
  hasVoiceprint?: boolean;
  voiceprintPersonId?: string;
  childInfo?: ChildInfo;
  deviceId?: string;
  isCreator: boolean;
  joinedAt: string;
}
```

### 核心约束

- 每个家庭组最多 **10 个成员**（`MAX_FAMILY_MEMBERS = 10`）
- 一个儿童 + 一台虚拟乐宝设备 = 一个家庭组
- 创建者可邀请成员、移除成员
- 邀请码有有效期和使用次数限制

---

## 流程八：继续添加乐宝 / 删除设备

### 添加更多虚拟设备

```
入口1: /main/home → 点击设备切换图标 → DeviceSwitchPanel → "添加设备"
入口2: /main/me → "家庭组" → 空状态 → "添加第一个设备"
入口3: /stack/devices → "添加虚拟设备"按钮

→ /stack/add-virtual-device (同流程四)
```

### 设备管理页

```
/stack/devices (DevicesPage)
  ├── 虚拟设备列表
  │    ├── 设备名称 + 序列号
  │    ├── 解绑按钮 (POST /devices/unbind)
  │    └── 点击 → /stack/device-config (设备配置)
  │
  ├── 最多5个虚拟设备限制提示
  └── "添加虚拟设备"按钮 [未达上限时可用]
```

### 设备配置 & 删除

```
/stack/device-config (DeviceConfigPage)
  ├── 语音风格 → /stack/device-config/voice
  ├── 语言 → /stack/device-config/language
  ├── 个性调节 → /stack/device-config/personality
  ├── [物理设备专属] WiFi管理 / 固件升级 / 关于本设备 [当前隐藏]
  └── "解除绑定"按钮 [红色危险按钮]
       ├── 虚拟设备: POST /devices/unbind → 删除设备 → 回首页
       └── 物理设备: 调用 logoutAccount()
```

### 首页设备切换

```
/main/home → 点击设备切换图标
  └── DeviceSwitchPanel (弹窗)
       ├── 当前设备列表（可切换 currentDevice）
       └── "添加设备" → /stack/add-virtual-device
```

---

## 完整用户旅程图

```
注册登录 → 完善个人信息 → 注册完成引导
                              │
                 ┌────────────┴────────────┐
                 │                         │
          添加虚拟乐宝               扫码加入家庭组
          (5步引导流程)               (TODO)
                 │
                 ├── 填写儿童信息
                 ├── 激活虚拟设备
                 ├── [可选] 录制声纹
                 ├── [可选] AI个性调节
                 └── 完成 → 进入聊天/回首页
                      │
                      ▼
              ┌─── 主页 (HomePage) ───┐
              │                       │
         点击乐宝形象            点击设备切换
              │                       │
              ▼                       ▼
         聊天页面              切换/添加设备
         (ChatPage)                  │
              │                ┌─────┴──────┐
         WebSocket            │            │
         实时语音聊天     切换设备      添加新设备
                              │            │
                              ▼            ▼
                         切换context   5步引导流程
                                        │
              ┌─── "我的"页面 ──────────┤
              │                         │
         个人资料                  家庭组管理
         (ProfilePage)           (FamilyGroupPage)
              │                         │
         编辑/修改              ┌───────┴───────┐
         头像/昵称/密码    家庭组详情        添加设备
         /手机号              │
                        ┌────┼────┐
                        │    │    │
                     编辑儿童  查看成员  邀请成员
                     信息      详情     (二维码)
                              │
                          声纹详情
                          /新增声纹
```

---

## 实体关系图

```
┌──────────┐     1:N     ┌──────────────┐     1:1     ┌──────────────┐
│   用户    │────────────│   虚拟设备    │────────────│   家庭组      │
│  (User)   │            │ (VirtualDev)  │            │ (FamilyGroup)│
└──────────┘            └──────────────┘            └──────┬───────┘
     │                        │                             │
     │                        │ config                      │ 1:N
     │                        ├── voiceStyle                │
     │                        └── aiPersonality       ┌─────┴──────┐
     │                              │                  │            │
     │                        ┌─────┴──────┐     ┌────┴───┐  ┌─────┴────┐
     │                        │enabled     │     │ 儿童成员 │  │ 成人成员  │
     │                        │traits      │     │(Child)  │  │(User)    │
     │                        │goals       │     └─────────┘  └──────────┘
     │                        └────────────┘                     │
     │                                                           │
     │                      ┌──────────────┐                     │
     │                      │    声纹       │◄────────────────────┘
     │                      │ (Voiceprint) │   (voiceprintPersonId)
     │                      └──────────────┘
     │
     │    1:N
     └──────────────────► 声纹人员 (Person)
                          ├── person_id
                          ├── name
                          ├── relationship
                          └── voices[]
                               ├── voice_id
                               └── feature_vector
```

---

## Store 依赖关系

```
authStore (accessToken)
    │
    ├──► profileStore (用户资料)
    │
    ├──► deviceStore (设备列表 + 当前设备)
    │      ├── devices: DeviceInfo[]
    │      ├── currentDevice: DeviceInfo
    │      └── virtualDevices: Computed<DeviceInfo[]>
    │
    ├──► familyGroupStore (家庭组列表 + 当前家庭组)
    │      ├── groups: FamilyGroup[]
    │      ├── currentGroupId: string
    │      ├── currentMembers: Computed<FamilyMember[]>
    │      └── currentChild: Computed<FamilyMember>
    │
    └──► chatStore (对话 ID)
           └── conversationId: string
```

> **注意**: 所有 Store 均启用了 `persist: true`（Pinia 持久化插件），数据自动持久化到 localStorage。

---

## 关键常量与限制

| 常量 | 值 | 说明 |
|------|------|------|
| `MAX_VIRTUAL_DEVICES` | 5 | 每用户最大虚拟设备数 |
| `MAX_FAMILY_MEMBERS` | 10 | 每家庭组最大成员数 |
| `SEND_CODE_COOLDOWN_INTERVAL` | 60000ms | 验证码发送冷却时间 |
| `waitingResponseTimeoutMs` | 30000ms | 聊天等待响应超时 |
| `cancelCooldownMs` | 300ms | 取消操作冷却时间 |
| `consecutiveSilentCount` | 6 (× 500ms = 3s) | 静音检测触发阈值 |
| `chunkDurationMs` | 200ms | 音频流式发送间隔 |
