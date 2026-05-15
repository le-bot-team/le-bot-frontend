export type DeviceType = 'robot' | 'virtual';

/** Maximum number of virtual devices a user can create */
export const MAX_VIRTUAL_DEVICES = 5;

export interface ChildInfo {
  name: string;
  gender: 'boy' | 'girl';
  birthday: string;
}

export interface DeviceInfo {
  id: string;
  createdAt: string | null;
  updatedAt: string | null;
  identifier: string;
  ownerId: string;
  type: DeviceType;
  model: string;
  name: string | null;
  status: unknown;
  config: {
    voiceStyle: string;
    aiPersonality?: {
      enabled: boolean;
      traits?: string;
      goals?: string;
    };
  } | null;
  /** Reserved for future physical device binding — null for standalone virtual devices */
  boundPhysicalDeviceId?: string | null;
  /** AI agent ID associated with this device */
  agentId?: string | null;
  /** Xiaozhi (小智) device ID for physical device integration */
  xiaozhiDeviceId?: string | null;
  /** Child info associated with this device (front-end family group association) */
  childInfo?: ChildInfo | null;
}
