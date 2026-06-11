# 虚拟乐宝设备添加功能 - 技术实施文档

> **版本**: v1.0  
> **日期**: 2026-04-25  
> **项目**: le-bot-frontend (乐宝AI机器人 Web 前端)

---

## 目录

1. [前端代码变更汇总](#1-前端代码变更汇总)
2. [后端 API 接口规范](#2-后端-api-接口规范)
3. [技术架构说明](#3-技术架构说明)
4. [实现要点](#4-实现要点)
5. [数据流图](#5-数据流图)

---

## 1. 前端代码变更汇总

本次变更涉及 **11 个文件**（10 个修改 + 1 个新建），覆盖数据模型、API 层、状态管理、页面组件、路由和国际化。

### 1.1 数据模型扩展

#### 文件: `src/stores/device/types.ts`

**变更类型**: 修改  
**变更目的**: 扩展设备类型系统以支持虚拟设备，增加扩展预留字段

**具体变更**:

| 项目                               | 变更前    | 变更后                        |
| ---------------------------------- | --------- | ----------------------------- |
| `DeviceType`                       | `'robot'` | `'robot' \| 'virtual'`        |
| `MAX_VIRTUAL_DEVICES`              | 不存在    | 新增常量 `5`                  |
| `DeviceInfo.boundPhysicalDeviceId` | 不存在    | 新增可选字段 `string \| null` |

**完整代码**:

```typescript
export type DeviceType = 'robot' | 'virtual';

/** Maximum number of virtual devices a user can create */
export const MAX_VIRTUAL_DEVICES = 5;

export interface DeviceInfo {
  id: string;
  createdAt: string | null;
  updatedAt: string | null;
  identifier: string;
  ownerId: number;
  type: DeviceType;
  model: string;
  name: string | null;
  status: unknown;
  config: {
    voiceStyle: string;
  } | null;
  /** Reserved for future physical device binding — null for standalone virtual devices */
  boundPhysicalDeviceId?: string | null;
}
```

**设计说明**:

- `MAX_VIRTUAL_DEVICES = 5`: 前端硬限制每个用户最多 5 个虚拟设备，后端需二次校验
- `boundPhysicalDeviceId`: 预留字段，当前始终为 `null`，未来绑定物理设备流程时直接使用

---

### 1.2 API 类型定义

#### 文件: `src/types/api/device.ts`

**变更类型**: 修改  
**变更目的**: 新增虚拟设备激活和解绑的 API 响应类型

**新增类型**:

```typescript
export type ActivateVirtualDeviceResponse =
  | { success: false; message: string }
  | { success: true; data: { device: DeviceInfo } };

export type UnbindDeviceResponse = { success: false; message: string } | { success: true };
```

**完整代码** (含已有 `RetrieveMineResponse`):

```typescript
import type { DeviceInfo } from 'stores/device/types';

export type RetrieveMineResponse =
  | { success: false; message: string }
  | { success: true; data: { devices: DeviceInfo[] } };

export type ActivateVirtualDeviceResponse =
  | { success: false; message: string }
  | { success: true; data: { device: DeviceInfo } };

export type UnbindDeviceResponse = { success: false; message: string } | { success: true };
```

---

### 1.3 API 调用函数

#### 文件: `src/utils/api/device.ts`

**变更类型**: 修改  
**变更目的**: 新增虚拟设备激活和解绑的 HTTP 请求函数

**新增函数**:

| 函数                                  | HTTP 方法 | 路径                        | 用途                  |
| ------------------------------------- | --------- | --------------------------- | --------------------- |
| `activateVirtualDevice(accessToken)`  | POST      | `/devices/virtual/activate` | 激活虚拟设备，获取 SN |
| `unbindDevice(accessToken, deviceId)` | DELETE    | `/devices/{deviceId}`       | 解绑/删除设备         |

**完整代码**:

```typescript
import { api } from 'boot/axios';
import type {
  ActivateVirtualDeviceResponse,
  RetrieveMineResponse,
  UnbindDeviceResponse,
} from 'src/types/api/device';

// [已有] 获取我的设备列表
export const retrieveMine = async (accessToken: string) =>
  await api.get<RetrieveMineResponse>('/devices/mine', {
    headers: { 'x-access-token': accessToken },
  });

// [新增] 激活虚拟设备
export const activateVirtualDevice = async (accessToken: string) =>
  await api.post<ActivateVirtualDeviceResponse>(
    '/devices/virtual/activate',
    {},
    { headers: { 'x-access-token': accessToken } },
  );

// [新增] 解绑设备
export const unbindDevice = async (accessToken: string, deviceId: string) =>
  await api.delete<UnbindDeviceResponse>(`/devices/${deviceId}`, {
    headers: { 'x-access-token': accessToken },
  });
```

---

### 1.4 设备 Store 改造

#### 文件: `src/stores/device/index.ts`

**变更类型**: 修改  
**变更目的**: 支持多虚拟设备管理、设备切换、数量限制

**新增接口**:

| 方法/属性                    | 类型       | 说明                                       |
| ---------------------------- | ---------- | ------------------------------------------ |
| `virtualDevices`             | `computed` | 过滤 `type === 'virtual'` 的设备列表       |
| `addDevice(device)`          | `function` | 添加虚拟设备，校验 5 个上限                |
| `removeDevice(deviceId)`     | `function` | 按 id 移除设备，若当前设备被移除则自动切换 |
| `setCurrentDevice(deviceId)` | `function` | 按 id 切换当前活跃设备                     |

**完整代码**:

```typescript
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { DeviceInfo } from 'stores/device/types';
import { MAX_VIRTUAL_DEVICES } from 'stores/device/types';

export const useDeviceStore = defineStore(
  'device',
  () => {
    const currentDevice = ref<DeviceInfo>();
    const devices = ref<DeviceInfo[]>([]);

    /** All virtual devices (type === 'virtual') */
    const virtualDevices = computed(() => devices.value.filter((d) => d.type === 'virtual'));

    // [向后兼容] 批量更新设备列表
    const updateDevices = (newDevices: DeviceInfo[] = []) => {
      devices.value = newDevices;
      currentDevice.value = newDevices[0];
    };

    // [新增] 添加虚拟设备
    const addDevice = (device: DeviceInfo) => {
      if (virtualDevices.value.length >= MAX_VIRTUAL_DEVICES) {
        throw new Error(`Cannot add more than ${MAX_VIRTUAL_DEVICES} virtual devices`);
      }
      devices.value.push(device);
      if (!currentDevice.value) {
        currentDevice.value = device;
      }
    };

    // [新增] 移除设备
    const removeDevice = (deviceId: string) => {
      const index = devices.value.findIndex((d) => d.id === deviceId);
      if (index === -1) return;
      devices.value.splice(index, 1);
      if (currentDevice.value?.id === deviceId) {
        currentDevice.value = devices.value[0];
      }
    };

    // [新增] 切换当前设备
    const setCurrentDevice = (deviceId: string) => {
      const device = devices.value.find((d) => d.id === deviceId);
      if (device) {
        currentDevice.value = device;
      }
    };

    return {
      currentDevice,
      devices,
      virtualDevices,
      updateDevices,
      addDevice,
      removeDevice,
      setCurrentDevice,
    };
  },
  { persist: true },
);
```

---

### 1.5 设备工具函数

#### 文件: `src/utils/device.ts`

**变更类型**: 修改  
**变更目的**: 新增虚拟设备激活和解绑的业务编排函数（组合 API 调用 + Store 更新）

**新增函数**:

| 函数                              | 流程                                     | 返回值       |
| --------------------------------- | ---------------------------------------- | ------------ |
| `activateAndAddVirtualDevice()`   | 调用 API → 校验响应 → Store.addDevice    | `DeviceInfo` |
| `unbindAndRemoveDevice(deviceId)` | 调用 API → 校验响应 → Store.removeDevice | `void`       |

**完整代码**:

```typescript
import type { DeviceInfo } from 'stores/device/types';
import { useAuthStore } from 'stores/auth';
import { useDeviceStore } from 'stores/device';
import { activateVirtualDevice, retrieveMine, unbindDevice } from 'src/utils/api/device';

// [已有] 获取设备列表
export const retrieveDevices = async (): Promise<DeviceInfo[]> => {
  const authStore = useAuthStore();
  if (!authStore.accessToken) throw new Error('Failed to get access token');
  const { data: mineResponse } = await retrieveMine(authStore.accessToken);
  if (!mineResponse.success) throw new Error('Failed to retrieve devices');
  return mineResponse.data.devices;
};

// [新增] 激活并添加虚拟设备
export const activateAndAddVirtualDevice = async (): Promise<DeviceInfo> => {
  const authStore = useAuthStore();
  const deviceStore = useDeviceStore();
  if (!authStore.accessToken) throw new Error('Failed to get access token');
  const { data: response } = await activateVirtualDevice(authStore.accessToken);
  if (!response.success) throw new Error(response.message || 'Failed to activate virtual device');
  deviceStore.addDevice(response.data.device);
  return response.data.device;
};

// [新增] 解绑并移除设备
export const unbindAndRemoveDevice = async (deviceId: string): Promise<void> => {
  const authStore = useAuthStore();
  const deviceStore = useDeviceStore();
  if (!authStore.accessToken) throw new Error('Failed to get access token');
  const { data: response } = await unbindDevice(authStore.accessToken, deviceId);
  if (!response.success) throw new Error(response.message || 'Failed to unbind device');
  deviceStore.removeDevice(deviceId);
};
```

---

### 1.6 设备列表/添加页面 (新建)

#### 文件: `src/pages/stack/DevicesPage.vue`

**变更类型**: 新建  
**变更目的**: 提供虚拟设备列表展示、添加、解绑的完整用户界面

**页面结构**:

```
┌─ DevicesPage ──────────────────────────┐
│  [空状态]                                │
│    🤖 图标 + "暂无虚拟设备" 引导文案       │
│                                         │
│  [设备列表]                              │
│  ┌─────────────────────────────────┐    │
│  │  虚拟乐宝       SN: LEBOT-V-XXX  ▶  │
│  │                           [解绑] │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │  虚拟乐宝 2     SN: LEBOT-V-YYY  ▶  │
│  │                           [解绑] │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [+ 添加虚拟乐宝]  (Loading 态/禁用态)   │
│  "你最多可以添加 5 个虚拟设备"            │
│                                         │
│  [解绑确认弹窗] (q-dialog)               │
└─────────────────────────────────────────┘
```

**核心逻辑**:

1. **设备列表**: 使用 `virtualDevices` computed 属性，仅渲染虚拟设备
2. **添加流程**: 点击按钮 → `isActivating = true` 锁定 → 调用 `activateAndAddVirtualDevice()` → Notify 提示 → 自动刷新列表
3. **解绑流程**: 点击解绑 → 弹出确认对话框 → 确认后调用 `unbindAndRemoveDevice()` → Notify 提示
4. **自动激活**: 通过 `?action=add` 查询参数进入页面时，`onMounted` 自动触发添加流程
5. **数量限制**: `canAddMore = virtualDevices.length < 5`，到达上限时按钮 disabled + 显示提示文字
6. **设备配置导航**: 点击设备卡片 → `setCurrentDevice(id)` → 跳转 `/stack/device-config`

**完整代码**: 参见 `src/pages/stack/DevicesPage.vue` (181 行)

---

### 1.7 路由注册

#### 文件: `src/router/routes.ts`

**变更类型**: 修改  
**变更目的**: 注册 `/stack/devices` 路由

**新增路由配置** (插入在 `device-config` 和 `settings` 之间):

```typescript
{
  name: 'devices',
  path: 'devices',
  components: {
    default: () => import('pages/stack/DevicesPage.vue'),
    header: () => import('layouts/headers/StackHeader.vue'),
  },
},
```

**路由全景**:

```
/stack
├── about                  # 关于页
├── auth                   # 认证页
├── chat                   # 聊天页
├── growth-data            # 成长数据页
├── profile                # 个人资料页
├── device-config          # 设备配置页
├── devices          ← [新增] 设备列表/添加页
└── settings               # 设置页
    └── voiceprint/        # 声纹管理子页面
```

---

### 1.8 首页设备卡片改造

#### 文件: `src/components/home/DeviceCard.vue`

**变更类型**: 修改  
**变更目的**: 根据虚拟设备状态动态切换卡片展示模式

**两种展示模式**:

| 条件                          | 展示内容                                                           |
| ----------------------------- | ------------------------------------------------------------------ |
| `virtualDevices.length === 0` | "No Device" 标题 + "添加新设备" 按钮 → `/stack/devices?action=add` |
| `virtualDevices.length > 0`   | 显示 `currentDevice.name` (或 identifier) + SN + "添加新设备" 按钮 |

**关键实现**:

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { i18nSubPath } from 'src/utils/common';
import { useDeviceStore } from 'stores/device';

const i18n = i18nSubPath('components.home.DeviceCard');
const { virtualDevices, currentDevice } = storeToRefs(useDeviceStore());
</script>

<template>
  <q-card bordered flat>
    <q-card-section class="row justify-between">
      <!-- 模式 1: 无设备 -->
      <template v-if="virtualDevices.length === 0">
        <div class="text-h6">{{ i18n('labels.noDevice') }}</div>
        <q-btn ... to="/stack/devices?action=add" />
      </template>
      <!-- 模式 2: 有虚拟设备 -->
      <template v-else>
        <div class="text-h6">
          {{ currentDevice?.name || currentDevice?.identifier || i18n('labels.noDevice') }}
        </div>
        <div class="text-grey">{{ currentDevice.identifier }}</div>
        <q-btn ... to="/stack/devices?action=add" />
      </template>
    </q-card-section>
  </q-card>
</template>
```

---

### 1.9 设备配置页解绑逻辑改造

#### 文件: `src/pages/stack/DeviceConfigPage.vue`

**变更类型**: 修改  
**变更目的**: 区分虚拟设备和物理设备的解绑行为

**改造前后对比**:

| 场景         | 改造前                       | 改造后                                                       |
| ------------ | ---------------------------- | ------------------------------------------------------------ |
| 物理设备解绑 | `logoutAccount()` (全局登出) | `logoutAccount()` (保持不变)                                 |
| 虚拟设备解绑 | `logoutAccount()` (不合适)   | `unbindAndRemoveDevice(id)` → Notify → 跳转 `/stack/devices` |

**关键实现**:

```typescript
const isVirtual = computed(() => currentDevice.value?.type === 'virtual');

async function handleUnbind() {
  if (!currentDevice.value) return;

  if (isVirtual.value) {
    // 虚拟设备: 调用解绑 API
    await unbindAndRemoveDevice(currentDevice.value.id);
    Notify.create({ type: 'positive', message: '...' });
    router.replace('/stack/devices');
  } else {
    // 物理设备: 保持原有登出逻辑
    logoutAccount();
  }
}
```

---

### 1.10 WebSocket 连接改造

#### 文件: `src/composables/useChatSession.ts`

**变更类型**: 修改  
**变更目的**: 使 WebSocket 连接支持携带 `deviceId` 参数，后端可据此关联虚拟设备配置

**接口签名变化**:

```typescript
// 改造前
connect: (token: string) => Promise<void>;

// 改造后
connect: (token: string, deviceId?: string) => Promise<void>;
```

**URL 组装逻辑**:

```typescript
async function connect(token: string, deviceId?: string): Promise<void> {
  setupWsHandlers();
  const deviceParam = deviceId ? `&deviceId=${deviceId}` : '';
  const wsUrl = `${process.env.LE_BOT_BACKEND_WS_BASE_URL}/api/v1/chat/ws?token=${token}${deviceParam}`;
  wsClient.connect(wsUrl);
  // ... 初始化麦克风、录音器、静音检测等
}
```

**向后兼容性**: `deviceId` 为可选参数，不传时 URL 仅包含 `?token=xxx`，与原有行为完全一致。

---

### 1.11 国际化文案

#### 文件: `src/i18n/en-US/index.ts`

**变更类型**: 修改  
**变更目的**: 新增虚拟设备相关的全部 UI 文案

**新增 `DevicesPage` 命名空间**:

```typescript
DevicesPage: {
  labels: {
    title: 'My Devices',
    addVirtualDevice: 'Add Virtual LeBot',
    virtualDevice: 'Virtual LeBot',
    serialNumber: 'SN: {sn}',
    unbind: 'Unbind',
    cancel: 'Cancel',
    unbindConfirm: 'Are you sure you want to unbind this device?',
    noVirtualDevices: 'No virtual devices yet. Add one to start chatting!',
    maxDevicesReached: 'You can add up to 5 virtual devices',
  },
  notifications: {
    activateSuccess: 'Virtual LeBot activated successfully',
    activateFailed: 'Failed to activate virtual device',
    unbindSuccess: 'Device unbound successfully',
    unbindFailed: 'Failed to unbind device',
  },
},
```

**新增 `DeviceConfigPage.notifications`**:

```typescript
notifications: {
  unbindSuccess: 'Device unbound successfully',
  unbindFailed: 'Failed to unbind device',
},
```

**新增导航文案**:

```typescript
stack: {
  // ...
  devices: 'My Devices',  // [新增]
  // ...
},
```

---

## 2. 后端 API 接口规范

> **重要提示**: 以下接口需要后端团队配合实现。接口遵循项目现有的 `{ success, message?, data? }` 响应格式和 `x-access-token` 鉴权方式。

### 2.0 通用约定

#### 2.0.1 认证方式

所有设备模块接口均需在 HTTP Header 中携带 `x-access-token`，后端需校验 token 有效性并提取 `userId`（即 `ownerId`）用于权限校验。

```
x-access-token: <accessToken>
```

#### 2.0.2 通用响应格式

**成功响应 (HTTP 200):**

```json
{
  "success": true,
  "data": { ... }
}
```

**失败响应 (HTTP 200，业务错误):**

```json
{
  "success": false,
  "message": "错误描述信息"
}
```

> 注意：本项目约定业务错误也返回 HTTP 200，通过 `success: false` 区分。仅在网络异常或服务端内部错误时返回 HTTP 4xx/5xx。

#### 2.0.3 错误码规范

后端返回的 `message` 字段应使用以下标准错误描述，前端根据 `message` 内容展示对应的 i18n 文案：

| 错误场景         | message 值                                        | 前端处理     |
| ---------------- | ------------------------------------------------- | ------------ |
| Token 无效或过期 | `"Invalid or expired access token"`               | 跳转登录页   |
| 设备数量超限     | `"Cannot create more than 5 virtual devices"`     | 展示错误通知 |
| 设备不存在       | `"Device not found"`                              | 展示错误通知 |
| 无权限操作       | `"Access denied: device does not belong to user"` | 展示错误通知 |
| 设备 ID 格式无效 | `"Invalid deviceId format"`                       | 展示错误通知 |
| 服务端内部错误   | `"Internal server error"`                         | 展示错误通知 |
| 虚拟设备激活失败 | `"Failed to activate virtual device"`             | 展示错误通知 |

#### 2.0.4 数据库表结构参考

后端实现时建议使用如下表结构（以关系型数据库为例）：

```sql
CREATE TABLE devices (
  id            VARCHAR(36)  PRIMARY KEY,              -- UUID v4，由后端生成
  identifier    VARCHAR(32)  NOT NULL UNIQUE,         -- SN 序列号，如 LEBOT-V-A1B2C3D4
  owner_id      INTEGER      NOT NULL,                -- 所属用户 ID（关联 users 表）
  type          VARCHAR(16)  NOT NULL DEFAULT 'robot', -- 'robot' | 'virtual'
  model         VARCHAR(64)  NOT NULL,                -- 设备型号，虚拟设备固定 'virtual-lebot-v1'
  name          VARCHAR(128),                         -- 用户自定义设备名称，可为 NULL
  status        JSON,                                  -- 设备状态（预留），可为 NULL
  config        JSON,                                  -- 设备配置 JSON，如 {"voiceStyle":"default"}
  bound_physical_device_id VARCHAR(36),               -- 绑定的物理设备 ID（预留），可为 NULL
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP,

  INDEX idx_devices_owner_id (owner_id),
  INDEX idx_devices_type (type),
  INDEX idx_devices_identifier (identifier),
  CONSTRAINT chk_device_type CHECK (type IN ('robot', 'virtual'))
);
```

**关键字段说明**：

| 字段                       | 说明                                                           |
| -------------------------- | -------------------------------------------------------------- |
| `id`                       | UUID v4，全局唯一，作为 API 路径参数和 WebSocket 的 `deviceId` |
| `identifier`               | SN 序列号，展示给用户的可读标识符，全局唯一                    |
| `config`                   | JSON 字段，存储 `voiceStyle`、`aiPersonality` 等设备配置       |
| `bound_physical_device_id` | 预留字段，当前始终为 NULL，未来用于虚拟设备绑定物理设备        |

---

### 2.1 激活虚拟设备

创建新的虚拟设备，后端负责生成唯一 SN（序列号/identifier）并将其加入设备维护列表。

```
POST /api/v1/devices/virtual/activate
```

**请求头**：

| Header           | Value                 |
| ---------------- | --------------------- |
| `Content-Type`   | `application/json`    |
| `x-access-token` | `<用户 access token>` |

**请求体**：

```json
{}
```

> 当前请求体为空，因为所有必要信息（用户身份、设备类型=virtual）均可从 token 和路由推导。后续如需传入设备名称等参数可扩展。

**成功响应** (HTTP 200)：

```json
{
  "success": true,
  "data": {
    "device": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2026-04-25T10:30:00.000Z",
      "updatedAt": null,
      "identifier": "LEBOT-V-A1B2C3D4",
      "ownerId": 123,
      "type": "virtual",
      "model": "virtual-lebot-v1",
      "name": null,
      "status": "active",
      "config": {
        "voiceStyle": "default",
        "aiPersonality": {
          "enabled": false
        }
      },
      "boundPhysicalDeviceId": null
    }
  }
}
```

**响应字段详细说明**：

| 字段                                  | 类型                        | 必填 | 说明                                       |
| ------------------------------------- | --------------------------- | ---- | ------------------------------------------ |
| `device.id`                           | `string` (UUID)             | 是   | 设备唯一标识，UUID v4 格式                 |
| `device.createdAt`                    | `string \| null` (ISO 8601) | 是   | 设备创建时间，新建设备应设为服务器当前时间 |
| `device.updatedAt`                    | `string \| null` (ISO 8601) | 是   | 设备更新时间，新建设备为 `null`            |
| `device.identifier`                   | `string`                    | 是   | SN 序列号，格式见下方规则                  |
| `device.ownerId`                      | `number`                    | 是   | 所属用户 ID，从 access token 提取          |
| `device.type`                         | `"virtual"`                 | 是   | 固定为 `"virtual"`                         |
| `device.model`                        | `string`                    | 是   | 设备型号，固定为 `"virtual-lebot-v1"`      |
| `device.name`                         | `string \| null`            | 是   | 用户自定义名称，新建设备为 `null`          |
| `device.status`                       | `unknown`                   | 是   | 设备状态，新建设备建议为 `"active"`        |
| `device.config`                       | `object \| null`            | 是   | 设备配置，见下方初始化规则                 |
| `device.config.voiceStyle`            | `string`                    | 是   | 语音风格，默认 `"default"`                 |
| `device.config.aiPersonality`         | `object`                    | 否   | AI 人格配置，见下方说明                    |
| `device.config.aiPersonality.enabled` | `boolean`                   | 是   | 是否启用 AI 人格，默认 `false`             |
| `device.config.aiPersonality.traits`  | `string`                    | 否   | AI 人格特质描述                            |
| `device.config.aiPersonality.goals`   | `string`                    | 否   | AI 人格目标描述                            |
| `device.boundPhysicalDeviceId`        | `string \| null`            | 否   | 绑定的物理设备 ID（预留），当前为 `null`   |

**失败响应** (HTTP 200)：

```json
{
  "success": false,
  "message": "Cannot create more than 5 virtual devices"
}
```

**后端实现要求**：

| 要求           | 说明                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| SN 生成规则    | 格式 `LEBOT-V-XXXXXXXX`，其中 `XXXXXXXX` 为 8 位大写字母+数字组合。建议使用随机生成 + 数据库唯一约束重试机制，确保全局唯一 |
| SN 生成算法    | 推荐：取 4 字节随机数 → Base32 编码（去掉填充符）→ 取前 8 位 → 添加前缀 `LEBOT-V-`。也可使用 NanoID 等短 ID 生成库         |
| 数量限制       | 每个 `ownerId` 最多 5 个 `type === 'virtual'` 的设备，超出时返回 `success: false`                                          |
| 数量校验原子性 | 数量校验 + 插入操作应在同一数据库事务中完成，防止并发创建导致超限                                                          |
| 状态设置       | 新建设备 `status` 应为 `"active"`                                                                                          |
| 配置初始化     | `config` 应初始化为 `{ "voiceStyle": "default", "aiPersonality": { "enabled": false } }`                                   |
| 时间戳         | `createdAt` 设置为服务器当前时间（ISO 8601 格式），`updatedAt` 为 `null`                                                   |
| model 字段     | 固定为 `"virtual-lebot-v1"`，便于未来区分不同版本的虚拟设备                                                                |
| 权限验证       | 从 `x-access-token` 中提取 `userId`，作为 `ownerId` 写入设备记录                                                           |
| Token 校验     | Token 无效或过期时返回 `success: false, message: "Invalid or expired access token"`                                        |
| 幂等性建议     | 同一用户短时间内重复调用应各自创建独立设备（非幂等），前端通过 `isActivating` 锁防止并发                                   |

**后端处理流程伪代码**：

```
function activateVirtualDevice(accessToken):
  1. 校验 accessToken → 提取 userId
     - 失败 → return { success: false, message: "Invalid or expired access token" }

  2. 查询该 userId 下 type='virtual' 的设备数量
     - count >= 5 → return { success: false, message: "Cannot create more than 5 virtual devices" }

  3. [事务开始]
     a. 生成 SN (identifier): "LEBOT-V-" + randomBase32(8)
        - 若 identifier 冲突则重试（最多 3 次）
     b. 生成 UUID v4 作为 id
     c. INSERT INTO devices (id, identifier, owner_id, type, model, name, status, config, created_at)
        VALUES (id, identifier, userId, 'virtual', 'virtual-lebot-v1', NULL, 'active', defaultConfig, NOW())
     d. [事务提交]

  4. 返回完整的 DeviceInfo 对象
     return { success: true, data: { device: newDevice } }
```

---

### 2.2 解绑/删除设备

删除指定设备（物理设备或虚拟设备均可）。

```
DELETE /api/v1/devices/{deviceId}
```

**请求头**：

| Header           | Value                 |
| ---------------- | --------------------- |
| `x-access-token` | `<用户 access token>` |

**路径参数**：

| 参数       | 类型            | 说明            |
| ---------- | --------------- | --------------- |
| `deviceId` | `string` (UUID) | 要删除的设备 ID |

**成功响应** (HTTP 200)：

```json
{
  "success": true
}
```

**失败响应** (HTTP 200)：

```json
{
  "success": false,
  "message": "Device not found"
}
```

**所有可能的失败场景**：

| 场景              | message                                           | 说明                     |
| ----------------- | ------------------------------------------------- | ------------------------ |
| Token 无效        | `"Invalid or expired access token"`               | 鉴权失败                 |
| deviceId 格式无效 | `"Invalid deviceId format"`                       | 非 UUID v4 格式          |
| 设备不存在        | `"Device not found"`                              | 数据库中无此 id 的记录   |
| 无权限操作        | `"Access denied: device does not belong to user"` | 设备存在但不属于当前用户 |
| 服务端错误        | `"Internal server error"`                         | 数据库操作异常等         |

**后端实现要求**：

| 要求           | 说明                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------- |
| 权限校验       | 仅允许设备所有者 (`ownerId === userId`) 删除，非所有者返回 `"Access denied"`                        |
| 权限校验优先级 | 先校验 Token → 再校验 deviceId 格式 → 再查询设备 → 再校验所有权，按顺序返回首个错误                 |
| 级联删除       | 删除设备时应清理相关的关联数据，详见下方级联删除清单                                                |
| 幂等性         | 删除已不存在的设备应返回 `success: false, message: "Device not found"`（非幂等）                    |
| 并发安全       | 如果该设备有活跃的 WebSocket 连接，删除时应主动断开该连接                                           |
| 物理设备处理   | `type === 'robot'` 的物理设备同样使用此接口解绑，但后端可能需要额外的清理逻辑（如通知物理设备断开） |

**级联删除数据清单**：

删除设备时，后端应依次清理以下关联数据：

| 序号 | 关联数据       | 清理方式                                                   | 说明                       |
| ---- | -------------- | ---------------------------------------------------------- | -------------------------- |
| 1    | WebSocket 连接 | 主动断开以该 `deviceId` 建立的 WebSocket 连接              | 防止已删除设备继续收发消息 |
| 2    | 对话记录       | 删除该设备关联的所有 `conversation` 和 `chat_message` 记录 | 释放存储空间，保障隐私     |
| 3    | 会话上下文     | 清除该设备在 Redis/内存中的对话上下文缓存                  | 防止残留上下文被复用       |
| 4    | 声纹绑定       | 如果设备绑定了特定声纹配置，清理关联关系                   | 释放声纹资源引用           |
| 5    | 设备配置缓存   | 清除该设备配置在 Redis/内存中的缓存                        | 防止缓存不一致             |

> 注意：`boundPhysicalDeviceId` 关联的物理设备记录本身不应被级联删除，仅清理虚拟设备侧的引用。

**后端处理流程伪代码**：

```
function unbindDevice(accessToken, deviceId):
  1. 校验 accessToken → 提取 userId
     - 失败 → return { success: false, message: "Invalid or expired access token" }

  2. 校验 deviceId 格式 (UUID v4)
     - 无效 → return { success: false, message: "Invalid deviceId format" }

  3. 查询设备记录
     - 不存在 → return { success: false, message: "Device not found" }

  4. 校验设备所有权 (device.ownerId === userId)
     - 不匹配 → return { success: false, message: "Access denied: device does not belong to user" }

  5. [事务开始]
     a. 断开该设备的活跃 WebSocket 连接
     b. 删除关联的对话记录 (conversations, chat_messages)
     c. 清除 Redis 中的对话上下文和设备配置缓存
     d. 清理声纹绑定关系
     e. DELETE FROM devices WHERE id = deviceId
     f. [事务提交]

  6. return { success: true }
```

---

### 2.3 获取我的设备 (已有接口，需扩展)

此接口已存在，但需要扩展返回数据以包含虚拟设备。

```
GET /api/v1/devices/mine
```

**请求头**：

| Header           | Value                 |
| ---------------- | --------------------- |
| `x-access-token` | `<用户 access token>` |

**成功响应** (HTTP 200)：

```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "identifier": "PHYSICAL-ROBOT-01",
        "ownerId": 1,
        "type": "robot",
        "model": "lebot-v1",
        "name": "我的乐宝",
        "status": {},
        "config": {
          "voiceStyle": "xiaole"
        },
        "boundPhysicalDeviceId": null
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "createdAt": "2026-04-25T10:30:00.000Z",
        "updatedAt": null,
        "identifier": "LEBOT-V-A1B2C3D4",
        "ownerId": 1,
        "type": "virtual",
        "model": "virtual-lebot-v1",
        "name": null,
        "status": "active",
        "config": {
          "voiceStyle": "default",
          "aiPersonality": {
            "enabled": false
          }
        },
        "boundPhysicalDeviceId": null
      }
    ]
  }
}
```

**变更要求**: 返回的 `devices[]` 中应**同时包含** `type: "robot"` 和 `type: "virtual"` 的设备，前端 Store 的 `updateDevices()` 会统一存储。

**DeviceInfo 完整字段说明**：

| 字段                           | 类型                        | 必填     | 说明                                                                 |
| ------------------------------ | --------------------------- | -------- | -------------------------------------------------------------------- |
| `id`                           | `string` (UUID)             | 是       | 设备唯一标识                                                         |
| `createdAt`                    | `string \| null` (ISO 8601) | 是       | 创建时间                                                             |
| `updatedAt`                    | `string \| null` (ISO 8601) | 是       | 更新时间，未更新过则为 `null`                                        |
| `identifier`                   | `string`                    | 是       | 设备 SN 序列号，物理设备和虚拟设备格式不同                           |
| `ownerId`                      | `number`                    | 是       | 所属用户 ID                                                          |
| `type`                         | `"robot" \| "virtual"`      | 是       | 设备类型                                                             |
| `model`                        | `string`                    | 是       | 设备型号：物理设备如 `"lebot-v1"`，虚拟设备固定 `"virtual-lebot-v1"` |
| `name`                         | `string \| null`            | 是       | 用户自定义设备名称，未设置则为 `null`                                |
| `status`                       | `unknown`                   | 是       | 设备状态（预留字段，类型未固定）                                     |
| `config`                       | `object \| null`            | 是       | 设备配置 JSON                                                        |
| `config.voiceStyle`            | `string`                    | 是       | 语音风格标识                                                         |
| `config.aiPersonality`         | `object`                    | 否       | AI 人格配置（仅虚拟设备可能有）                                      |
| `config.aiPersonality.enabled` | `boolean`                   | 条件必填 | 是否启用 AI 人格                                                     |
| `config.aiPersonality.traits`  | `string`                    | 否       | AI 人格特质                                                          |
| `config.aiPersonality.goals`   | `string`                    | 否       | AI 人格目标                                                          |
| `boundPhysicalDeviceId`        | `string \| null`            | 否       | 绑定的物理设备 ID（预留），当前为 `null`                             |

---

### 2.4 WebSocket 连接协议扩展

WebSocket 连接 URL 增加可选的 `deviceId` 查询参数。

**连接 URL 格式**：

```
wss://<host>/api/v1/chat/ws?token=<accessToken>&deviceId=<deviceId>
```

**参数说明**：

| 参数       | 类型            | 必填 | 说明                                |
| ---------- | --------------- | ---- | ----------------------------------- |
| `token`    | `string`        | 是   | 用户 access token，用于鉴权         |
| `deviceId` | `string` (UUID) | 否   | 虚拟设备 ID，不传则表示物理设备模式 |

**后端处理逻辑**：

1. 收到连接请求后，首先校验 `token` 有效性
2. 若 `deviceId` 参数存在且非空：
   - 校验 `deviceId` 格式（应为 UUID v4）
   - 查询数据库确认该设备存在且 `ownerId === userId`
   - 加载该虚拟设备的配置（`voiceStyle`、`aiPersonality` 等）
   - 将该 WebSocket 连接与 `deviceId` 关联
3. 若 `deviceId` 不存在或为空：
   - 保持原有物理设备逻辑
   - 查询该用户关联的物理设备
4. 后续所有 WebSocket 消息（`inputAudioStream`、`outputAudioStream` 等）应关联到该设备

**deviceId 参数校验失败的处理**：

| 场景                          | 处理方式                                      |
| ----------------------------- | --------------------------------------------- |
| `deviceId` 格式不是有效 UUID  | 拒绝 WebSocket 握手（HTTP 400），返回错误信息 |
| `deviceId` 对应设备不存在     | 拒绝 WebSocket 握手（HTTP 404），返回错误信息 |
| `deviceId` 设备不属于当前用户 | 拒绝 WebSocket 握手（HTTP 403），返回错误信息 |
| `deviceId` 设备已被删除       | 拒绝 WebSocket 握手（HTTP 404），返回错误信息 |

**设备配置预加载机制**：

当连接携带 `deviceId` 时，后端应在 WebSocket 握手成功后、发送 `establishConnection` 之前，预加载以下设备配置并应用于当前会话：

| 配置项      | 来源字段                              | 默认值      | 说明                            |
| ----------- | ------------------------------------- | ----------- | ------------------------------- |
| 语音风格    | `device.config.voiceStyle`            | `"default"` | 用于 TTS 语音合成               |
| AI 人格开关 | `device.config.aiPersonality.enabled` | `false`     | 控制 AI 是否使用人格化回复      |
| AI 人格特质 | `device.config.aiPersonality.traits`  | `null`      | AI 人格特质描述文本             |
| AI 人格目标 | `device.config.aiPersonality.goals`   | `null`      | AI 人格目标描述文本             |
| 设备 ID     | `device.id`                           | -           | 关联到所有后续消息的 `deviceId` |

**与现有 `WsUpdateConfigRequest` 的关系**：

当前前端在 `establishConnection` 后立即发送 `WsUpdateConfigRequest` 携带 `voiceId` 等配置。增加 `deviceId` 参数后，后端应：

1. **在握手阶段**根据 `deviceId` 预加载设备配置作为会话默认配置
2. **在收到 `updateConfig` 消息后**，用消息中的配置**覆盖**预加载的默认配置
3. `updateConfig` 消息中的 `voiceId` 字段优先级**高于**设备配置中的 `voiceStyle`

这种分层覆盖的设计确保了：

- 即使前端未发送 `updateConfig`，设备配置也能生效
- 前端仍可通过 `updateConfig` 动态调整会话参数
- 向后兼容：不传 `deviceId` 时行为完全不变

`WsUpdateConfigRequest` 现有字段（保持不变）：

```typescript
{
  conversationId?: string;
  location?: { latitude: number; longitude: number };
  outputText?: boolean;
  sampleRate?: { input?: number; output?: number };
  speechRate?: number;
  timezone?: string;
  voiceId?: string;
}
```

**连接生命周期中的设备关联**：

```
WebSocket 连接建立
  │
  ├─ 校验 token + 校验 deviceId（如有）
  │
  ├─ [成功] 预加载设备配置 → 发送 establishConnection
  │     │
  │     ├─ 会话期间，所有消息关联到该 deviceId
  │     │     ├─ inputAudioStream  → 标记 deviceId
  │     │     ├─ outputAudioStream → 使用该设备 voiceStyle
  │     │     ├─ outputTextStream  → 使用该设备 aiPersonality
  │     │     └─ chatComplete      → 记录到该设备的对话历史
  │     │
  │     └─ 收到 updateConfig → 覆盖预加载的配置
  │
  └─ [失败] 拒绝握手 (HTTP 400/403/404)
