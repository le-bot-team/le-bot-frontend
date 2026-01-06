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
