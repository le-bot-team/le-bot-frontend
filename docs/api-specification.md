# Le Bot 后端 API 接口规范

> 本文档为前后端分离开发提供完整的 API 接口约定。Mock 模式和真实后端模式共享同一套接口契约。

---

## 通用约定

### Base URL

| 环境     | HTTP Base URL                                   | WebSocket Base URL                     |
| -------- | ----------------------------------------------- | -------------------------------------- |
| 本地开发 | `http://localhost:3000/api/v1`                  | `ws://localhost:3000`                  |
| 生产环境 | `https://cafuuchino.studio26f.org:10543/api/v1` | `wss://cafuuchino.studio26f.org:10543` |

### 通用响应格式

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": { ... }
}
```

**失败响应 (HTTP 4xx/5xx):**

```json
{
  "success": false,
  "message": "错误描述信息"
}
```

### 认证

除认证模块自身接口外，所有接口需要在 HTTP Header 中携带：

```
x-access-token: <accessToken>
```

### Content-Type

- 请求: `application/json`
- 响应: `application/json`

---

## 1. 认证模块 (Auth)

### 1.1 发送邮箱验证码

```
POST /api/v1/auth/email/challenge
```

**请求体:**

```json
{
  "email": "user@example.com"
}
```

**成功响应 (HTTP 200):**

```json
{
  "success": true
}
```

**失败响应:**

```json
{
  "success": false,
  "message": "发送频率过高，请稍后再试"
}
```

---

### 1.2 邮箱验证码登录/注册

```
POST /api/v1/auth/email/code
```

**请求体:**

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "isNew": true,
    "noPassword": true
  }
}
```

| 字段        | 类型    | 说明                     |
| ----------- | ------- | ------------------------ |
| accessToken | string  | 访问令牌，后续请求需携带 |
| isNew       | boolean | 是否为新注册用户         |
| noPassword  | boolean | 是否未设置密码           |

**失败响应:**

```json
{
  "success": false,
  "message": "验证码错误或已过期"
}
```

---

### 1.3 邮箱密码登录

```
POST /api/v1/auth/email/password
```

**请求体:**

```json
{
  "email": "user@example.com",
  "password": "userPassword123"
}
```

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "isNew": false,
    "noPassword": false
  }
}
```

**失败响应:**

```json
{
  "success": false,
  "message": "邮箱或密码错误"
}
```

---

### 1.4 重置密码

```
POST /api/v1/auth/email/reset
```

**请求体:**

```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newPassword123"
}
```

**成功响应 (HTTP 200):**

```json
{
  "success": true
}
```

**失败响应:**

```json
{
  "success": false,
  "message": "验证码错误或已过期"
}
```

---

### 1.5 验证 Access Token

```
GET /api/v1/auth/validate
```

**请求头:**

```
x-access-token: <accessToken>
```

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "message": "Token is valid"
}
```

**失败响应 (HTTP 401):**

```json
{
  "success": false,
  "message": "Token无效或已过期"
}
```

---

## 2. 设备模块 (Device)

### 2.1 获取我的设备列表

```
GET /api/v1/devices/mine
```

**请求头:**

```
x-access-token: <accessToken>
```

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "identifier": "device-001",
        "ownerId": 1,
        "type": "robot",
        "model": "leBot-v1",
        "name": "我的乐宝",
        "status": {},
        "config": {
          "voiceStyle": "xiaole"
        },
        "boundPhysicalDeviceId": null
      }
    ]
  }
}
```

**DeviceInfo 字段说明:**

| 字段                  | 类型                           | 说明              |
| --------------------- | ------------------------------ | ----------------- |
| id                    | string (UUID)                  | 设备唯一标识      |
| createdAt             | string \| null                 | 创建时间 ISO 8601 |
| updatedAt             | string \| null                 | 更新时间 ISO 8601 |
| identifier            | string                         | 设备标识符        |
| ownerId               | number                         | 所属用户 ID       |
| type                  | "robot" \| "virtual"           | 设备类型          |
| model                 | string                         | 设备型号          |
| name                  | string \| null                 | 设备自定义名称    |
| status                | unknown                        | 设备状态（预留）  |
| config                | { voiceStyle: string } \| null | 设备配置          |
| boundPhysicalDeviceId | string \| null                 | 绑定的物理设备ID  |

---

### 2.2 激活虚拟设备

```
POST /api/v1/devices/virtual/activate
```

**请求头:**

```
x-access-token: <accessToken>
```

**请求体:** 空 `{}`

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "device": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null,
      "identifier": "virtual-001",
      "ownerId": 1,
      "type": "virtual",
      "model": "virtual-device",
      "name": null,
      "status": {},
      "config": null,
      "boundPhysicalDeviceId": null
    }
  }
}
```

