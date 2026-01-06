import type { DeviceInfo } from 'stores/device/types';
import { useAuthStore } from 'stores/auth';
import { retrieveMine } from 'src/utils/api/device';

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
