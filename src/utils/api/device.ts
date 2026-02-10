import { api } from 'boot/axios';

import type { RetrieveMineResponse } from 'src/types/api/device';

export const retrieveMine = async (accessToken: string) =>
  await api.get<RetrieveMineResponse>('/devices/mine', {
    headers: {
      'x-access-token': accessToken,
    },
  });
