# 前端设备绑定/解绑接口适配指南

> 本文档面向前端开发同事，描述 le-bot-backend 新增的设备绑定/解绑接口及前端需要的适配工作。

## 背景

后端已接入小智（xiaozhi）设备管理系统，新增了两个接口：

- `POST /api/v1/devices/bind` — 绑定设备
- `POST /api/v1/devices/unbind` — 解绑设备

前端需要新增"添加设备"流程，并将 `DeviceConfigPage.vue` 中的解绑按钮对接到新接口。

---

## 接口定义

### 1. 绑定设备

```
POST /api/v1/devices/bind
Headers:
  x-access-token: <accessToken>
Content-Type: application/json
```

**请求体：**

```typescript
{
  macAddress: string   // 设备 MAC 地址，如 "aa:bb:cc:dd:ee:ff"
  board: string        // 硬件型号，如 "esp32s3"
  appVersion: string   // 固件版本号，如 "1.0.0"
  name?: string        // 可选，设备别名，如 "客厅机器人"
}
```

**成功响应 (200)：**

```typescript
{
  success: true,
  data: {
    device: {
      id: string           // UUID，本地设备 ID
      createdAt: string | null
      updatedAt: string | null
      identifier: string   // = macAddress
      ownerId: string      // 用户 UUID
      type: "robot"
      model: string        // = board
      name: string | null
      status: unknown
      config: unknown
      agentId: string | null       // 新增：小智智能体 ID
      xiaozhiDeviceId: string | null  // 新增：小智设备 ID (= MAC)
    }
  }
}
```

**错误响应：**

| HTTP 状态码 | 场景 | 响应体 |
|------------|------|--------|
| 409 | MAC 地址已被绑定 | `{ success: false, message: "Device already bound" }` |
| 502 | 小智后端不可用 / 创建失败 | `{ success: false, message: "Failed to ..." }` |

---

### 2. 解绑设备

```
POST /api/v1/devices/unbind
Headers:
  x-access-token: <accessToken>
Content-Type: application/json
```

**请求体：**

```typescript
{
  deviceId: string  // 本地设备 UUID（即 DeviceInfo.id）
}
```

**成功响应 (200)：**

```typescript
{
  success: true
}
```

**错误响应：**

| HTTP 状态码 | 场景 | 响应体 |
|------------|------|--------|
| 403 | 设备不属于当前用户 | `{ success: false, message: "Device does not belong to you" }` |
| 404 | 设备不存在 | `{ success: false, message: "Device not found" }` |
| 502 | 小智后端不可用 | `{ success: false, message: "Failed to ..." }` |

---

### 3. 查询我的设备（已有接口，无变更）

```
GET /api/v1/devices/mine
Headers:
  x-access-token: <accessToken>
```

**响应体不变**，但 `DeviceInfo` 类型新增了两个可选字段（见下文）。

---

## 前端适配清单

### 1. 更新类型定义

**`src/stores/device/types.ts`** — `DeviceInfo` 新增字段：

```typescript
export interface DeviceInfo {
  id: string;
  createdAt: string | null;
  updatedAt: string | null;
  identifier: string;
  ownerId: string;            // 注意：后端类型是 string (UUID)，不是 number
  type: DeviceType;
  model: string;
  name: string | null;
  status: unknown;
  config: {
    voiceStyle: string;
  } | null;
  agentId: string | null;            // 新增
  xiaozhiDeviceId: string | null;    // 新增
}
```

**`src/types/api/device.ts`** — 新增请求/响应类型：

```typescript
// 绑定设备
export interface BindDeviceRequest {
  macAddress: string;
  board: string;
  appVersion: string;
  name?: string;
}

export type BindDeviceResponse =
  | { success: false; message: string }
  | { success: true; data: { device: DeviceInfo } };

// 解绑设备
export interface UnbindDeviceRequest {
  deviceId: string;
}

export type UnbindDeviceResponse =
  | { success: false; message: string }
  | { success: true };
```

---

### 2. 新增 API 函数

**`src/utils/api/device.ts`** — 添加两个函数：

```typescript
import { api } from 'boot/axios';
import type {
  RetrieveMineResponse,
  BindDeviceRequest,
  BindDeviceResponse,
  UnbindDeviceRequest,
  UnbindDeviceResponse,
} from 'src/types/api/device';

export const retrieveMine = async (accessToken: string) =>
  await api.get<RetrieveMineResponse>('/devices/mine', {
    headers: { 'x-access-token': accessToken },
  });

export const bindDevice = async (accessToken: string, data: BindDeviceRequest) =>
  await api.post<BindDeviceResponse>('/devices/bind', data, {
    headers: { 'x-access-token': accessToken },
  });

export const unbindDevice = async (accessToken: string, deviceId: string) =>
  await api.post<UnbindDeviceResponse>('/devices/unbind', { deviceId }, {
    headers: { 'x-access-token': accessToken },
  });
```

---

### 3. 更新 Device Store

**`src/stores/device/index.ts`** — 添加绑定/解绑 actions：

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { DeviceInfo } from 'stores/device/types';