```

**多设备并发连接**：

- 同一用户可同时建立多个 WebSocket 连接，每个连接关联不同的 `deviceId`
- 后端需维护 `connectionId → deviceId` 的映射关系
- 同一设备可被多个连接关联（如用户在多个标签页打开同一设备的聊天页面）
- 设备被删除时，应断开所有关联的 WebSocket 连接

---

### 2.5 错误处理与异常场景汇总

本节汇总所有设备模块相关的异常场景及后端预期行为，便于后端开发人员统一处理。

#### 2.5.1 激活虚拟设备异常场景

| 场景                | 触发条件                                             | HTTP 状态码 | 响应                                                                                                                            |
| ------------------- | ---------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Token 无效/过期     | `x-access-token` 解析失败                            | 200         | `{ success: false, message: "Invalid or expired access token" }`                                                                |
| 虚拟设备数量超限    | 该用户已有 5 个 `type='virtual'` 设备                | 200         | `{ success: false, message: "Cannot create more than 5 virtual devices" }`                                                      |
| SN 生成冲突重试耗尽 | 随机生成的 identifier 连续 3 次冲突                  | 200         | `{ success: false, message: "Failed to activate virtual device" }`                                                              |
| 数据库写入失败      | 事务执行异常                                         | 200         | `{ success: false, message: "Internal server error" }`                                                                          |
| 并发创建超限        | 多个请求同时到达，事务内数量校验通过但插入后超出限制 | 200         | 应通过数据库唯一约束和事务隔离级别防止，若发生则返回 `{ success: false, message: "Cannot create more than 5 virtual devices" }` |

#### 2.5.2 解绑设备异常场景

| 场景               | 触发条件                        | HTTP 状态码 | 响应                                                                           |
| ------------------ | ------------------------------- | ----------- | ------------------------------------------------------------------------------ |
| Token 无效/过期    | `x-access-token` 解析失败       | 200         | `{ success: false, message: "Invalid or expired access token" }`               |
| deviceId 格式无效  | 非 UUID v4 格式                 | 200         | `{ success: false, message: "Invalid deviceId format" }`                       |
| 设备不存在         | 数据库中无此 id 的记录          | 200         | `{ success: false, message: "Device not found" }`                              |
| 无权限操作         | 设备 `ownerId` 与当前用户不匹配 | 200         | `{ success: false, message: "Access denied: device does not belong to user" }` |
| 级联删除部分失败   | 关联数据删除异常                | 200         | 建议事务回滚，返回 `{ success: false, message: "Internal server error" }`      |
| 设备有活跃 WS 连接 | 正在聊天的设备被删除            | 200         | 删除成功后主动断开 WS 连接，返回 `{ success: true }`                           |

#### 2.5.3 获取设备列表异常场景

| 场景            | 触发条件                  | HTTP 状态码 | 响应                                                             |
| --------------- | ------------------------- | ----------- | ---------------------------------------------------------------- |
| Token 无效/过期 | `x-access-token` 解析失败 | 200         | `{ success: false, message: "Invalid or expired access token" }` |
| 用户无设备      | 该用户无任何设备记录      | 200         | `{ success: true, data: { devices: [] } }`                       |

#### 2.5.4 WebSocket 连接异常场景

| 场景                        | 触发条件                             | 处理方式                                                     |
| --------------------------- | ------------------------------------ | ------------------------------------------------------------ |
| token 参数缺失或无效        | URL 中无 token 或 token 解析失败     | 拒绝握手，HTTP 401                                           |
| deviceId 格式无效           | `deviceId` 非 UUID v4                | 拒绝握手，HTTP 400                                           |
| deviceId 设备不存在         | 数据库中无此设备                     | 拒绝握手，HTTP 404                                           |
| deviceId 设备不属于当前用户 | `ownerId !== userId`                 | 拒绝握手，HTTP 403                                           |
| 设备在连接期间被删除        | 另一端点删除了该设备                 | 主动断开 WebSocket 连接，发送 `chatComplete` 带错误信息      |
| 设备配置更新                | 用户在设备配置页修改了 voiceStyle 等 | 下次建立新连接时生效；当前连接需通过 `updateConfig` 消息更新 |

#### 2.5.5 通用异常处理原则

1. **HTTP 状态码**：本项目约定业务错误统一返回 HTTP 200，通过 `success: false` 区分；仅网络层/服务端异常返回 4xx/5xx
2. **message 字段**：应使用英文标准错误描述（见 2.0.3 节错误码表），前端根据 message 匹配 i18n 文案
3. **事务安全**：所有写操作应在数据库事务中执行，失败时完整回滚
4. **日志记录**：所有错误场景应记录详细日志（包括 userId、deviceId、错误原因），便于排查
5. **敏感信息**：错误响应不应暴露数据库结构、内部实现细节等敏感信息

---

## 3. 技术架构说明

### 3.1 虚拟设备数据结构

```
DeviceInfo
├── id: string                # UUID，设备唯一标识
├── identifier: string         # SN 序列号 (如 LEBOT-V-A1B2C3D4)
├── type: 'robot' | 'virtual'  # 设备类型
├── model: string              # 设备型号
├── name: string | null        # 用户自定义名称
├── status: unknown            # 设备状态
├── config.voiceStyle: string  # 语音风格配置
├── ownerId: number            # 所有者用户 ID
├── createdAt / updatedAt      # 时间戳
└── boundPhysicalDeviceId?     # [预留] 绑定的物理设备 ID
```

### 3.2 设备状态管理架构

```
┌─────────────────────────────────────────────────┐
│                  Pinia Store                     │
│                 (persist: true)                  │
├─────────────────────────────────────────────────┤
│  devices: DeviceInfo[]     ← 持久化到 localStorage │
│  currentDevice: DeviceInfo  ← 当前活跃设备        │
│  virtualDevices: computed   ← type==='virtual'   │
├─────────────────────────────────────────────────┤
│  addDevice()        → 添加设备 + 上限校验         │
│  removeDevice()     → 移除设备 + 自动切换        │
│  setCurrentDevice()  → 切换活跃设备              │
│  updateDevices()    → 批量更新 (后端同步)         │
└─────────────────────────────────────────────────┘
         ↕                     ↕
   ┌──────────┐          ┌──────────┐
   │ API 调用  │          │ WebSocket│
   │ (axios)  │          │ 连接     │
   └──────────┘          └──────────┘
         ↕                     ↕
   ┌──────────────────────────────────┐
   │        后端服务 (le-bot-backend)   │
   └──────────────────────────────────┘
