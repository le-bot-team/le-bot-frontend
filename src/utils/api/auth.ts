import { api } from 'boot/axios';

import type { ChallengeResponse, CodeResponse, PasswordResponse } from 'src/types/api/auth';

export const emailChallenge = async (email: string) => {
  return await api.post<ChallengeResponse>('/auth/email/challenge', { email });
};

export const emailCode = async (email: string, code: string) => {
  return await api.post<CodeResponse>('/auth/email/code', { email, code });
};

export const emailPassword = async (email: string, password: string) => {
  return await api.post<PasswordResponse>('/auth/email/password', { email, password });
};

export const phoneChallenge = async (phone: string) => {
  return await api.post<ChallengeResponse>('/auth/phone/challenge', { phone });
};

export const phoneCode = async (phone: string, code: string) => {
  return await api.post<CodeResponse>('/auth/phone/code', { phone, code });
};

export const phonePassword = async (phone: string, password: string) => {
  return await api.post<PasswordResponse>('/auth/phone/password', { phone, password });
};
