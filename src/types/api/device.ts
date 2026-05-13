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
    };
