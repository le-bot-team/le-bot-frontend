import type { VprRelationship } from 'components/vpr-relationships';

interface VprErrorResponse {
  success: false;
  message: string;
}

export type EmptyResponse =
  | VprErrorResponse
  | {
      success: true;
    };

export interface Person {
  person_id: string;
  person_name?: string;
  relationship: VprRelationship;
  voice_count: number;
  is_temporal: boolean;
  expire_date?: string;
}

export interface PersonDetail extends Person {
  voices: {
    voice_id: string;
    feature_vector: number[];
    created_at: string;
  }[];
}

export interface RecognitionData {
  person_id: string;
  person_name: string;
  voice_id: string;
  relationship: VprRelationship;
  confidence: number;
  similarity: number;
  processing_time_ms: number;
  details: Record<string, unknown>[];
}

export type RecognizeResponse =
  | VprErrorResponse
  | {
      success: true;
      data: RecognitionData;
    };

export type RegisterResponse =
  | VprErrorResponse
  | {
      success: true;
      data: {
        person_id: string;
        person_name: string;
        voice_id: string;
        voice_count: number;
        registration_time: string;
      };
    };

export type GetPersonsResponse =
  | VprErrorResponse
  | {
      success: true;
      data: Person[];
    };

export type GetPersonResponse =
  | VprErrorResponse
  | {
      success: true;
      data: PersonDetail;
    };

export interface UpdatePersonRequest {
  name?: string;
  relationship?: VprRelationship;
  isTemporal?: boolean;
}

export type AddVoiceResponse =
  | VprErrorResponse
  | {
      success: true;
      data: {
        person_id: string;
        voice_id: string;
        voice_count: number;
      };
    };
