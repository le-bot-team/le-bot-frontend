import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { DeviceInfo } from 'stores/device/types';
import { MAX_VIRTUAL_DEVICES } from 'stores/device/types';

export const useDeviceStore = defineStore(
  'device',
  () => {
    const currentDevice = ref<DeviceInfo>();
    const devices = ref<DeviceInfo[]>([]);

    /** All virtual devices (type === 'virtual') */
    const virtualDevices = computed(() =>
      devices.value.filter((d) => d.type === 'virtual'),
    );

    const updateDevices = (newDevices: DeviceInfo[] = []) => {
      devices.value = newDevices;
      currentDevice.value = newDevices[0];
    };

    /** Add a virtual device to the store (validates MAX_VIRTUAL_DEVICES limit) */
    const addDevice = (device: DeviceInfo) => {
      if (virtualDevices.value.length >= MAX_VIRTUAL_DEVICES) {
        throw new Error(`Cannot add more than ${MAX_VIRTUAL_DEVICES} virtual devices`);
      }
      devices.value.push(device);
      if (!currentDevice.value) {
        currentDevice.value = device;
      }
    };

    /** Remove a device by its id */
    const removeDevice = (deviceId: string) => {
      const index = devices.value.findIndex((d) => d.id === deviceId);
      if (index === -1) return;
      devices.value.splice(index, 1);
      if (currentDevice.value?.id === deviceId) {
        currentDevice.value = devices.value[0];
      }
    };

    /** Switch the current device to one with the given id */
    const setCurrentDevice = (deviceId: string) => {
      const device = devices.value.find((d) => d.id === deviceId);
      if (device) {
        currentDevice.value = device;
      }
    };

    return {
      currentDevice,
      devices,
      virtualDevices,
      updateDevices,
      addDevice,
      removeDevice,
      setCurrentDevice,
    };
  },
  {
    persist: true,
  },
);
