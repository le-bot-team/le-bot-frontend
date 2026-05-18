/**
 * Family Group — 家庭组核心类型定义
 *
 * 核心模型: 一个儿童 + 一台虚拟乐宝设备 = 一个家庭组
 * 一个 APP 用户可同时属于多个家庭组（多孩场景）
 */

import type { ChildInfo } from 'stores/device/types';

// Re-export ChildInfo for convenience (used by API types)
export type { ChildInfo } from 'stores/device/types';

// ─── 成员角色枚举 ──────────────────────────────────────────────

/** 家庭成员角色（不含 child，child 用 memberType 区分） */
export type FamilyUserRole =
  | 'father'
  | 'mother'
  | 'grandpa'
  | 'grandma'
  | 'paternal_grandmother'
  | 'maternal_grandfather'
  | 'maternal_grandma'
  | 'friend'
  | 'other';

/** 全部角色选项（含 child，用于 UI 展示） */
export type FamilyMemberRole = FamilyUserRole | 'child';

// ─── 成员实体 ──────────────────────────────────────────────────

export interface FamilyMember {
  id: string;

  /** 成员类型: user=有APP账号 / child=儿童虚拟成员 */
  memberType: 'user' | 'child';

  // ── user 类型字段 ──
  /** APP用户ID (仅 memberType==='user' 时有值) */
  userId?: string;
  /** 显示名称 */
  nickname?: string;
  /** 头像URL */
  avatar?: string;
  /** 在该家庭中的角色 (memberType==='user' 时必填) */
  role?: FamilyUserRole;
  /** 性别 */
  gender?: 'male' | 'female';
  /** 生日 ISO 8601 */
  birthday?: string;
  /** 是否已录入声纹 */
  hasVoiceprint?: boolean;
  /** 声纹人物ID */
  voiceprintPersonId?: string;

  // ── child 类型字段 ──
  /** 儿童信息 (复用 DeviceStore 的 ChildInfo) */
  childInfo?: ChildInfo;
  /** 关联的虚拟设备ID */
  deviceId?: string;

  // ── 通用字段 ──
  /** 是否为该家庭组的创建者 */
  isCreator: boolean;
  /** 加入时间 ISO 8601 */
  joinedAt: string;
}

// ─── 邀请码 ────────────────────────────────────────────────────

export interface InviteCode {
  code: string;
  groupId: string;
  groupName: string;
  inviterNickname: string;
  inviterAvatar?: string;
  /** 过期时间 ISO 8601 */
  expiresAt: string;
  /** 后端生成的QR图片URL (或前端本地生成) */
  qrImageUrl?: string;
  /** 最大使用次数 */
  maxUses: number;
  /** 已使用次数 */
  usedCount: number;
}

// ─── 家庭组实体 ────────────────────────────────────────────────

export interface FamilyGroup {
  id: string;
  /** 格式: "{儿童名}的家庭组", 如 "小新的家庭组" */
  name: string;
  /** 关联的儿童姓名 (冗余存储便于列表展示) */
  childName: string;
  /** 关联的虚拟设备ID (核心关联键, 一对一) */
  deviceId: string;
  /** 创建者的 userId */
  creatorId: string;
  /** 创建时间 ISO 8601 */
  createdAt: string;
  /** 成员列表 (通常含 1 个 child + N 个 user) */
  members: FamilyMember[];
  /** 当前有效的邀请码 (如有) */
  inviteCode?: InviteCode;
}

// ─── 角色选项常量（UI 复用） ────────────────────────────────────

export const FAMILY_ROLE_OPTIONS: { value: FamilyUserRole; label: string }[] = [
  { value: 'father', label: '爸爸' },
  { value: 'mother', label: '妈妈' },
  { value: 'grandpa', label: '爷爷' },
  { value: 'grandma', label: '奶奶' },
  { value: 'paternal_grandmother', label: '奶奶(祖母)' },
  { value: 'maternal_grandfather', label: '外公' },
  { value: 'maternal_grandma', label: '外婆' },
  { value: 'friend', label: '朋友' },
  { value: 'other', label: '其他' },
];

/** 默认邀请二维码有效期（毫秒）— 7天 */
export const INVITE_CODE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

/** 每个家庭组成员上限 */
export const MAX_FAMILY_MEMBERS = 10;
