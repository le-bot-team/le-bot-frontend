export type DeviceType = 'robot';

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
}

/** Child information associated with a family group */
export interface ChildInfo {
  name: string;
  gender: 'boy' | 'girl';
  birthday: string;
}