```

**多设备切换机制**:

1. 用户进入设备列表页 → 点击某个设备卡片
2. 调用 `setCurrentDevice(id)` 更新 `currentDevice`
3. 跳转到设备配置页 `/stack/device-config`
4. 配置页通过 `storeToRefs` 响应式获取最新 `currentDevice`
5. 进入聊天页时，`connect(token, currentDevice.id)` 携带 `deviceId`

### 3.3 WebSocket 设备标识机制

```
ChatPage.vue
  │
  ├─ 获取 currentDevice.id  (来自 useDeviceStore)
  │
  └─ connect(accessToken, deviceId)
       │
       ├─ 组装 URL: ws://host/api/v1/chat/ws?token=xxx&deviceId=yyy
       │
       ├─ WsWrapper 建立连接
       │   ├─ onopen → establishConnection
       │   ├─ sendUpdateConfig() → voiceId, timezone, outputText 等
       │   └─ onmessage → inputAudioStream / outputAudioStream ...
       │
       └─ 后端根据 deviceId 关联设备配置
```

**无 deviceId 时 (物理设备/向后兼容)**:

```
connect(accessToken)  // 不传 deviceId
  → URL: ws://host/api/v1/chat/ws?token=xxx
  → 后端按原有物理设备逻辑处理
```

---

## 4. 实现要点

### 4.1 向后兼容性

| 场景                             | 处理方式                                           |
| -------------------------------- | -------------------------------------------------- |
| 现有 `DeviceType = 'robot'` 逻辑 | 联合类型 `'robot' \| 'virtual'` 不影响原有类型判断 |
| 现有 `updateDevices()`           | 方法签名和行为完全不变                             |
| WebSocket `connect(token)`       | `deviceId` 为可选参数，不传时行为不变              |
| DeviceConfigPage 物理设备解绑    | `isVirtual === false` 时仍调用 `logoutAccount()`   |
| 物理设备 API                     | `retrieveMine` 仍返回所有设备，Store 统一存储      |

### 4.2 数量限制策略

- **前端硬限制**: `MAX_VIRTUAL_DEVICES = 5`，添加按钮在达到上限时 `disabled`
- **Store 层校验**: `addDevice()` 在写入前检查 `virtualDevices.length >= 5`
- **后端兜底校验**: API 层需二次校验，防止绕过前端直接请求

### 4.3 防并发重复请求

- 添加按钮点击后立即设置 `isActivating = true`
- `handleActivate()` 开头检查 `isActivating` 状态，防止重复触发
- `finally` 块中重置状态，确保异常情况下也能恢复

### 4.4 Store 持久化

- `pinia-plugin-persistedstate` 全局开启，`persist: true`
- localStorage key 格式: `ai-pet-team.le-bot-frontend.device`
- 设备列表在页面刷新/关闭后依然保留
- PWA 离线场景：已加载的设备列表从 localStorage 恢复，但激活/解绑操作需在线

### 4.5 扩展性设计

**物理设备绑定预留**:

`DeviceInfo.boundPhysicalDeviceId` 字段当前始终为 `null`。未来实现虚拟设备绑定物理设备流程时：

1. 在设备配置页新增"绑定物理设备"入口
2. 调用新的绑定 API (如 `POST /devices/{virtualId}/bind/{physicalId}`)
3. 后端更新关联关系，返回更新后的 `DeviceInfo`
4. 前端 Store 更新该设备记录

**WebSocket 扩展**:

- `useChatSession.connect()` 的 `deviceId` 参数已在签名中预留
- 未来可扩展更多参数（如 `WsConnectOptions` 对象）而无需再次修改接口

### 4.6 错误处理流程

```
激活流程异常处理:
  API 返回 success:false
    → activateAndAddVirtualDevice() 抛出 Error(message)
    → DevicesPage.handleActivate() catch 块
    → Notify.create({ type: 'negative' })
    → isActivating 重置为 false
    → 设备列表不变

