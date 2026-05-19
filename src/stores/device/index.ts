import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { DeviceInfo } from 'stores/device/types';
import { MAX_VIRTUAL_DEVICES } from 'stores/device/types';

export const useDeviceStore = defineStore(
  'device',
  () => {
    const currentDeviceId = ref<string | null>(null);
    const devices = ref<DeviceInfo[]>([]);

    /** Derived current device — always references the canonical array entry */
    const currentDevice = computed<DeviceInfo | undefined>(
      () => devices.value.find((d) => d.id === currentDeviceId.value) ?? devices.value[0],
    );

    /** All virtual devices (type === 'virtual') */
    const virtualDevices = computed(() => devices.value.filter((d) => d.type === 'virtual'));

    const updateDevices = (newDevices: DeviceInfo[] = []) => {
      devices.value = newDevices;
      // Preserve selection if device still exists; otherwise auto-select first
      if (currentDeviceId.value && !newDevices.some((d) => d.id === currentDeviceId.value)) {
        currentDeviceId.value = newDevices[0]?.id ?? null;
      }
    };

    /** Add a device to the store (validates MAX_VIRTUAL_DEVICES limit for virtual type) */
    const addDevice = (device: DeviceInfo) => {
      if (device.type === 'virtual' && virtualDevices.value.length >= MAX_VIRTUAL_DEVICES) {
        throw new Error(`Cannot add more than ${MAX_VIRTUAL_DEVICES} virtual devices`);
      }
      // Avoid duplicates
      if (devices.value.some((d: DeviceInfo) => d.id === device.id)) return;
      devices.value.push(device);
      if (!currentDeviceId.value) {
        currentDeviceId.value = device.id;
      }
    };

    /** Remove a device by its id */
    const removeDevice = (deviceId: string) => {
      const index = devices.value.findIndex((d) => d.id === deviceId);
      if (index === -1) return;
      devices.value.splice(index, 1);
      if (currentDeviceId.value === deviceId) {
        currentDeviceId.value = devices.value[0]?.id ?? null;
      }
    };

    /** Switch the current device to one with the given id */
    const setCurrentDevice = (deviceId: string) => {
      if (devices.value.some((d) => d.id === deviceId)) {
        currentDeviceId.value = deviceId;
      }
    };

    /** Merge a partial patch into currentDevice.config */
    const updateCurrentDeviceConfig = (patch: Partial<NonNullable<DeviceInfo['config']>>) => {
      const device = devices.value.find((d) => d.id === currentDeviceId.value);
      if (!device) return;
      device.config = {
        ...(device.config ?? {}),
        ...patch,
      };
    };

    return {
      currentDeviceId,
      currentDevice,
      devices,
      virtualDevices,
      updateDevices,
      addDevice,
      removeDevice,
      setCurrentDevice,
      updateCurrentDeviceConfig,
    };
  },
  {
    persist: true,
  },
);
