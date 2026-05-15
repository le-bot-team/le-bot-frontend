import type { FamilyUserRole } from 'stores/family-group/types';

export interface UserProfile {
  id: string;
  created_at: Date;
  updated_at: Date;
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
  last_active: Date;
  last_login: Date;
}
