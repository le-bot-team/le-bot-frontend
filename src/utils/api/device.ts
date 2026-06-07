import { api } from 'boot/axios';

import type {
  ActivateVirtualDeviceRequest,
  ActivateVirtualDeviceResponse,
  BindDeviceRequest,
  BindDeviceResponse,
  RetrieveMineResponse,
  UnbindDeviceResponse,
} from 'src/types/api/device';

export const retrieveMine = async (accessToken: string) =>
  await api.get<RetrieveMineResponse>('/devices/mine', {
    headers: {
      'x-access-token': accessToken,
    },
  });

export const activateVirtualDevice = async (accessToken: string, data: ActivateVirtualDeviceRequest = {}) =>
  await api.post<ActivateVirtualDeviceResponse>(
    '/devices/virtual/activate',
    data,
    {
      headers: {
        'x-access-token': accessToken,
      },
    },
  );

export const bindDevice = async (accessToken: string, data: BindDeviceRequest) =>
  await api.post<BindDeviceResponse>('/devices/bind', data, {
    headers: {
      'x-access-token': accessToken,
    },
  });

export const unbindDevice = async (accessToken: string, deviceId: string) =>
  await api.post<UnbindDeviceResponse>(
    '/devices/unbind',
    { deviceId },
    {
      headers: {
        'x-access-token': accessToken,
      },
    },
  );
