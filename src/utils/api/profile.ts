import { api } from 'boot/axios';
import type {
  RetrieveProfileAvatarResponse,
  RetrieveProfileInfoResponse,
  UpdateProfileInfoRequest,
} from 'src/types/api/profile';

export const retrieveProfileAvatar = async (accessToken: string) => {
  return await api.get<RetrieveProfileAvatarResponse>('/profile/avatar', {
    headers: {
      'x-access-token': accessToken,
    },
  });
}

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
