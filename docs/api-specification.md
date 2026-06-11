# Le Bot 后端 API 接口规范

> 本文档为前后端分离开发提供完整的 API 接口约定。Mock 模式和真实后端模式共享同一套接口契约。
>
> **最后更新**: 2026-05-13 — 基于前端源码 `src/utils/api/` 及 `src/types/api/` 全量梳理

---

## 通用约定

### Base URL

| 环境     | HTTP Base URL                                   | WebSocket Base URL                     |
| -------- | ----------------------------------------------- | -------------------------------------- |
| 本地开发 | `${LE_BOT_BACKEND_HTTP_BASE_URL}/api/v1`        | `${LE_BOT_BACKEND_WS_BASE_URL}`        |
| 生产环境 | `https://cafuuchino.studio26f.org:10543/api/v1` | `wss://cafuuchino.studio26f.org:10543` |

> 前端 Axios 实例 baseURL 由环境变量 `LE_BOT_BACKEND_HTTP_BASE_URL` 拼接 `/api/v1`。

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

**源码**: `src/utils/api/auth.ts` / `src/types/api/auth.ts`

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

### 1.6 登录认证完整流程

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

完善个人信息页 (仅新用户 isNew=true 时进入，不可跳过)
├── PUT /api/v1/profiles/info    提交昵称/生日/关系/头像
└── 完成后进入引导选择页

引导选择页 (onboarding-complete)
├── 添加虚拟设备 (添加乐宝)
│   ├── Step 1: 填写儿童信息 (性别/姓名/生日，必填)
│   ├── Step 2: POST /devices/virtual/activate  激活虚拟设备
│   ├── Step 3: POST /voiceprint/register  声纹录入 (必须，不可跳过)
│   ├── Step 4: AI 人格设置 (可跳过)
│   └── Step 5: 完成 → 进入聊天或主页
└── 扫码加入已有家庭组 (待实现)

完成页 - 3秒后自动跳转到主页
```

**AuthResponse 决策逻辑:**

| isNew | noPassword | 含义                   | 下一步                |
| ----- | ---------- | ---------------------- | --------------------- |
| true  | true       | 新注册用户，未设置密码 | 密码设置页 - 完善信息 |
| false | true       | 已有账号但从未设置密码 | 密码设置页            |
| false | false      | 正常登录用户           | 直接完成              |

---

## 2. 设备模块 (Device)

**源码**: `src/utils/api/device.ts` / `src/types/api/device.ts` / `src/stores/device/types.ts`

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
        "ownerId": "1",
        "type": "robot",
        "model": "leBot-v1",
        "name": "我的乐宝",
        "status": {},
        "config": {
          "voiceStyle": "xiaole",
          "aiPersonality": {
            "enabled": true,
            "traits": "friendly,curious",
            "goals": "help child learn"
          }
        },
        "boundPhysicalDeviceId": null,
        "agentId": null,
        "xiaozhiDeviceId": null,
        "childInfo": {
          "name": "小明",
          "gender": "boy",
          "birthday": "2020-01-15"
        }
      }
    ]
  }
}
```

**DeviceInfo 字段说明:**

| 字段                  | 类型                           | 说明                     |
| --------------------- | ------------------------------ | ------------------------ |
| id                    | string (UUID)                  | 设备唯一标识             |
| createdAt             | string \| null                 | 创建时间 ISO 8601        |
| updatedAt             | string \| null                 | 更新时间 ISO 8601        |
| identifier            | string                         | 设备标识符               |
| ownerId               | string                         | 所属用户 ID              |
| type                  | "robot" \| "virtual"           | 设备类型                 |
| model                 | string                         | 设备型号                 |
| name                  | string \| null                 | 设备自定义名称           |
| status                | unknown                        | 设备状态（预留）         |
| config                | object \| null                 | 设备配置（见下表）       |
| boundPhysicalDeviceId | string \| null                 | 绑定的物理设备 ID        |
| agentId               | string \| null                 | AI Agent ID              |
| xiaozhiDeviceId       | string \| null                 | 小智设备 ID              |
| childInfo             | ChildInfo \| null              | 关联儿童信息             |

**config 字段说明:**

| 字段          | 类型     | 说明                   |
| ------------- | -------- | ---------------------- |
| voiceStyle    | string   | 语音风格               |
| aiPersonality | object?  | AI 人格配置            |

