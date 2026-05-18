import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { DeviceConfig, DeviceInfo } from 'stores/device/types';

export const useDeviceStore = defineStore(
  'device',
  () => {
    const currentDevice = ref<DeviceInfo>();
    const devices = ref<DeviceInfo[]>([]);

    const updateDevices = (newDevices: DeviceInfo[] = []) => {
      devices.value = newDevices;
      currentDevice.value = newDevices[0];
    };

    const updateCurrentDeviceConfig = (patch: Partial<DeviceConfig>) => {
      if (!currentDevice.value) return;
      currentDevice.value.config = {
        ...(currentDevice.value.config ?? {}),
        ...patch,
      };
    };

    return {
      currentDevice,
      devices,
      updateDevices,
      updateCurrentDeviceConfig,
    };
  },
  {
    persist: true,
  },
);
