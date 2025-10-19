export interface UserProfile {
  id: bigint;
  created_at: Date;
  updated_at: Date;
  nickname?: string;
  bio?: string;
  avatar?: string | undefined;
  avatarHash?: string;
  region?: string;
  last_active: Date;
  last_login: Date;
}

export interface UserProfileAvatar {
  id: bigint;
  avatar?: string;
  avatarHash?: string;
}
