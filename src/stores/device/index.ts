import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { DeviceInfo } from 'stores/device/types';

export const useDeviceStore = defineStore(
  'device',
  () => {
    const currentDevice = ref<DeviceInfo>();
    const devices = ref<DeviceInfo[]>([]);

    const updateDevices = (newDevices: DeviceInfo[] = []) => {
      devices.value = newDevices;
      currentDevice.value = newDevices[0];
    };

    return {
      currentDevice,
      devices,
      updateDevices,
    };
  },
  {
    persist: true,
  },
);
