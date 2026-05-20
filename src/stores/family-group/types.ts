export type FamilyUserRole =
  | 'father'
  | 'mother'
  | 'grandpa'
  | 'grandma'
  | 'maternal_grandfather'
  | 'maternal_grandma'
  | 'friend'
  | 'other';

export interface FamilyMemberChild {
  id: string;
  memberType: 'child';
  childInfo: {
    name: string;
    gender: 'boy' | 'girl';
    birthday: string;
  };
  deviceId: string;
  isCreator: boolean;
  joinedAt: string;
}

export interface FamilyMemberUser {
  id: string;
  memberType: 'user';
  userId: string;
  nickname: string;
  avatar?: string;
  role?: FamilyUserRole;
  gender?: 'male' | 'female';
  birthday?: string;
  isCreator: boolean;
  joinedAt: string;
}

export type FamilyMember = FamilyMemberChild | FamilyMemberUser;

export interface FamilyGroup {
  id: string;
  name: string;
  childName: string;
  deviceId: string;
  creatorId: string;
  createdAt: string;
  members: FamilyMember[];
}