**失败响应:**

```json
{
  "success": false,
  "message": "虚拟设备数量已达上限"
}
```

---

### 2.3 解绑/删除设备

```
DELETE /api/v1/devices/:deviceId
```

**请求头:**

```
x-access-token: <accessToken>
```

**路径参数:**

| 参数     | 类型          | 说明    |
| -------- | ------------- | ------- |
| deviceId | string (UUID) | 设备 ID |

**成功响应 (HTTP 200):**

```json
{
  "success": true
}
```

---

## 3. 个人资料模块 (Profile)

### 3.1 获取头像

```
GET /api/v1/profiles/avatar
```

**请求头:**

```
x-access-token: <accessToken>
```

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "avatar": "data:image/png;base64,iVBORw0KGgo...",
    "avatarHash": "a1b2c3d4e5f6..."
  }
}
```

---

### 3.2 获取个人资料

```
GET /api/v1/profiles/info
```

**请求头:**

```
x-access-token: <accessToken>
```

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-15T00:00:00.000Z",
    "nickname": "用户昵称",
    "bio": "个人简介",
    "avatar": "data:image/png;base64,...",
    "avatarHash": "a1b2c3d4",
    "region": "中国",
    "last_active": "2024-01-15T12:00:00.000Z",
    "last_login": "2024-01-15T08:00:00.000Z"
  }
}
```

**UserProfile 字段说明:**

| 字段         | 类型              | 说明              |
| ------------ | ----------------- | ----------------- |
| id           | string            | 用户 ID           |
| created_at   | string (ISO 8601) | 注册时间          |
| updated_at   | string (ISO 8601) | 最后更新时间      |
| nickname     | string?           | 昵称              |
| bio          | string?           | 个人简介          |
| avatar       | string?           | 头像 Base64       |
| avatarHash   | string?           | 头像哈希值        |
| region       | string?           | 地区              |
| birthday     | string?           | 生日 (YYYY-MM-DD) |
| relationship | string?           | 与孩子的关系      |
| last_active  | string (ISO 8601) | 最后活跃时间      |
| last_login   | string (ISO 8601) | 最后登录时间      |

### 3.3 登录认证完整流程

```text
入口页 (邮箱输入)
├── 验证码模式
│   ├── POST /auth/email/challenge  发送验证码到邮箱
│   └── POST /auth/email/code        验证码登录/注册
└── 密码模式
    └── POST /auth/email/password    密码登录

POST /auth/email/code 或 /auth/email/password 返回 AuthResponse:
├── isNew=true  → 新用户 → 进入密码设置页
├── isNew=false, noPassword=true → 已注册但无密码 → 进入密码设置页
└── isNew=false, noPassword=false → 登录成功 → 直接完成

密码设置页 (仅 isNew 或 noPassword 时进入)
├── POST /auth/email/challenge  重新发送验证码
├── POST /auth/email/reset       用验证码设置新密码
└── 成功后自动调用 POST /auth/email/password 完成登录

完善个人信息页 (仅新用户 isNew=true 时进入)
├── PUT /api/v1/profiles/info    提交昵称/生日/关系/头像
└── 用户可跳过，直接进入完成页

完成页 - 3秒后自动跳转到主页
```

**AuthResponse 决策逻辑:**

| isNew | noPassword | 含义                   | 下一步                |
| ----- | ---------- | ---------------------- | --------------------- |
| true  | true       | 新注册用户，未设置密码 | 密码设置页 - 完善信息 |
| false | true       | 已有账号但从未设置密码 | 密码设置页            |
| false | false      | 正常登录用户           | 直接完成              |

---

### 3.4 更新个人资料

```
PUT /api/v1/profiles/info
```

**请求头:**

```
x-access-token: <accessToken>
```

**请求体 (所有字段可选):**

```json
{
  "nickname": "新昵称",
  "bio": "新的个人简介",
  "avatar": "data:image/png;base64,...",
  "region": "北京",
  "birthday": "2020-01-15",
  "relationship": "owner"
}
```

