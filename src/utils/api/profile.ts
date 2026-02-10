import { api } from 'boot/axios';
import type {
  RetrieveProfileAvatarResponse,
  RetrieveProfileInfoResponse,
  UpdateProfileInfoRequest,
} from 'src/types/api/profile';

export const retrieveProfileAvatar = async (accessToken: string) =>
  await api.get<RetrieveProfileAvatarResponse>('/profiles/avatar', {
    headers: {
      'x-access-token': accessToken,
    },
  });

export const retrieveProfileInfo = async (accessToken: string) =>
  await api.get<RetrieveProfileInfoResponse>('/profiles/info', {
    headers: {
      'x-access-token': accessToken,
    },
  });

export const updateProfileInfo = async (accessToken: string, data: UpdateProfileInfoRequest) =>
  await api.put<{ success: boolean; message?: string }>('/profiles/info', data, {
    headers: {
      'x-access-token': accessToken,
    },
  });
