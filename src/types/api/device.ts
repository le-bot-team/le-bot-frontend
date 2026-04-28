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

export type UnbindDeviceResponse =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
    };