| 字段         | 类型    | 必填 | 说明                                          |
| ------------ | ------- | ---- | --------------------------------------------- |
| nickname     | string? | 否   | 用户昵称                                      |
| bio          | string? | 否   | 个人简介                                      |
| avatar       | string? | 否   | 头像 Base64 数据                              |
| region       | string? | 否   | 地区                                          |
| birthday     | string? | 否   | 生日，ISO 8601 日期格式 (YYYY-MM-DD)          |
| relationship | string? | 否   | 与孩子的关系，可选值见第6节 vpr-relationships |

**成功响应 (HTTP 200):**

```json
{
  "success": true
}
```

---

## 4. 声纹模块 (Voiceprint)

### 4.1 声纹识别

```
POST /api/v1/voiceprint/recognize
```

**请求头:**

```
x-access-token: <accessToken>
```

**请求体:**

```json
{
  "audio": "<base64 encoded audio data>"
}
```

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "person_id": "person-uuid-001",
    "voice_id": "voice-uuid-001",
    "confidence": 0.95,
    "similarity": 0.92,
    "processing_time_ms": 150,
    "details": [],
    "name": "张三",
    "age": 30,
    "address": "北京",
    "relationship": "owner",
    "metadata": {}
  }
}
```

**RecognitionData 字段说明:**

| 字段               | 类型     | 说明            |
| ------------------ | -------- | --------------- |
| person_id          | string   | 识别到的人物 ID |
| voice_id           | string   | 识别到的声音 ID |
| confidence         | number   | 置信度 (0-1)    |
| similarity         | number   | 相似度 (0-1)    |
| processing_time_ms | number   | 处理耗时(毫秒)  |
| details            | object[] | 详细匹配信息    |
| name               | string?  | 人物名称        |
| age                | number?  | 年龄            |
| address            | string?  | 地址            |
| relationship       | string   | 关系            |
| metadata           | object?  | 扩展元数据      |

---

### 4.2 注册声纹

```
POST /api/v1/voiceprint/register
```

**请求头:**

```
x-access-token: <accessToken>
```

**请求体:**

```json
{
  "audio": "<base64 encoded audio data>",
  "name": "张三",
  "age": 30,
  "relationship": "owner",
  "address": "北京",
  "isTemporal": false
}
```

| 字段         | 类型    | 必填 | 说明                       |
| ------------ | ------- | ---- | -------------------------- |
| audio        | string  | 是   | Base64 编码的音频数据      |
| name         | string  | 是   | 人物名称                   |
| age          | number  | 是   | 年龄                       |
| relationship | string  | 是   | 关系类型                   |
| address      | string? | 否   | 地址                       |
| isTemporal   | boolean | 否   | 是否为临时声纹，默认 false |

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "person_id": "person-uuid-001",
    "person_name": "张三",
    "voice_id": "voice-uuid-001",
    "voice_count": 1,
    "registration_time": "2024-01-15T12:00:00.000Z"
  }
}
```

---

### 4.3 获取声纹人物列表

```
GET /api/v1/voiceprint/persons
```

**请求头:**

```
x-access-token: <accessToken>
```

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": [
    {
      "person_id": "person-uuid-001",
      "voice_count": 3,
      "is_temporal": false,
      "expire_date": null,
      "name": "张三",
      "age": 30,
      "address": "北京",
      "relationship": "owner",
      "metadata": {}
    }
  ]
}
```

**Person 字段说明:**

| 字段         | 类型    | 说明                 |
| ------------ | ------- | -------------------- |
| person_id    | string  | 人物唯一标识         |
| voice_count  | number  | 声音数量             |
| is_temporal  | boolean | 是否为临时声纹       |
| expire_date  | string? | 过期时间（临时声纹） |
| name         | string? | 名称                 |
| age          | number? | 年龄                 |
| address      | string? | 地址                 |
| relationship | string  | 关系类型             |
| metadata     | object? | 扩展元数据           |

---

### 4.4 获取单个人物详情

```
GET /api/v1/voiceprint/persons/:personId
```

**请求头:**

```
x-access-token: <accessToken>
```

**路径参数:**

| 参数     | 类型   | 说明    |
| -------- | ------ | ------- |
| personId | string | 人物 ID |

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "person_id": "person-uuid-001",
    "voice_count": 2,
    "is_temporal": false,
    "name": "张三",
    "age": 30,
    "address": "北京",
    "relationship": "owner",
    "voices": [
      {
        "voice_id": "voice-uuid-001",
        "feature_vector": [0.1, 0.2, 0.3],
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 4.5 更新人物信息

```
PUT /api/v1/voiceprint/persons/:personId
```

**请求头:**

```
x-access-token: <accessToken>
```

**请求体 (所有字段可选):**

```json
{
  "name": "新名称",
  "relationship": "family",
  "isTemporal": true
}
```

**成功响应 (HTTP 200):**

```json
{
  "success": true
}
```

---

### 4.6 删除人物

```
DELETE /api/v1/voiceprint/persons/:personId
```

**请求头:**

```
x-access-token: <accessToken>
```

**成功响应 (HTTP 200):**

```json
{
  "success": true
}
```

---

### 4.7 为人物添加声音

```
POST /api/v1/voiceprint/persons/:personId/voices/add
```

**请求头:**

```
x-access-token: <accessToken>
```

**请求体:**

```json
{
  "audio": "<base64 encoded audio data>"
}
```

**成功响应 (HTTP 200):**

```json
{
  "success": true
}
```

---

### 4.8 更新声音

```
PUT /api/v1/voiceprint/persons/:personId/voices/:voiceId
```

**请求头:**

```
x-access-token: <accessToken>
```

**请求体:**

```json
{
  "audio": "<base64 encoded audio data>"
}
```

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "person_id": "person-uuid-001",
    "voice_id": "voice-uuid-001",
    "voice_count": 3
  }
}
```

