import { api } from 'boot/axios';

import type {
  registerVoiceprintResponse,
  retrievePersonsInfoResponse,
  VprRelationship,
} from 'src/types/api/voiceprint';

export const registerVoiceprint = async (
  accessToken: string,
  audioBase64: string,
  name: string,
  relationship: VprRelationship,
) =>
  await api.post<registerVoiceprintResponse>(
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

export const retrievePersonsInfo = async (accessToken: string) =>
  await api.get<retrievePersonsInfoResponse>('/voiceprint/persons', {
    headers: {
      'x-access-token': accessToken,
    },
  });
