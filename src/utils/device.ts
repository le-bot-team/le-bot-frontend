import type { ChildInfo, DeviceInfo } from 'stores/device/types';
import { useAuthStore } from 'stores/auth';
import { useDeviceStore } from 'stores/device';
import { useFamilyGroupStore } from 'stores/family-group';
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
 * Internal helper: validate token and call activateVirtualDevice API.
 * @returns The newly created device from the API response.
 */
const activateVirtualDeviceOrThrow = async (): Promise<DeviceInfo> => {
  const authStore = useAuthStore();

  if (!authStore.accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data: response } = await activateVirtualDevice(authStore.accessToken);
  if (!response.success) {
    throw new Error(response.message || 'Failed to activate virtual device');
  }

  return response.data.device;
};

/**
 * Activate a new virtual device via the backend API and add it to the store.
 * @returns The newly created virtual device info.
 */
export const activateAndAddVirtualDevice = async (): Promise<DeviceInfo> => {
  const deviceStore = useDeviceStore();
  const device = await activateVirtualDeviceOrThrow();
  deviceStore.addDevice(device);
  return device;
};

/**
 * Activate a new virtual device and associate child info in the store.
 * The backend API does not accept child info; it is stored front-end only.
 * @param childInfo - The child info to associate with the device.
 * @param deviceName - Display name for the device (e.g. "小新的乐宝").
 * @returns The newly created virtual device info with childInfo attached.
 */
export const activateAndAddVirtualDeviceWithChild = async (
  childInfo: ChildInfo,
  deviceName: string,
): Promise<DeviceInfo> => {
  const deviceStore = useDeviceStore();
  const apiDevice = await activateVirtualDeviceOrThrow();

  // Create a new object with additional frontend-only fields instead of mutating the response
  const device: DeviceInfo = {
    ...apiDevice,
    childInfo,
    name: deviceName,
  };

  deviceStore.addDevice(device);
  return device;
};

/**
 * Unbind (delete) a device via the backend API and remove it from the store.
 * Uses POST /devices/unbind with { deviceId } request body.
 * @param deviceId - The id of the device to unbind.
 */
export const unbindAndRemoveDevice = async (deviceId: string): Promise<void> => {
  const authStore = useAuthStore();
  const deviceStore = useDeviceStore();
  const familyGroupStore = useFamilyGroupStore();

  if (!authStore.accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data: response } = await unbindDevice(authStore.accessToken, deviceId);
  if (!response.success) {
    throw new Error(response.message || 'Failed to unbind device');
  }

  // Remove associated family group (each virtual device maps to one family group)
  const group = familyGroupStore.groups.find((g) => g.deviceId === deviceId);
  if (group) {
    familyGroupStore.removeGroup(group.id);
  }

  deviceStore.removeDevice(deviceId);
};
