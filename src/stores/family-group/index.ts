/**
 * FamilyGroupStore — 家庭组状态管理 (Pinia)
 *
 * 管理当前用户所属的所有家庭组、当前选中的家庭组及其成员列表。
 * 核心模型: 一个儿童 + 一台虚拟乐宝设备 = 一个家庭组
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type {
  ChildInfo,
  FamilyGroup,
  FamilyMember,
  InviteCode,
} from './types';
import {
  MAX_FAMILY_MEMBERS,
} from './types';
import { useProfileStore } from 'stores/profile';

// Re-export types for convenience
export type { FamilyUserRole, FamilyMemberRole } from './types';

export const useFamilyGroupStore = defineStore(
  'family-group',
  () => {
    // ─── State ─────────────────────────────────────────────

    /** 当前用户所属的所有家庭组列表 */
    const groups = ref<FamilyGroup[]>([]);

    /** 当前选中的家庭组 ID */
    const currentGroupId = ref<string>();

    // ─── Computed ───────────────────────────────────────────

    /** 当前选中的家庭组 */
    const currentGroup = computed<FamilyGroup | undefined>(() =>
      groups.value.find((g) => g.id === currentGroupId.value),
    );

    /** 当前选中家庭组的成员列表 */
    const currentMembers = computed<FamilyMember[]>(() =>
      currentGroup.value?.members ?? [],
    );

    /** 当前家庭组的儿童成员 (memberType==='child') */
    const currentChild = computed<FamilyMember | undefined>(() =>
      currentMembers.value.find((m) => m.memberType === 'child'),
    );

    /** 当前家庭组的成人成员列表 (memberType==='user') */
    const currentAdultMembers = computed<FamilyMember[]>(() =>
      currentMembers.value.filter((m) => m.memberType === 'user'),
    );

    /** 当前用户是否为该家庭组的创建者 */
    const isCurrentUserCreator = computed(() => {
      const profileStore = useProfileStore();
      if (!currentGroup.value) return false;
      return currentGroup.value.creatorId === profileStore.profile?.id;
    });

    /** 是否可以继续邀请新成员 */
    const canInviteMore = computed(() =>
      currentMembers.value.length < MAX_FAMILY_MEMBERS,
    );

    /** 邀请码是否有效（未过期且未达使用上限） */
    const isInviteCodeValid = computed(() => {
      const code = currentGroup.value?.inviteCode;
      if (!code) return false;
      return new Date(code.expiresAt).getTime() > Date.now() && code.usedCount < code.maxUses;
    });

    // ─── Actions ────────────────────────────────────────────

    /**
     * 设置家庭组列表 (从 API 响应批量写入)
     */
    const setGroups = (newGroups: FamilyGroup[]) => {
      groups.value = newGroups;
      if (newGroups.length > 0 && !currentGroupId.value) {
        currentGroupId.value = newGroups[0]!.id;
      }
    };

    /**
     * 追加一个新家庭组 (用于多孩场景添加第二个/后续设备)
     */
    const addGroup = (group: FamilyGroup) => {
      groups.value.push(group);
      // Auto-select the new group if none is currently selected
      if (!currentGroupId.value) {
        currentGroupId.value = group.id;
      }
    };

    /**
     * 移除一个家庭组
     */
    const removeGroup = (groupId: string) => {
      const index = groups.value.findIndex((g) => g.id === groupId);
      if (index === -1) return;
      groups.value.splice(index, 1);
      if (currentGroupId.value === groupId) {
        currentGroupId.value = groups.value[0]?.id;
      }
    };

    /**
     * 切换当前选中的家庭组
     */
    const setCurrentGroup = (groupId: string) => {
      currentGroupId.value = groupId;
    };

    /**
     * 更新指定家庭组成员列表
     */
    const setGroupMembers = (groupId: string, members: FamilyMember[]) => {
      const group = groups.value.find((g) => g.id === groupId);
      if (group) {
        group.members = members;
      }
    };

    /**
     * 向当前家庭组添加一个成员
     */
    const addMember = (member: FamilyMember) => {
      if (!currentGroup.value || currentMembers.value.length >= MAX_FAMILY_MEMBERS) return;
      currentGroup.value.members.push(member);
    };

    /**
     * 从当前家庭组移除一个成员
     */
    const removeMember = (memberId: string) => {
      if (!currentGroup.value) return;
      const index = currentGroup.value.members.findIndex((m) => m.id === memberId);
      if (index === -1) return;
      currentGroup.value.members.splice(index, 1);
    };

    /**
     * 更新当前家庭组的邀请码
     */
    const setInviteCode = (inviteCode: InviteCode) => {
      if (currentGroup.value) {
        currentGroup.value.inviteCode = inviteCode;
      }
    };

    /**
     * 更新儿童信息 (编辑模式)
     */
    const updateChildInfo = (childInfo: ChildInfo) => {
      if (!currentGroup.value) return;
      const child = currentGroup.value.members.find((m) => m.memberType === 'child');
      if (child) {
        child.childInfo = childInfo;
      }
      // 同步更新家庭组名称
      currentGroup.value.name = `${childInfo.name}的家庭组`;
      currentGroup.value.childName = childInfo.name;
    };

    /**
     * 清空所有数据 (登出时调用)
     */
    const reset = () => {
      groups.value = [];
      currentGroupId.value = undefined;
    };

    return {
      // State
      groups,
      currentGroupId,

      // Computed
      currentGroup,
      currentMembers,
      currentChild,
      currentAdultMembers,
      isCurrentUserCreator,
      canInviteMore,
      isInviteCodeValid,

      // Actions
      setGroups,
      addGroup,
      removeGroup,
      setCurrentGroup,
      setGroupMembers,
      addMember,
      removeMember,
      setInviteCode,
      updateChildInfo,
      reset,
    };
  },
  {
    persist: true,
  },
);
