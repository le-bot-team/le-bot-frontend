import type { DeviceInfo } from 'stores/device/types';

/**
 * Preset mock devices returned by the /devices/mine endpoint.
 * Includes one robot device and two virtual devices.
 */
export const MOCK_DEVICES: DeviceInfo[] = [
  {
    id: 'mock-robot-device-00000000-0000-0000-0000-000000000001',
    createdAt: '2024-06-01T08:00:00.000Z',
    updatedAt: '2024-06-15T10:30:00.000Z',
    identifier: 'lebot-robot-001',
    ownerId: 'mock-owner-00000000-0000-0000-0000-000000000001',
    type: 'robot',
    model: 'leBot-v1',
    name: '我的乐宝机器人',
    status: {},
    config: {
      voiceStyle: 'xiaole',
    },
    boundPhysicalDeviceId: null,
    agentId: null,
    xiaozhiDeviceId: null,
    childInfo: null,
  },
  {
    id: 'mock-virtual-device-00000000-0000-0000-0000-000000000002',
    createdAt: '2024-07-01T08:00:00.000Z',
    updatedAt: null,
    identifier: 'virtual-device-001',
    ownerId: 'mock-owner-00000000-0000-0000-0000-000000000001',
    type: 'virtual',
    model: 'virtual-device',
    name: '测试虚拟设备',
    status: {},
    config: null,
    boundPhysicalDeviceId: null,
    agentId: null,
    xiaozhiDeviceId: null,
    childInfo: {
      name: '小新',
      gender: 'boy',
      birthday: '2021-05-05',
    },
  },
  {
    id: 'mock-virtual-device-00000000-0000-0000-0000-000000000003',
    createdAt: '2024-08-01T08:00:00.000Z',
    updatedAt: null,
    identifier: 'virtual-device-002',
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
  },
];
