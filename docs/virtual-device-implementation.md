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

### 2.1 激活虚拟设备

创建新的虚拟设备，后端负责生成唯一 SN (序列号/identifier) 并将其加入设备维护列表。

```
POST /api/v1/devices/virtual/activate
```

**请求头**:

| Header           | Value                 |
| ---------------- | --------------------- |
| `Content-Type`   | `application/json`    |
| `x-access-token` | `<用户 access token>` |

**请求体**:

```json
{}
```

> 当前请求体为空，因为所有必要信息（用户身份、设备类型=virtual）均可从 token 和路由推导。后续如需传入设备名称等参数可扩展。

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "device": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "identifier": "LEBOT-V-A1B2C3D4",
      "ownerId": 123,
      "type": "virtual",
      "model": "virtual-lebot-v1",
      "name": null,
      "status": "active",
      "config": {
        "voiceStyle": "default"
      },
      "createdAt": "2026-04-25T10:30:00.000Z",
      "updatedAt": null,
      "boundPhysicalDeviceId": null
    }
  }
}
```

**失败响应** (200):

```json
{
  "success": false,
  "message": "Cannot create more than 5 virtual devices"
}
```

**后端实现要求**:

| 要求        | 说明                                                     |
| ----------- | -------------------------------------------------------- |
| SN 生成规则 | 建议格式 `LEBOT-V-XXXXXXXX` (8位大写字母+数字)，全局唯一 |
| 数量限制    | 每个用户最多 5 个 `type === 'virtual'` 的设备            |
| 状态设置    | 新建设备 `status` 应为 `"active"`                        |
| 配置初始化  | `config.voiceStyle` 默认值 `"default"`                   |
| 时间戳      | `createdAt` 设置为服务器当前时间                         |

---

### 2.2 解绑/删除设备

删除指定设备（物理设备或虚拟设备均可）。

```
DELETE /api/v1/devices/{deviceId}
```

**请求头**:

| Header           | Value                 |
| ---------------- | --------------------- |
| `x-access-token` | `<用户 access token>` |

**路径参数**:

| 参数       | 类型            | 说明            |
| ---------- | --------------- | --------------- |
| `deviceId` | `string` (UUID) | 要删除的设备 ID |

**成功响应** (200):

```json
{
  "success": true
}
```

**失败响应** (200):

```json
{
  "success": false,
  "message": "Device not found or access denied"
}
```

**后端实现要求**:

| 要求     | 说明                                                     |
| -------- | -------------------------------------------------------- |
| 权限校验 | 仅允许设备所有者 (`ownerId`) 删除                        |
| 级联处理 | 删除设备时应清理相关的会话记录、WebSocket 连接等关联数据 |
| 幂等性   | 重复删除已不存在的设备应返回 `success: false`            |

---

### 2.3 获取我的设备 (已有接口，需扩展)

此接口已存在，但需要扩展返回数据以包含虚拟设备。

```
GET /api/v1/devices/mine
```

**请求头**:

| Header           | Value                 |
| ---------------- | --------------------- |
| `x-access-token` | `<用户 access token>` |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "...",
        "identifier": "PHYSICAL-ROBOT-01",
        "type": "robot",
        "model": "lebot-v1",
        "...": "..."
      },
      {
        "id": "550e8400-...",
        "identifier": "LEBOT-V-A1B2C3D4",
        "type": "virtual",
        "model": "virtual-lebot-v1",
        "...": "..."
      }
    ]
  }
}
```

**变更要求**: 返回的 `devices[]` 中应**同时包含** `type: "robot"` 和 `type: "virtual"` 的设备，前端 Store 的 `updateDevices()` 会统一存储。

---

### 2.4 WebSocket 握手协议扩展

WebSocket 连接 URL 增加可选的 `deviceId` 查询参数。

**连接 URL 格式**:

```
wss://<host>/api/v1/chat/ws?token=<accessToken>&deviceId=<deviceId>
```

| 参数       | 必填 | 说明                                       |
| ---------- | ---- | ------------------------------------------ |
| `token`    | 是   | 用户 access token                          |
| `deviceId` | 否   | 虚拟设备 ID (UUID)，不传则表示物理设备模式 |

**后端处理逻辑**:

1. 收到连接请求后，根据 `deviceId` 查询对应设备信息
2. 如果 `deviceId` 存在，加载该虚拟设备的配置 (`voiceStyle`, `voiceId` 等)
3. 如果 `deviceId` 不存在或为空，保持原有物理设备逻辑
4. 后续所有 WebSocket 消息（`inputAudioStream`, `outputAudioStream` 等）应关联到该设备

**与现有 `WsUpdateConfigRequest` 的关系**:

当前前端在 `establishConnection` 后立即发送 `WsUpdateConfigRequest` 携带 `voiceId` 等配置。增加 `deviceId` 参数后，后端可以：

- 在握手阶段就确定设备身份
- 预加载设备配置，减少后续 `updateConfig` 消息的延迟

`WsUpdateConfigRequest` 现有字段（保持不变）:

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
    │     ├─ 启动静音检测、唤醒词监听
    │     │
    │     └─ 音频流收发:
    │           inputAudioStream  (前端 → 后端)
    │           outputAudioStream (后端 → 前端)
    │           outputTextStream  (后端 → 前端)
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
