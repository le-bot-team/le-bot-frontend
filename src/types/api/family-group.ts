/**
 * Family Group API 请求/响应类型定义
 */

import type {
  FamilyGroup,
  FamilyMember,
  InviteCode,
} from 'stores/family-group/types';
import type { ChildInfo } from 'stores/device/types';

// ─── GET /family-groups/mine ──────────────────────────────────

export type FetchMyFamilyGroupsResponse =
  | { success: false; message: string }
  | {
      success: true;
      data: {
        groups: FamilyGroup[];
      };
    };

// ─── GET /family-groups/:id ───────────────────────────────────

export type FetchGroupDetailResponse =
  | { success: false; message: string }
  | {
      success: true;
      data: {
        group: FamilyGroup;
      };
    };

// ─── POST /family-groups/:id/invite ───────────────────────────

export type GenerateInviteCodeResponse =
  | { success: false; message: string }
  | {
      success: true;
      data: {
        inviteCode: InviteCode;
      };
    };

// ─── POST /family-groups/join (accept invite) ────────────────

export interface AcceptInviteRequest {
  code: string;
  role: NonNullable<FamilyMember['role']>;
}

export type AcceptInviteResponse =
  | { success: false; message: string }
  | {
      success: true;
      data: {
        group: FamilyGroup;
      };
    };

// ─── DELETE /family-groups/:id/members/:memberId ─────────────

export type RemoveMemberResponse =
  | { success: false; message: string }
  | { success: true };

// ─── POST /family-groups/:id/leave ───────────────────────────

export type LeaveGroupResponse =
  | { success: false; message: string }
  | { success: true };

// ─── PUT /family-groups/:id/child ─────────────────────────────

export interface UpdateChildInfoRequest {
  childInfo: ChildInfo;
}

export type UpdateChildInfoResponse =
  | { success: false; message: string }
  | {
      success: true;
      data: {
        group: FamilyGroup;
      };
    };

// ─── GET /family-groups/invite/:code (resolve) ────────────────

/** 扫码解析邀请信息（加入前预览用） */
export type ResolveInviteCodeResponse =
  | { success: false; message: string }
  | {
      success: true;
      data: {
        groupId: string;
        groupName: string;
        childName: string;
        inviterNickname: string;
        inviterAvatar?: string;
        /** 邀请码是否仍然有效 */
        isValid: boolean;
        expiresAt: string;
      };
    };