**aiPersonality 字段说明:**

| 字段    | 类型     | 说明         |
| ------- | -------- | ------------ |
| enabled | boolean  | 是否启用     |
| traits  | string?  | 性格特征     |
| goals   | string?  | 目标         |

**ChildInfo 字段说明:**

| 字段     | 类型             | 说明          |
| -------- | ---------------- | ------------- |
| name     | string           | 儿童姓名      |
| gender   | "boy" \| "girl"  | 性别          |
| birthday | string           | 生日 YYYY-MM-DD |

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
      "ownerId": "1",
      "type": "virtual",
      "model": "virtual-device",
      "name": null,
      "status": {},
      "config": null,
      "boundPhysicalDeviceId": null,
      "agentId": null,
      "xiaozhiDeviceId": null,
      "childInfo": null
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

### 2.3 绑定物理设备

```
POST /api/v1/devices/bind
```

**请求头:**

```
x-access-token: <accessToken>
```

**请求体:**

```json
{
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "board": "v2",
  "appVersion": "1.0.0",
  "name": "客厅乐宝"
}
```

| 字段       | 类型    | 必填 | 说明          |
| ---------- | ------- | ---- | ------------- |
| macAddress | string  | 是   | 设备 MAC 地址 |
| board      | string? | 否   | 主板版本      |
| appVersion | string? | 否   | APP 版本      |
| name       | string? | 否   | 设备名称      |

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "device": { ... }
  }
}
```

> `device` 结构同 [DeviceInfo](#21-获取我的设备列表)

**失败响应:**

```json
{
  "success": false,
  "message": "设备已被其他用户绑定"
}
```

---

### 2.4 解绑/删除设备

```
POST /api/v1/devices/unbind
```

**请求头:**

```
x-access-token: <accessToken>
```

**请求体:**

```json
{
  "deviceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

| 字段     | 类型          | 必填 | 说明    |
| -------- | ------------- | ---- | ------- |
| deviceId | string (UUID) | 是   | 设备 ID |

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
  "message": "设备不存在或不属于当前用户"
}
```

> ⚠️ 注意: 前端当前使用 `POST /devices/unbind`（请求体传 deviceId），而非 REST 风格的 `DELETE /devices/:deviceId`。

---

## 3. 个人资料模块 (Profile)

**源码**: `src/utils/api/profile.ts` / `src/types/api/profile.ts` / `src/stores/profile/types.ts`

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
    "birthday": "2020-01-15",
    "phone": "138****1234",
    "relationship": "owner",
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
| phone        | string?           | 手机号            |
| relationship | string?           | 与孩子的关系      |
| role         | FamilyUserRole?   | 家庭角色 (father\|mother\|grandpa\|...) |
| gender       | 'male'\|'female'? | 性别              |
| last_active  | string (ISO 8601) | 最后活跃时间      |
| last_login   | string (ISO 8601) | 最后登录时间      |

---

### 3.3 更新个人资料

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

| 字段         | 类型    | 必填 | 说明                                 |
| ------------ | ------- | ---- | ------------------------------------ |
| nickname     | string? | 否   | 用户昵称                             |
| bio          | string? | 否   | 个人简介                             |
| avatar       | string? | 否   | 头像 Base64 数据                     |
| region       | string? | 否   | 地区                                 |
| birthday     | string? | 否   | 生日，ISO 8601 日期格式 (YYYY-MM-DD) |
| relationship | string? | 否   | 与孩子的关系                         |

**成功响应 (HTTP 200):**

```json
{
  "success": true
}
```

---

### 3.4 修改密码

```
POST /api/v1/profiles/password
```

**请求头:**

```
x-access-token: <accessToken>
```

**请求体:**

```json
{
  "oldPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

| 字段        | 类型   | 必填 | 说明     |
| ----------- | ------ | ---- | -------- |
| oldPassword | string | 是   | 旧密码   |
| newPassword | string | 是   | 新密码   |

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
  "message": "旧密码错误",
  "code": "wrongOldPassword"
}
```

**错误码说明:**

| code               | 说明           |
| ------------------ | -------------- |
| wrongOldPassword   | 旧密码错误     |
| passwordMismatch   | 密码不匹配     |
| invalidPassword    | 密码格式不合法 |

---

### 3.5 注销账户

```
POST /api/v1/profiles/deactivate
```

**请求头:**

```
x-access-token: <accessToken>
```

**请求体:** 空 `{}`

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
  "message": "注销失败，请稍后重试"
}
```