解绑流程异常处理:
  API 返回 success:false
    → unbindAndRemoveDevice() 抛出 Error(message)
    → DevicesPage.handleUnbind() catch 块
    → Notify.create({ type: 'negative' })
    → 弹窗关闭 (unbindingDeviceId = null)
    → 设备列表不变

网络异常:
  axios 抛出错误
    → 工具函数向上传播
    → 页面层 catch 块统一处理
    → 用户看到错误通知，UI 恢复正常状态
```

---

## 5. 数据流图

### 5.1 虚拟设备激活流程

```
用户点击 [添加虚拟乐宝]
    │
    ├─ isActivating = true (锁定按钮)
    │
    ▼
activateAndAddVirtualDevice()
    │
    ├─ 获取 accessToken (useAuthStore)
    │
    ├─ POST /api/v1/devices/virtual/activate
    │     Headers: x-access-token
    │
    ├─ 后端: 生成 SN → 写入 DB → 返回 DeviceInfo
    │
    ├─ response.success === true?
    │     YES → Store.addDevice(device)
    │           │
    │           ├─ 校验 virtualDevices.length < 5
    │           ├─ devices.push(device)
    │           ├─ 若无 currentDevice 则设为该设备
    │           └─ localStorage 自动持久化
    │           │
    │           └─ Notify "激活成功"
    │
    │     NO  → throw Error(response.message)
    │            └─ Notify "激活失败"
    │
    └─ isActivating = false (解锁按钮)
