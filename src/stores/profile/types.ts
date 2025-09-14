export interface UserProfile {
  id: bigint;
  created_at: Date;
  updated_at: Date;
  nickname?: string;
  bio?: string;
  avatar?: string;
  avatarHash?: string;
  region?: string;
  last_active: Date;
  last_login: Date;
}