---

### 3.6 发送手机验证码

```
POST /api/v1/profiles/phone/challenge
```

**请求头:**

```
x-access-token: <accessToken>
```

**请求体:**

```json
{
  "phone": "13812341234"
}
```

| 字段  | 类型   | 必填 | 说明   |
| ----- | ------ | ---- | ------ |
| phone | string | 是   | 手机号 |

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

### 3.7 验证手机验证码

```
POST /api/v1/profiles/phone/verify
```

**请求头:**

```
x-access-token: <accessToken>
```

**请求体:**

```json
{
  "phone": "13812341234",
  "code": "123456"
}
```

| 字段  | 类型   | 必填 | 说明       |
| ----- | ------ | ---- | ---------- |
| phone | string | 是   | 手机号     |
| code  | string | 是   | 短信验证码 |

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

### 3.8 绑定/更换手机号

```
POST /api/v1/profiles/phone
```

**请求头:**

```
x-access-token: <accessToken>
```

**请求体:**

```json
{
  "phone": "13812341234",
  "code": "123456"
}
```

| 字段  | 类型   | 必填 | 说明           |
| ----- | ------ | ---- | -------------- |
| phone | string | 是   | 新手机号       |
| code  | string | 是   | 短信验证码     |

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

## 4. 声纹模块 (Voiceprint)

**源码**: `src/utils/api/voiceprint.ts` / `src/types/api/voiceprint.ts`

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
    "metadata": {},
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

**PersonDetail 字段说明:** 继承 Person，额外包含:

| 字段   | 类型     | 说明         |
| ------ | -------- | ------------ |
| voices | Voice[]  | 声音列表     |

**Voice 字段说明:**

| 字段           | 类型     | 说明              |
| -------------- | -------- | ----------------- |
| voice_id       | string   | 声音唯一标识      |
| feature_vector | number[] | 特征向量          |
| created_at     | string   | 创建时间 ISO 8601 |

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

| 字段         | 类型    | 必填 | 说明             |
| ------------ | ------- | ---- | ---------------- |
| name         | string? | 否   | 人物名称         |
| relationship | string? | 否   | 关系类型         |
| isTemporal   | boolean? | 否  | 是否为临时声纹   |

> **注意**: 前端在声纹详情页 (DetailPage) 编辑人物信息时，会自动设置 `isTemporal: false`，即将临时声纹转为永久声纹。

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

## 5. 家庭组模块 (Family Group)

**源码**: `src/utils/api/family-group.ts` / `src/types/api/family-group.ts` / `src/stores/family-group/types.ts`

> 核心模型：一个儿童 + 一台虚拟乐宝设备 = 一个家庭组。一个 APP 用户可同时属于多个家庭组（多孩场景）。

### 5.1 获取我的家庭组列表

```
GET /api/v1/family-groups/mine
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
    "groups": [
      {
        "id": "group-uuid-001",
        "name": "小明的家庭组",
        "childName": "小明",
        "deviceId": "device-uuid-001",
        "creatorId": "user-uuid-001",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "members": [ ... ],
        "inviteCode": { ... }
      }
    ]
  }
}
```

**FamilyGroup 字段说明:**

| 字段       | 类型          | 说明                                        |
| ---------- | ------------- | ------------------------------------------- |
| id         | string        | 家庭组唯一标识                              |
| name       | string        | 家庭组名称，格式: "{儿童名}的家庭组"        |
| childName  | string        | 关联的儿童姓名                              |
| deviceId   | string        | 关联的虚拟设备 ID（一对一）                 |
| creatorId  | string        | 创建者 userId                               |
| createdAt  | string        | 创建时间 ISO 8601                           |
| members    | FamilyMember[] | 成员列表（通常含 1 个 child + N 个 user）   |
| inviteCode | InviteCode?   | 当前有效的邀请码（如有）                    |

---

### 5.2 获取家庭组详情（含成员列表）

```
GET /api/v1/family-groups/:groupId
```

**请求头:**

```
x-access-token: <accessToken>
```

**路径参数:**

