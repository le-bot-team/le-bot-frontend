import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { DeviceInfo } from 'stores/device/types';
import { MAX_VIRTUAL_DEVICES } from 'stores/device/types';

/**
 * Deep-merge two device config objects.
 * - If the API returns null/undefined config, preserve the existing (frontend-only) config.
 * - If the API returns a config, merge it on top of existing so that frontend-only keys
 *   (e.g. aiPersonality) that the backend does not return are retained.
 */
function mergeDeviceConfig(
  existing: DeviceInfo['config'] | null | undefined,
  incoming: DeviceInfo['config'] | null | undefined,
): DeviceInfo['config'] | null {
  if (!incoming) return existing ?? null;
  if (!existing) return incoming;
  return { ...existing, ...incoming };
}

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
      // Merge strategy: preserve frontend-only fields (childInfo, name, config)
      // from existing entries that the backend API does not return.
      const existingMap = new Map(devices.value.map((d) => [d.id, d]));
      const apiIds = new Set(newDevices.map((d) => d.id));

      const merged = newDevices.map((apiDevice) => {
        const existing = existingMap.get(apiDevice.id);
        if (!existing) return apiDevice;
        return {
          ...apiDevice,
          // Preserve frontend-only fields when the API does not provide them
          childInfo: apiDevice.childInfo ?? existing.childInfo ?? null,
          name: apiDevice.name ?? existing.name ?? null,
          // Deep-merge config: keep frontend-only keys (e.g. aiPersonality)
          // that the backend does not return.
          config: mergeDeviceConfig(existing.config, apiDevice.config),
        };
      });

      // When the API returns a non-empty list, also keep locally-known devices
      // that the API did not return. These are devices created during the current
      // session whose frontend-only data (name, childInfo, config) has not yet
      // been synced to the backend (or the mock resets on page load).
      // When newDevices is empty (explicit reset, e.g. logout), skip this to
      // allow a full clear.
      if (newDevices.length > 0) {
        for (const [id, existing] of existingMap) {
          if (!apiIds.has(id)) {
            merged.push(existing);
          }
        }
      }

      devices.value = merged;
      // Preserve selection if device still exists; otherwise auto-select first
      if (currentDeviceId.value && !merged.some((d) => d.id === currentDeviceId.value)) {
        currentDeviceId.value = merged[0]?.id ?? null;
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
