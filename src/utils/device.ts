import type { DeviceInfo } from 'stores/device/types';
import { useAuthStore } from 'stores/auth';
import { useDeviceStore } from 'stores/device';
import { activateVirtualDevice, retrieveMine, unbindDevice } from 'src/utils/api/device';

export const retrieveDevices = async (): Promise<DeviceInfo[]> => {
  const authStore = useAuthStore();

  if (!authStore.accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data: mineResponse } = await retrieveMine(authStore.accessToken);
  if (!mineResponse.success) {
    throw new Error('Failed to retrieve devices');
  }
  return mineResponse.data.devices;
};

/**
 * Activate a new virtual device via the backend API and add it to the store.
 * @returns The newly created virtual device info.
 */
export const activateAndAddVirtualDevice = async (): Promise<DeviceInfo> => {
  const authStore = useAuthStore();
  const deviceStore = useDeviceStore();

  if (!authStore.accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data: response } = await activateVirtualDevice(authStore.accessToken);
  if (!response.success) {
    throw new Error(response.message || 'Failed to activate virtual device');
  }

  deviceStore.addDevice(response.data.device);
  return response.data.device;
};

/**
 * Unbind (delete) a device via the backend API and remove it from the store.
 * @param deviceId - The id of the device to unbind.
 */
export const unbindAndRemoveDevice = async (deviceId: string): Promise<void> => {
  const authStore = useAuthStore();
  const deviceStore = useDeviceStore();

  if (!authStore.accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data: response } = await unbindDevice(authStore.accessToken, deviceId);
  if (!response.success) {
    throw new Error(response.message || 'Failed to unbind device');
  }

  deviceStore.removeDevice(deviceId);
};