export const useDeviceStore = defineStore(
  'device',
  () => {
    const currentDevice = ref<DeviceInfo>();
    const devices = ref<DeviceInfo[]>([]);

    const updateDevices = (newDevices: DeviceInfo[] = []) => {
      devices.value = newDevices;
      currentDevice.value = newDevices[0];
    };

    // 新增：绑定成功后将新设备加入列表
    const addDevice = (device: DeviceInfo) => {
      devices.value.push(device);
      if (!currentDevice.value) {
        currentDevice.value = device;
      }
    };

    // 新增：解绑成功后从列表移除
    const removeDevice = (deviceId: string) => {
      devices.value = devices.value.filter((d) => d.id !== deviceId);
      if (currentDevice.value?.id === deviceId) {
        currentDevice.value = devices.value[0];
      }
    };

    return {
      currentDevice,
      devices,
      updateDevices,
      addDevice,     // 新增
      removeDevice,  // 新增
    };
  },
  { persist: true },
);
```

---

### 4. 实现绑定设备页面/对话框

需要新建一个页面或对话框（如 `AddDevicePage.vue` 或 `AddDeviceDialog.vue`），完成以下流程：

```
┌─────────────────────────────────────────────────┐
│            添加设备流程（用户视角）                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ① 用户点击"添加设备"按钮                        │
│     ↓                                           │
│  ② App 连接设备热点/蓝牙                         │
│     获取设备信息（MAC 地址、硬件型号、固件版本）    │
│     ↓                                           │
│  ③ 用户确认设备信息，可选填设备别名               │
│     ↓                                           │
│  ④ App 调用 POST /api/v1/devices/bind           │
│     ↓                                           │
│  ⑤ 成功 → 刷新设备列表，跳转到设备主页            │
│     失败 → 显示错误提示                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

**关键 UI 状态：**

| 状态 | 显示内容 |
|------|----------|
| 连接中 | "正在连接设备..." + loading |
| 已获取设备信息 | 显示 MAC、型号、版本 + 别名输入框 + "确认绑定"按钮 |
| 绑定中 | "正在绑定设备..." + loading |
| 绑定成功 | 成功提示 → 跳转 |
| 绑定失败 (409) | "该设备已被绑定，请先解绑后重试" |
| 绑定失败 (502) | "服务暂时不可用，请稍后重试" |

**设备信息获取方式：**

设备信息（MAC 地址、型号、固件版本）的具体获取方式取决于 App 与设备的通信方式（热点 / BLE）。这部分逻辑需要与硬件/嵌入式同事确认，前端只需将获取到的信息传递给绑定接口即可。

---

### 5. 对接解绑功能

**`src/pages/stack/DeviceConfigPage.vue`** 中现有的解绑按钮调用的是 `logoutAccount`（退出登录），需改为调用解绑接口：

```vue
<script setup lang="ts">
// ... 现有 imports ...
import { useAuthStore } from 'stores/auth';
import { useDeviceStore } from 'stores/device';
import { unbindDevice } from 'src/utils/api/device';

const authStore = useAuthStore();
const deviceStore = useDeviceStore();

const handleUnbind = async () => {
  const device = deviceStore.currentDevice;
  if (!device) return;

  // 确认对话框
  // ... 省略 Quasar Dialog 确认逻辑 ...

  try {
    const { data } = await unbindDevice(authStore.accessToken, device.id);
    if (data.success) {
      deviceStore.removeDevice(device.id);
      // 返回上一页或跳转到设备列表
      router.go(-1);
    } else {
      // 显示错误提示
    }
  } catch (err) {
    // 网络错误处理
  }
};
</script>

<template>
  <!-- ... -->
  <q-btn color="red" :label="i18n('labels.unbindDevice')" @click="handleUnbind" />
</template>
```

---

### 6. 路由（如新建页面）

如果新建独立的添加设备页面，需在 `src/router/routes.ts` 中添加路由：

```typescript
{
  path: '/stack/add-device',
  component: () => import('pages/stack/AddDevicePage.vue'),
}
```

---

## 完整数据流图

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   用户 App    │────▶│  le-bot-backend  │────▶│ xiaozhi manager  │────▶│ xiaozhi-server│
│  (Vue/Quasar) │     │  (Elysia :3000)  │     │   -api (:8002)   │     │  (WS :8000)  │
├──────────────┤     ├─────────────────┤     ├──────────────────┤     ├──────────────┤
│ POST /bind   │────▶│ 查/创建 agent   │────▶│ POST /agent      │     │              │
│ {mac, board} │     │ 注册设备         │────▶│ POST /manual-add │     │              │
│              │     │ 写入本地 DB      │     │                  │     │              │
├──────────────┤     ├─────────────────┤     ├──────────────────┤     ├──────────────┤
│ POST /unbind │────▶│ 解绑设备         │────▶│ POST /unbind     │     │              │
│ {deviceId}   │     │ 删除本地记录     │     │                  │     │              │
├──────────────┤     ├─────────────────┤     │                  │     ├──────────────┤
│ WS /xiaozhi  │────▶│ 代理 WebSocket   │─────────────────────────────▶│ AI 对话      │
│ /ws?token=.. │     │ 双向转发         │     │                  │     │ VAD→ASR→LLM  │
└──────────────┘     └─────────────────┘     └──────────────────┘     │ →TTS         │
                                                                      └──────────────┘
```

---

## 注意事项

1. **`DeviceInfo.ownerId` 类型变更**：后端返回的是 `string`（UUID），前端现有类型定义为 `number`，需更新为 `string`
2. **绑定后刷新设备列表**：绑定成功后建议调用 `retrieveMine()` 重新拉取完整列表，确保数据一致性
3. **设备信息来源**：`macAddress`、`board`、`appVersion` 需要通过设备热点/BLE 获取，前端需要对接设备通信层（Capacitor 插件 / Web Bluetooth API 等）
4. **错误码处理**：Axios 对非 2xx 状态码会抛异常，需要在 catch 中读取 `error.response.data` 获取 `{ success, message }`
5. **解绑确认**：解绑操作不可撤销（小智侧设备记录会被删除），建议加二次确认对话框
