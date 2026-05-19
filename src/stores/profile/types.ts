export type FamilyUserRole = 'father' | 'mother' | 'grandpa' | 'grandma' | 'friend' | 'other';

export interface UserProfile {
  id: string;
  created_at: string;
  updated_at: string;
  nickname?: string;
  bio?: string;
  avatar?: string | undefined;
  avatarHash?: string;
  region?: string;
  birthday?: string;
  phone?: string;
  relationship?: string;
  role?: FamilyUserRole;
  gender?: 'male' | 'female';
  last_active: string;
  last_login: string;
}
