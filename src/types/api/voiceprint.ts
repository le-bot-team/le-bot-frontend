export interface PersonInfo {
  person_id: string;
  person_name: string;
  audio_count: number;
  created_at: string;
}

export type registerVoiceprintResponse =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      data: {
        message: string;
        userId: string;
        personName: string;
        voiceId: string;
        registrationTime: string;
      };
    };

export type retrievePersonsInfoResponse =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      data: {
        persons: PersonInfo[];
      };
    };

export type VprRelationship = 'self' | 'family' | 'friend' | 'colleague' | 'other';
