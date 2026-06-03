import { api } from 'boot/axios';

import type { ChallengeResponse, AuthResponse, EmailCheckResponse, LegalDocumentResponse } from 'src/types/api/auth';

export const emailCheck = async (email: string) => {
  return await api.get<EmailCheckResponse>('/auth/email/check', { params: { email } });
};

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

export const validateAccessToken = async (accessToken: string) => {
  return await api.get<{ success: boolean; message?: string }>('/auth/validate', {
    headers: {
      'x-access-token': accessToken,
    },
  });
};

export type LegalDocumentType = 'terms-of-service' | 'user-agreement' | 'privacy-policy';

export const fetchLegalDocument = async (docType: LegalDocumentType, lang?: string) => {
  return await api.get<LegalDocumentResponse>(`/legal/${docType}`, {
    params: lang ? { lang } : undefined,
  });
};