```

### 5.2 虚拟设备聊天流程

```
用户进入 ChatPage
    │
    ├─ 从 Store 获取 currentDevice (虚拟设备)
    │
    ├─ connect(accessToken, currentDevice.id)
    │     │
    │     ├─ wsUrl = "wss://host/.../chat/ws?token=xxx&deviceId=yyy"
    │     │
    │     ├─ WsWrapper 建立 WebSocket
    │     │     ├─ onopen → connectionState = 'connected'
    │     │     ├─ establishConnection ← 后端识别 deviceId
    │     │     └─ sendUpdateConfig() → voiceId, timezone...
    │     │
    │     ├─ 初始化麦克风、录音器
    │     ├─ ChatPage: 启动静音检测、唤醒词监听
    │     ├─ VoiceCallPage: 启动本地 RMS 语音门控，静音时只保留短预卷、不上传
    │     │
    │     └─ 音频流收发:
    │           inputAudioStream  (前端 → 后端；电话模式仅语音/预卷分片)
    │           inputAudioComplete(前端 → 后端；话轮结束事件，buffer 可为空)
    │           outputAudioStream (后端 → 前端)
    │           outputTextStream  (后端 → 前端)
    │           cancelOutput      (后端 → 前端；语音打断时 cancelType=voice)
    │           chatComplete      (后端 → 前端)
