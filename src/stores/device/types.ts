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
