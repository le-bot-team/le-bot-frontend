import { api } from 'boot/axios';
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  ChangePhoneRequest,
  ChangePhoneResponse,
  DeactivateAccountResponse,
  PhoneChallengeResponse,
  RetrieveProfileAvatarResponse,
  RetrieveProfileInfoResponse,
  UpdateProfileInfoRequest,
  UpdateProfileInfoResponse,
  VerifyPhoneCodeResponse,
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
  await api.put<UpdateProfileInfoResponse>('/profiles/info', data, {
    headers: {
      'x-access-token': accessToken,
    },
  });

export const changePassword = async (accessToken: string, data: ChangePasswordRequest) =>
  await api.post<ChangePasswordResponse>('/profiles/password', data, {
    headers: {
      'x-access-token': accessToken,
    },
  });

export const deactivateAccount = async (accessToken: string) =>
  await api.post<DeactivateAccountResponse>(
    '/profiles/deactivate',
    {},
    {
      headers: {
        'x-access-token': accessToken,
      },
    },
  );

export const phoneChallenge = async (accessToken: string, phone: string) =>
  await api.post<PhoneChallengeResponse>(
    '/profiles/phone/challenge',
    { phone },
    {
      headers: {
        'x-access-token': accessToken,
      },
    },
  );

export const verifyPhoneCode = async (
  accessToken: string,
  phone: string,
  code: string,
) =>
  await api.post<VerifyPhoneCodeResponse>(
    '/profiles/phone/verify',
    { phone, code },
    {
      headers: {
        'x-access-token': accessToken,
      },
    },
  );

export const changePhone = async (accessToken: string, data: ChangePhoneRequest) =>
  await api.post<ChangePhoneResponse>('/profiles/phone', data, {
    headers: {
      'x-access-token': accessToken,
    },
  });