| 参数     | 类型   | 说明       |
| -------- | ------ | ---------- |
| groupId  | string | 家庭组 ID  |

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "group": { ... }
  }
}
```

> `group` 结构同 [FamilyGroup](#51-获取我的家庭组列表)

---

### 5.3 生成邀请码 + 二维码

```
POST /api/v1/family-groups/:groupId/invite
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
    "inviteCode": {
      "code": "ABC123",
      "groupId": "group-uuid-001",
      "groupName": "小明的家庭组",
      "inviterNickname": "张三",
      "inviterAvatar": "data:image/png;base64,...",
      "expiresAt": "2024-01-08T00:00:00.000Z",
      "qrImageUrl": "https://example.com/qr/abc123.png",
      "maxUses": 10,
      "usedCount": 2
    }
  }
}
```

**InviteCode 字段说明:**

| 字段            | 类型     | 说明                                |
| --------------- | -------- | ----------------------------------- |
| code            | string   | 邀请码                              |
| groupId         | string   | 所属家庭组 ID                       |
| groupName       | string   | 家庭组名称                          |
| inviterNickname | string   | 邀请人昵称                          |
| inviterAvatar   | string?  | 邀请人头像                          |
| expiresAt       | string   | 过期时间 ISO 8601                   |
| qrImageUrl      | string?  | 后端生成的 QR 图片 URL              |
| maxUses         | number   | 最大使用次数                        |
| usedCount       | number   | 已使用次数                          |

---

### 5.4 解析邀请码信息（扫码后预览）

```
GET /api/v1/family-groups/invite/:code
```

**请求头:**

```
x-access-token: <accessToken>  (可选，未登录也可查看)
```

**路径参数:**

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| code | string | 邀请码 |

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "groupId": "group-uuid-001",
    "groupName": "小明的家庭组",
    "childName": "小明",
    "inviterNickname": "张三",
    "inviterAvatar": "data:image/png;base64,...",
    "isValid": true,
    "expiresAt": "2024-01-08T00:00:00.000Z"
  }
}
```

| 字段            | 类型     | 说明               |
| --------------- | -------- | ------------------ |
| groupId         | string   | 家庭组 ID          |
| groupName       | string   | 家庭组名称         |
| childName       | string   | 儿童姓名           |
| inviterNickname | string   | 邀请人昵称         |
| inviterAvatar   | string?  | 邀请人头像         |
| isValid         | boolean  | 邀请码是否仍然有效 |
| expiresAt       | string   | 过期时间 ISO 8601  |

---

### 5.5 接受邀请加入家庭组

```
POST /api/v1/family-groups/join
```

**请求头:**

```
x-access-token: <accessToken>
```

**请求体:**

```json
{
  "code": "ABC123",
  "role": "father"
}
```

| 字段 | 类型              | 必填 | 说明                            |
| ---- | ----------------- | ---- | ------------------------------- |
| code | string            | 是   | 邀请码                          |
| role | FamilyUserRole    | 是   | 在家庭中的角色（见角色枚举）    |

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "group": { ... }
  }
}
```

> `group` 结构同 [FamilyGroup](#51-获取我的家庭组列表)

**失败响应:**

```json
{
  "success": false,
  "message": "邀请码无效或已过期"
}
```

---

### 5.6 移除成员 (Creator 操作)

```
DELETE /api/v1/family-groups/:groupId/members/:memberId
```

**请求头:**

```
x-access-token: <accessToken>
```

**路径参数:**

| 参数      | 类型   | 说明   |
| --------- | ------ | ------ |
| groupId   | string | 家庭组 ID |
| memberId  | string | 成员 ID  |

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
  "message": "仅创建者可移除成员"
}
```

---

### 5.7 主动退出家庭组 (Invitee 操作)

```
POST /api/v1/family-groups/:groupId/leave
```

**请求头:**

```
x-access-token: <accessToken>
```

**请求体:** 空 `{}`

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
  "message": "创建者不能退出家庭组"
}
```

---

### 5.8 更新儿童信息

```
PUT /api/v1/family-groups/:groupId/child
```

**请求头:**

```
x-access-token: <accessToken>
```

**请求体:**

```json
{
  "childInfo": {
    "name": "小明",
    "gender": "boy",
    "birthday": "2020-01-15"
  }
}
```

| 字段      | 类型     | 必填 | 说明                     |
| --------- | -------- | ---- | ------------------------ |
| childInfo | ChildInfo | 是  | 儿童信息（见 ChildInfo） |

**ChildInfo 字段说明:**

| 字段     | 类型            | 说明           |
| -------- | --------------- | -------------- |
| name     | string          | 儿童姓名       |
| gender   | "boy" \| "girl" | 性别           |
| birthday | string          | 生日 YYYY-MM-DD |

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "group": { ... }
  }
}
```

