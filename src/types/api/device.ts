import type { DeviceInfo } from 'stores/device/types';

export type RetrieveMineResponse =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      data: {
        devices: DeviceInfo[];
      };
    };

export interface ActivateVirtualDeviceRequest {
  name?: string;
  childInfo?: {
    name: string;
    age?: number;
    gender?: 'male' | 'female' | 'boy' | 'girl';
    birthday?: string;
    avatar?: string | undefined;
  };
  config?: DeviceInfo['config'];
}

export type ActivateVirtualDeviceResponse =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      data: {
        device: DeviceInfo;
      };
    };

export interface BindDeviceRequest {
  macAddress: string;
  board?: string;
  appVersion?: string;
  name?: string;
}

export type BindDeviceResponse =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      data: {
        device: DeviceInfo;
      };
    };

export interface UnbindDeviceRequest {
  deviceId: string;
}

export type UnbindDeviceResponse =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      data?: undefined;
    };
