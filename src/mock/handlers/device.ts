import type MockAdapter from 'axios-mock-adapter';

import { MOCK_DEVICES } from 'src/mock/data/device';
import { mockError, mockId, mockSuccess } from 'src/mock/utils';
import { MAX_VIRTUAL_DEVICES } from 'stores/device/types';

import type { DeviceInfo } from 'stores/device/types';

/** Mutable copy of devices that mock endpoints operate on */
const devices: DeviceInfo[] = [...MOCK_DEVICES];

/**
 * Register mock handlers for the device module:
 *   GET    /devices/mine
 *   POST   /devices/virtual/activate
 *   POST   /devices/unbind
 *   POST   /devices/bind (physical device binding)
 */
export function setupDeviceMock(mock: MockAdapter): void {
  // Retrieve my devices
  mock.onGet('/devices/mine').reply(() => {
    return [200, mockSuccess({ devices: [...devices] })];
  });

  // Activate a virtual device
  mock.onPost('/devices/virtual/activate').reply(() => {
    const virtualCount = devices.filter((d) => d.type === 'virtual').length;
    if (virtualCount >= MAX_VIRTUAL_DEVICES) {
      return [200, mockError('虚拟设备数量已达上限')];
    }

    const newDevice: DeviceInfo = {
      id: mockId(),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      identifier: `virtual-${mockId().slice(0, 8)}`,
      ownerId: 'mock-owner-00000000-0000-0000-0000-000000000001',
      type: 'virtual',
      model: 'virtual-device',
      name: null,
      status: {},
      config: null,
      boundPhysicalDeviceId: null,
      agentId: null,
      xiaozhiDeviceId: null,
      childInfo: null,
    };

    devices.push(newDevice);
    console.log(`[Mock Device] Virtual device activated: ${newDevice.id}`);
    return [200, mockSuccess({ device: newDevice })];
  });

  // Bind a physical device
  mock.onPost('/devices/bind').reply(() => {
    const newDevice: DeviceInfo = {
      id: mockId(),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      identifier: `robot-${mockId().slice(0, 8)}`,
      ownerId: 'mock-owner-00000000-0000-0000-0000-000000000001',
      type: 'robot',
      model: 'leBot-v1',
      name: null,
      status: {},
      config: { voiceStyle: 'xiaole' },
      boundPhysicalDeviceId: null,
      agentId: null,
      xiaozhiDeviceId: null,
      childInfo: null,
    };

    devices.push(newDevice);
    console.log(`[Mock Device] Physical device bound: ${newDevice.id}`);
    return [200, mockSuccess({ device: newDevice })];
  });

  // Unbind a device (POST /devices/unbind with { deviceId })
  mock.onPost('/devices/unbind').reply((config: { data?: string }) => {
    let deviceId: string | undefined;
    try {
      const body = JSON.parse(config.data || '{}');
      deviceId = body.deviceId;
    } catch {
      return [200, mockError('无效请求')];
    }

    const index = devices.findIndex((d) => d.id === deviceId);

    if (index === -1) {
      return [200, mockError('设备不存在')];
    }

    devices.splice(index, 1);
    console.log(`[Mock Device] Device removed: ${deviceId}`);
    return [200, mockSuccess(undefined)];
  });
}