> `group` 结构同 [FamilyGroup](#51-获取我的家庭组列表)

---

### 5.9 FamilyMember 数据结构

**FamilyMember 字段说明:**

| 字段               | 类型             | 说明                                  |
| ------------------ | ---------------- | ------------------------------------- |
| id                 | string           | 成员唯一标识                          |
| memberType         | "user" \| "child"| 成员类型                              |
| userId             | string?          | APP 用户 ID (memberType==='user')     |
| nickname           | string?          | 显示名称                              |
| avatar             | string?          | 头像 URL                              |
| role               | FamilyUserRole?  | 家庭角色 (memberType==='user'时必填)  |
| gender             | "male"\|"female"?| 性别                                  |
| birthday           | string?          | 生日 ISO 8601                         |
| hasVoiceprint      | boolean?         | 是否已录入声纹                        |
| voiceprintPersonId | string?          | 声纹人物 ID                           |
| childInfo          | ChildInfo?       | 儿童信息 (memberType==='child')       |
| deviceId           | string?          | 关联虚拟设备 ID (memberType==='child')|
| isCreator          | boolean          | 是否为家庭组创建者                    |
| joinedAt           | string           | 加入时间 ISO 8601                     |

---

## 6. WebSocket 聊天协议

**源码**: `src/types/websocket/types.ts`

### 6.1 连接 URL

```
ws://{host}/api/v1/chat/ws?token={accessToken}&deviceId={deviceId}
```

| 参数     | 类型   | 必填 | 说明             |
| -------- | ------ | ---- | ---------------- |
| token    | string | 是   | 用户 accessToken |
| deviceId | string | 否   | 虚拟设备 ID      |

### 6.2 通用消息格式

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

**错误响应格式:**

```json
{
  "id": "message-uuid",
  "action": "actionName",
  "success": false,
  "message": "错误描述"
}
```

### 6.3 Action 列表

#### Client → Server

| Action               | 说明             | Data 字段                                                                                                            |
| -------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| `updateConfig`       | 更新会话配置     | `conversationId?`, `outputText?`, `timezone?`, `voiceId?`, `speechRate?`, `sampleRate?: {input?, output?}`, `location?: {latitude, longitude}` |
| `inputAudioStream`   | 流式发送音频数据 | `buffer`: Base64 编码 WAV/PCM 音频；电话式对话模式只在本地 RMS 门控检测到语音时上传，静音期间不持续上传 |
| `inputAudioComplete` | 音频发送完成     | `data.buffer?`: 可选最后一块音频数据；也可仅作为话轮结束事件发送空 data/空 buffer |
| `cancelOutput`       | 取消当前输出     | `cancelType`: "manual" \| "voice"                                                                                    |
| `clearContext`       | 清除对话上下文   | 无                                                                                                                   |

#### Server → Client

| Action                | 说明         | Data 字段                                                            |
| --------------------- | ------------ | -------------------------------------------------------------------- |
| `establishConnection` | 连接建立确认 | -                                                                    |
| `updateConfig`        | 配置更新确认 | `conversationId`                                                     |
| `outputAudioStream`   | 流式音频响应 | `chatId`, `conversationId`, `buffer`: Base64 PCM 音频                |
| `outputAudioComplete` | 音频响应完成 | `chatId`, `conversationId`                                           |
| `outputTextStream`    | 流式文本响应 | `chatId`, `conversationId`, `role`: "assistant" \| "user", `text`    |
| `outputTextComplete`  | 文本响应完成 | 同 outputTextStream                                                  |
| `chatComplete`        | 会话轮次完成 | `chatId`, `conversationId`, `createdAt`, `completedAt`               |
| `chatComplete`(错误)  | 会话轮次失败 | 同上 + `errors: [{code, message}]`                                   |
| `cancelOutput`        | 输出已取消   | `cancelType`: "manual" \| "voice"                                    |


### 6.4 电话式对话话轮边界

`VoiceCallPage` 使用 `phoneCall` 本地采集模式：页面保持麦克风采集和 RMS 检测，但静音期间只保留约 400ms 本地预卷缓存，不持续发送 `inputAudioStream`。检测到语音起点后，前端先发送预卷分片，再发送语音分片；检测到约 1s 连续静音或达到本地最大话轮时长后发送 `inputAudioComplete`。

后端 `VirtualDeviceProxy` 继续使用小智服务器 `manual listen` 模式，但不信任前端边界：只有服务端 RMS 判定为有效语音后才向上游发送 `listen:start`，并通过前端 `inputAudioComplete`、服务端连续静音、无输入 watchdog、最大话轮时长、取消/销毁清理等路径保证最终发送 `listen:stop`。TTS 播放期间收到用户有效语音时，后端发送上游 `abort` 并向前端发送 `cancelOutput`（`cancelType: "voice"`）。VPR 在后端基于完整话轮或足够长的语音窗口异步执行；短句不会阻塞对话，会先跳过单次识别并把有声窗口在会话内有界累积，直到总音频和实际有声时长都达到阈值才调用。识别失败后会短暂冷却，避免短噪声话轮反复触发声纹识别。

### 6.5 updateConfig 请求详细结构

```json
{
  "id": "uuid",
  "action": "updateConfig",
  "data": {
    "conversationId": "conv-uuid",
    "outputText": true,
    "timezone": "Asia/Shanghai",
    "voiceId": "xiaole",
    "speechRate": 1.0,
    "sampleRate": {
      "input": 48000,
      "output": 16000
    },
    "location": {
      "latitude": 39.9042,
      "longitude": 116.4074
    }
  }
}
```

---

## 7. 枚举值参考

### 7.1 声纹关系类型 (VprRelationship)

用于声纹模块的 `relationship` 字段：

```typescript
type VprRelationship = 'self' | 'family' | 'friend' | 'colleague' | 'other';
```

| 值         | 说明   |
| ---------- | ------ |
| self       | 自己   |
| family     | 家人   |
| friend     | 朋友   |
| colleague  | 同事   |
| other      | 其他   |

### 7.2 家庭成员角色 (FamilyUserRole)

用于家庭组模块的 `role` 字段（不含 child，child 用 memberType 区分）：

```typescript
type FamilyUserRole =
  | 'father'
  | 'mother'
  | 'grandpa'
  | 'grandma'
  | 'paternal_grandmother'
  | 'maternal_grandfather'
  | 'maternal_grandma'
  | 'friend'
  | 'other';
```

| 值                     | 说明     |
| ---------------------- | -------- |
| father                 | 爸爸     |
| mother                 | 妈妈     |
| grandpa                | 爷爷     |
| grandma                | 奶奶     |
| paternal_grandmother   | 外婆     |
| maternal_grandfather   | 外公     |
| maternal_grandma       | 其他亲属 |
| friend                 | 朋友     |
| other                  | 其他     |

### 7.3 设备类型 (DeviceType)

```typescript
type DeviceType = 'robot' | 'virtual';
```

| 值      | 说明     |
| ------- | -------- |
| robot   | 物理机器人 |
| virtual | 虚拟设备 |

### 7.4 修改密码错误码

| code               | 说明           |
| ------------------ | -------------- |
| wrongOldPassword   | 旧密码错误     |
| passwordMismatch   | 密码不匹配     |
| invalidPassword    | 密码格式不合法 |

---

## 8. 接口总览

| #  | 方法   | 路径                                            | 说明                  | 认证 |
| -- | ------ | ----------------------------------------------- | --------------------- | ---- |
| 1  | POST   | `/api/v1/auth/email/challenge`                  | 发送邮箱验证码        | 否   |
| 2  | POST   | `/api/v1/auth/email/code`                       | 邮箱验证码登录/注册   | 否   |
| 3  | POST   | `/api/v1/auth/email/password`                   | 邮箱密码登录          | 否   |
| 4  | POST   | `/api/v1/auth/email/reset`                      | 重置密码              | 否   |
| 5  | GET    | `/api/v1/auth/validate`                         | 验证 Access Token     | Header |
| 6  | GET    | `/api/v1/devices/mine`                          | 获取我的设备列表      | Header |
| 7  | POST   | `/api/v1/devices/virtual/activate`              | 激活虚拟设备          | Header |
| 8  | POST   | `/api/v1/devices/bind`                          | 绑定物理设备          | Header |
| 9  | POST   | `/api/v1/devices/unbind`                        | 解绑/删除设备         | Header |
| 10 | GET    | `/api/v1/profiles/avatar`                       | 获取头像              | Header |
| 11 | GET    | `/api/v1/profiles/info`                         | 获取个人资料          | Header |
| 12 | PUT    | `/api/v1/profiles/info`                         | 更新个人资料          | Header |
| 13 | POST   | `/api/v1/profiles/password`                     | 修改密码              | Header |
| 14 | POST   | `/api/v1/profiles/deactivate`                   | 注销账户              | Header |
| 15 | POST   | `/api/v1/profiles/phone/challenge`              | 发送手机验证码        | Header |
| 16 | POST   | `/api/v1/profiles/phone/verify`                 | 验证手机验证码        | Header |
| 17 | POST   | `/api/v1/profiles/phone`                        | 绑定/更换手机号       | Header |
| 18 | POST   | `/api/v1/voiceprint/recognize`                  | 声纹识别              | Header |
| 19 | POST   | `/api/v1/voiceprint/register`                   | 注册声纹              | Header |
| 20 | GET    | `/api/v1/voiceprint/persons`                    | 获取声纹人物列表      | Header |
| 21 | GET    | `/api/v1/voiceprint/persons/:personId`          | 获取人物详情          | Header |
| 22 | PUT    | `/api/v1/voiceprint/persons/:personId`          | 更新人物信息          | Header |
| 23 | DELETE | `/api/v1/voiceprint/persons/:personId`          | 删除人物              | Header |
| 24 | POST   | `/api/v1/voiceprint/persons/:personId/voices/add` | 为人物添加声音      | Header |
| 25 | PUT    | `/api/v1/voiceprint/persons/:personId/voices/:voiceId` | 更新声音       | Header |
| 26 | DELETE | `/api/v1/voiceprint/persons/:personId/voices/:voiceId` | 删除声音       | Header |
| 27 | GET    | `/api/v1/family-groups/mine`                    | 获取我的家庭组列表    | Header |
| 28 | GET    | `/api/v1/family-groups/:groupId`                | 获取家庭组详情        | Header |
| 29 | POST   | `/api/v1/family-groups/:groupId/invite`         | 生成邀请码            | Header |
| 30 | GET    | `/api/v1/family-groups/invite/:code`            | 解析邀请码信息        | 可选  |
| 31 | POST   | `/api/v1/family-groups/join`                    | 接受邀请加入家庭组    | Header |
| 32 | DELETE | `/api/v1/family-groups/:groupId/members/:memberId` | 移除成员           | Header |
| 33 | POST   | `/api/v1/family-groups/:groupId/leave`          | 退出家庭组            | Header |
| 34 | PUT    | `/api/v1/family-groups/:groupId/child`          | 更新儿童信息          | Header |
| -  | WS     | `/api/v1/chat/ws?token=&deviceId=`              | WebSocket 聊天连接    | Query |
| 35 | POST   | `/api/v1/telemetry/batch`                       | 批量上报遥测事件      | 无     |

---

## 9. 遥测模块 (Telemetry)

**源码**: `src/utils/api/telemetry.ts` / `src/types/api/telemetry.ts`

### 9.1 批量上报遥测事件

```
POST /api/v1/telemetry/batch
```

> **认证**: 此接口不要求 `x-access-token` 认证。未登录用户也需要上报事件（如注册流程中的行为）。用户标识通过 `userIdHash`（SHA-256 哈希）匿名化传递。

**请求体:**

```json
{
  "events": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "page_enter",
      "name": "home",
      "page": "/main/home",
      "referrer": "/stack/auth",
      "userIdHash": "a1b2c3d4e5f67890",
      "sessionId": "sess_m1r2x3k4",
      "deviceId": "660e8400-e29b-41d4-a716-446655440001",
      "timestamp": 1715666400000,
      "duration": null,
      "data": { "routeName": "home" },
      "sampled": true
    }
  ],
  "clientTime": 1715666405000,
  "batchSeq": 42
}
```

**TelemetryEvent 字段说明:**

| 字段        | 类型                          | 必填 | 说明                                          |
| ----------- | ----------------------------- | ---- | --------------------------------------------- |
| id          | string (UUID)                 | 是   | 事件唯一标识，用于去重                        |
| type        | string                        | 是   | 事件类型 (见下方枚举)                         |
| name        | string                        | 是   | 事件名称：路由名或业务事件名                  |
| page        | string                        | 是   | 当前页面路径                                  |
| referrer    | string                        | 是   | 来源页面路径                                  |
| userIdHash  | string                        | 是   | 用户 SHA-256 哈希（16位），未登录为设备指纹哈希 |
| sessionId   | string                        | 是   | 会话 ID（单次访问期间不变）                   |
| deviceId    | string \| null                | 是   | 当前活跃设备 ID                               |
| timestamp   | number                        | 是   | 客户端时间戳 (ms)                             |
| duration    | number \| null                | 否   | 停留时长 (ms)，仅 `page_leave` 事件           |
| data        | Record<string, unknown> \| null | 否 | 事件自定义数据（白名单过滤后）                |
| sampled     | boolean                       | 是   | 是否命中采样                                  |

**TelemetryEventType 枚举:**

| 值             | 说明                   |
| -------------- | ---------------------- |
| `page_enter`   | 页面进入（PV）         |
| `page_leave`   | 页面离开（含停留时长） |
| `click`        | 按钮/元素点击          |
| `custom`       | 自定义业务事件         |
| `session_start`| 会话开始（留存计算）   |
| `app_resume`   | App 从后台恢复         |
| `conversion`   | 转化节点事件           |

**ConversionNode 枚举（转化节点名称，出现在 `name` 字段中，格式 `conv_{node}`）:**

| 节点                   | 说明               |
| ---------------------- | ------------------ |
| `auth_view`            | 打开认证页         |
| `auth_code_sent`       | 发送验证码         |
| `auth_login_success`   | 登录/注册成功      |
| `profile_setup`        | 完善个人信息       |
| `onboarding_complete`  | 引导完成           |
| `device_activated`     | 虚拟设备激活       |
| `voiceprint_registered`| 声纹录入（必须）   |
| `personality_set`      | AI 个性调节        |
| `first_chat`           | 首次进入聊天       |
| `first_voice_input`    | 首次语音输入       |
| `first_ai_response`    | 首次收到 AI 回复   |
| `family_group_joined`  | 加入家庭组         |
| `device_switched`      | 切换设备           |

**TelemetryBatchRequest 字段说明:**

| 字段        | 类型              | 必填 | 说明                               |
| ----------- | ----------------- | ---- | ---------------------------------- |
| events      | TelemetryEvent[]  | 是   | 事件列表（建议单批上限 50 条）     |
| clientTime  | number            | 是   | 客户端发送时间 (ms)                |
| batchSeq    | number            | 是   | 批次序列号（单调递增，用于去重排序）|

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "received": 15
  }
}
```

**失败响应 (HTTP 4xx/5xx):**

```json
{
  "success": false,
  "message": "Invalid batch format"
}
```

**错误码说明:**

| HTTP 状态码 | 场景                          |
| ----------- | ----------------------------- |
| 200         | 成功接收                      |
| 400         | 请求格式错误/缺少必填字段     |
| 413         | 批次过大（建议单批 ≤ 50 条）  |
| 429         | 请求频率过高                  |
| 500         | 服务端内部错误                |

### 9.2 上报策略

| 参数           | 默认值   | 说明                                      |
| -------------- | -------- | ----------------------------------------- |
| 缓冲区大小     | 50 条    | 超过则立即触发批量上报                    |
| 定时上报间隔   | 10 秒    | 每 10 秒自动 flush 一次                   |
| 离线队列容量   | 500 条   | FIFO 淘汰，IndexedDB 持久化               |
| 请求超时       | 5 秒     | 避免埋点请求阻塞业务                      |

### 9.3 采样率配置

| 页面/事件类型        | 采样率 | 说明           |
| -------------------- | ------ | -------------- |
| 核心页面 (首页/聊天/认证/设备添加/家庭组/引导/配置) | 100%  | 全量采集       |
| 次要页面 (设置/帮助/消息/订单/关于等)               | 30%   | 采样采集       |
| 转化节点事件         | 100%   | 始终全量       |
| click 事件           | 100%   | 受页面采样率控制 |
| custom 事件          | 100%   | 受页面采样率控制 |

### 9.4 隐私合规

- 用户标识：`userIdHash = SHA-256(accessToken + salt)`，取前 16 位，不可逆
- 未登录用户：使用设备指纹哈希替代
- data 字段：仅上传白名单 key，自动过滤 PII（邮箱/手机/密码/姓名/头像/生日等）
- 不采集任何儿童个人信息明文
