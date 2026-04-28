import { api } from 'boot/axios';

import type {
  ActivateVirtualDeviceResponse,
  RetrieveMineResponse,
  UnbindDeviceResponse,
} from 'src/types/api/device';

export const retrieveMine = async (accessToken: string) =>
  await api.get<RetrieveMineResponse>('/devices/mine', {
    headers: {
      'x-access-token': accessToken,
    },
  });

export const activateVirtualDevice = async (accessToken: string) =>
  await api.post<ActivateVirtualDeviceResponse>(
    '/devices/virtual/activate',
    {},
    {
      headers: {
        'x-access-token': accessToken,
      },
    },
  );

export const unbindDevice = async (accessToken: string, deviceId: string) =>
  await api.delete<UnbindDeviceResponse>(`/devices/${deviceId}`, {
    headers: {
      'x-access-token': accessToken,
    },
  });
