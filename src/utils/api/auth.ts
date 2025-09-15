import { api } from 'boot/axios';

import type { ChallengeResponse, AuthResponse } from 'src/types/api/auth';

export const emailChallenge = async (email: string) => {
  return await api.post<ChallengeResponse>('/auth/email/challenge', { email });
};

export const emailCode = async (email: string, code: string) => {
  return await api.post<AuthResponse>('/auth/email/code', { email, code });
};

export const emailPassword = async (email: string, password: string) => {
  return await api.post<AuthResponse>('/auth/email/password', { email, password });
};

export const emailReset = async (email: string, code: string, newPassword: string) => {
  return await api.post<ChallengeResponse>('/auth/email/reset', { email, code, newPassword });
};

export const phoneChallenge = async (phone: string) => {
  return await api.post<ChallengeResponse>('/auth/phone/challenge', { phone });
};

export const phoneCode = async (phone: string, code: string) => {
  return await api.post<AuthResponse>('/auth/phone/code', { phone, code });
};

export const phonePassword = async (phone: string, password: string) => {
  return await api.post<AuthResponse>('/auth/phone/password', { phone, password });
};

export const phoneReset = async (phone: string, code: string, newPassword: string) => {
  return await api.post<ChallengeResponse>('/auth/phone/reset', { phone, code, newPassword });
};

export const validateAccessToken = async (accessToken: string) => {
  return await api.get<{ success: boolean; message?: string }>('/auth/validate', {
    headers: {
      'x-access-token': accessToken,
    },
  });
}
