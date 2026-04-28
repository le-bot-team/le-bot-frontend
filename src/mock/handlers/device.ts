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
 *   DELETE /devices/:deviceId
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
      ownerId: 1,
      type: 'virtual',
      model: 'virtual-device',
      name: null,
      status: {},
      config: null,
      boundPhysicalDeviceId: null,
    };

    devices.push(newDevice);
    console.log(`[Mock Device] Virtual device activated: ${newDevice.id}`);
    return [200, mockSuccess({ device: newDevice })];
  });

  // Unbind / delete a device
  mock.onDelete(/\/devices\/([^/]+)$/).reply((config: { url?: string }) => {
    const deviceId = config.url?.split('/').pop();
    const index = devices.findIndex((d) => d.id === deviceId);

    if (index === -1) {
      return [200, mockError('设备不存在')];
    }

    devices.splice(index, 1);
    console.log(`[Mock Device] Device removed: ${deviceId}`);
    return [200, mockSuccess(undefined)];
  });
}
