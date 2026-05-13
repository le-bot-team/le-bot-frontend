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
  birthday?: string | undefined;
  relationship?: string | undefined;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export type ChangePasswordResponse =
  | {
      success: false;
      message: string;
      code?: 'wrongOldPassword' | 'passwordMismatch' | 'invalidPassword';
    }
  | {
      success: true;
    };

export type DeactivateAccountResponse =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
    };

export interface PhoneChallengeRequest {
  phone: string;
}

export type PhoneChallengeResponse =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
    };

export interface VerifyPhoneCodeRequest {
  phone: string;
  code: string;
}

export type VerifyPhoneCodeResponse =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
    };

export interface ChangePhoneRequest {
  phone: string;
  code: string;
}

export type ChangePhoneResponse =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
    };