```

### 5.3 设备解绑流程

```
用户点击 [解绑] (DeviceConfigPage 或 DevicesPage)
    │
    ├─ 弹出确认对话框 (q-dialog)
    │
    ├─ 用户确认
    │
    ▼
unbindAndRemoveDevice(deviceId)
    │
    ├─ DELETE /api/v1/devices/{deviceId}
    │     Headers: x-access-token
    │
    ├─ response.success === true?
    │     YES → Store.removeDevice(deviceId)
    │           │
    │           ├─ devices.splice(index, 1)
    │           ├─ 若 currentDevice 被移除 → 自动切换为 devices[0]
    │           └─ localStorage 自动更新
    │           │
    │           └─ Notify "解绑成功" + 跳转 /stack/devices
    │
    │     NO  → Notify "解绑失败"，设备列表不变
    │
    └─ 对话框关闭
```

---

## 附录: 文件变更清单

| #   | 操作     | 文件路径                               | 变更行数  |
| --- | -------- | -------------------------------------- | --------- |
| 1   | 修改     | `src/stores/device/types.ts`           | +6 / -1   |
| 2   | 修改     | `src/types/api/device.ts`              | +21       |
| 3   | 修改     | `src/utils/api/device.ts`              | +23 / -1  |
| 4   | 修改     | `src/stores/device/index.ts`           | +40 / -1  |
| 5   | 修改     | `src/utils/device.ts`                  | +43 / -1  |
| 6   | **新建** | `src/pages/stack/DevicesPage.vue`      | +181      |
| 7   | 修改     | `src/router/routes.ts`                 | +8        |
| 8   | 修改     | `src/components/home/DeviceCard.vue`   | +44 / -15 |
| 9   | 修改     | `src/composables/useChatSession.ts`    | +5 / -4   |
| 10  | 修改     | `src/pages/stack/DeviceConfigPage.vue` | +33 / -3  |
| 11  | 修改     | `src/i18n/en-US/index.ts`              | +24       |

**总计**: 1 个新建文件, 10 个修改文件
