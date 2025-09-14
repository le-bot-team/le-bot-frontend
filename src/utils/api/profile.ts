import { api } from 'boot/axios';
import type { RetrieveProfileInfoResponse, UpdateProfileInfoRequest } from 'src/types/api/profile';

export const retrieveProfileInfo = async (accessToken: string) => {
  return await api.get<RetrieveProfileInfoResponse>('/profile/info', {
    headers: {
      'x-access-token': accessToken,
    },
  });
};

export const updateProfileInfo = async (accessToken: string, data: UpdateProfileInfoRequest) => {
  return await api.put<{ success: boolean; message?: string }>('/profile/info', data, {
    headers: {
      'x-access-token': accessToken,
    },
  });
};
