export type DeviceType = 'robot';

export interface DeviceConfig {
  voiceStyle?: string;
  language?: string;
  personality?: {
    traits: string;
    goals: string;
    selectedTraits: string[];
    selectedGoals: string[];
  };
}

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
  config: DeviceConfig | null;
}