---

### 4.9 删除声音

```
DELETE /api/v1/voiceprint/persons/:personId/voices/:voiceId
```

**请求头:**

```
x-access-token: <accessToken>
```

**成功响应 (HTTP 200):**

```json
{
  "success": true
}
```

---

## 5. WebSocket 聊天协议

### 5.1 连接 URL

```
ws://{host}/api/v1/chat/ws?token={accessToken}[&deviceId={deviceId}]
```

| 参数     | 类型   | 必填 | 说明             |
| -------- | ------ | ---- | ---------------- |
| token    | string | 是   | 用户 accessToken |
| deviceId | string | 否   | 虚拟设备 ID      |

### 5.2 通用消息格式

所有 WebSocket 消息均为 JSON 格式：

**请求格式:**

```json
{
  "id": "message-uuid",
  "action": "actionName",
  "data": { ... }
}
```

**响应格式:**

```json
{
  "id": "message-uuid",
  "action": "actionName",
  "success": true,
  "data": { ... }
}
```

### 5.3 Action 列表

#### Client → Server

| Action               | 说明             | Data 字段                                                                                            |
| -------------------- | ---------------- | ---------------------------------------------------------------------------------------------------- |
| `updateConfig`       | 更新会话配置     | `conversationId?`, `outputText?`, `timezone?`, `voiceId?`, `speechRate?`, `sampleRate?`, `location?` |
| `inputAudioStream`   | 流式发送音频数据 | `buffer`: Base64 编码 PCM 音频                                                                       |
| `inputAudioComplete` | 音频发送完成     | `buffer`: 最后一块音频数据                                                                           |
| `cancelOutput`       | 取消当前输出     | `cancelType`: "manual" \| "voice"                                                                    |
| `clearContext`       | 清除对话上下文   | 无                                                                                                   |

#### Server → Client

| Action                | 说明         | Data 字段                                                         |
| --------------------- | ------------ | ----------------------------------------------------------------- |
| `establishConnection` | 连接建立确认 | -                                                                 |
| `updateConfig`        | 配置更新确认 | `conversationId`                                                  |
| `outputAudioStream`   | 流式音频响应 | `chatId`, `conversationId`, `buffer`: Base64 PCM 音频             |
| `outputAudioComplete` | 音频响应完成 | `chatId`, `conversationId`                                        |
| `outputTextStream`    | 流式文本响应 | `chatId`, `conversationId`, `role`: "assistant" \| "user", `text` |
| `outputTextComplete`  | 文本响应完成 | 同 outputTextStream                                               |
| `chatComplete`        | 会话轮次完成 | `chatId`, `conversationId`, `createdAt`, `completedAt`            |
| `cancelOutput`        | 输出已取消   | `cancelType`: "manual" \| "voice"                                 |

### 5.4 完整消息类型定义

详见 `src/types/websocket/types.ts` 中的 TypeScript 类型定义。

---

## 6. vpr-relationships 关系类型

声纹系统中 `relationship` 字段使用以下枚举值：

```typescript
export const VPR_RELATIONSHIPS = ['owner', 'family', 'friend', 'colleague', 'other'] as const;
```
