import type { UserProfile } from 'stores/profile/types';

export type RetrieveProfileAvatarResponse =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      data: {
        id: number;
        avatar: string;
        avatarHash: string;
      };
    };

export type RetrieveProfileInfoResponse =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      data: UserProfile;
    };

export interface UpdateProfileInfoRequest {
  nickname?: string | undefined;
  bio?: string | undefined;
  avatar?: string | undefined;
  region?: string | undefined;
}
