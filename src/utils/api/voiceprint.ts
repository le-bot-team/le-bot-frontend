import { api } from 'boot/axios';

import type { VprRelationship } from 'components/vpr-relationships';

import type {
  EmptyResponse,
  GetPersonResponse,
  GetPersonsResponse,
  RecognizeResponse,
  RegisterResponse,
  UpdatePersonRequest,
} from 'src/types/api/voiceprint';

export const recognize = async (accessToken: string, audioBase64: string) =>
  await api.post<RecognizeResponse>(
    '/voiceprint/recognize',
    {
      audio: audioBase64,
    },
    {
      headers: {
        'x-access-token': accessToken,
      },
    },
  );

export const register = async (
  accessToken: string,
  audioBase64: string,
  name: string,
  relationship: VprRelationship,
) =>
  await api.post<RegisterResponse>(
    '/voiceprint/register',
    {
      audio: audioBase64,
      name,
      relationship,
      is_temporal: false,
    },
    {
      headers: {
        'x-access-token': accessToken,
      },
    },
  );

export const getPersons = async (accessToken: string) =>
  await api.get<GetPersonsResponse>('/voiceprint/persons', {
    headers: {
      'x-access-token': accessToken,
    },
  });

export const deletePerson = async (accessToken: string, personId: string) =>
  await api.delete<EmptyResponse>(`/voiceprint/persons/${personId}`, {
    headers: {
      'x-access-token': accessToken,
    },
  });

export const getPerson = async (accessToken: string, personId: string) =>
  await api.get<GetPersonResponse>(`/voiceprint/persons/${personId}`, {
    headers: {
      'x-access-token': accessToken,
    },
  });

export const updatePerson = async (
  accessToken: string,
  personId: string,
  data: UpdatePersonRequest,
) =>
  await api.put<EmptyResponse>(`/voiceprint/persons/${personId}`, data, {
    headers: {
      'x-access-token': accessToken,
    },
  });

export const deleteVoice = async (accessToken: string, personId: string, voiceId: string) =>
  await api.delete<EmptyResponse>(`/voiceprint/persons/${personId}/voices/${voiceId}`, {
    headers: {
      'x-access-token': accessToken,
    },
  });

export const updateVoice = async (
  accessToken: string,
  personId: string,
  voiceId: string,
  audioBase64: string,
) =>
  await api.put<EmptyResponse>(
    `/voiceprint/persons/${personId}/voices/${voiceId}`,
    {
      audio: audioBase64,
    },
    {
      headers: {
        'x-access-token': accessToken,
      },
    },
  );
