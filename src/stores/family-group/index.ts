import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { FamilyGroup } from 'stores/family-group/types';

export const useFamilyGroupStore = defineStore(
  'family-group',
  () => {
    const groups = ref<FamilyGroup[]>([]);
    const currentGroupId = ref<string | null>(null);

    const addGroup = (group: FamilyGroup) => {
      const existing = groups.value.find((g: FamilyGroup) => g.id === group.id);
      if (!existing) {
        groups.value.push(group);
      }
    };

    const setCurrentGroup = (groupId: string) => {
      currentGroupId.value = groupId;
    };

    const removeGroup = (groupId: string) => {
      groups.value = groups.value.filter((g: FamilyGroup) => g.id !== groupId);
      if (currentGroupId.value === groupId) {
        currentGroupId.value = groups.value[0]?.id ?? null;
      }
    };

    return {
      groups,
      currentGroupId,
      addGroup,
      setCurrentGroup,
      removeGroup,
    };
  },
  {
    persist: true,
  },
);
