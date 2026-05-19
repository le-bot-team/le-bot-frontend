<script setup lang="ts">
/**
 * FamilyGroupJoinPage — Join via invite code
 *
 * Entry point for the invite flow. Resolves an invite code from the URL query,
 * displays invite info, and opens JoinConfirmDialog for the user to accept.
 */

import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useQuasar } from 'quasar';

import { i18nSubPath } from 'src/utils/common';
import { router } from 'src/router';
import { resolveInviteCode } from 'src/utils/api/family-group';
import { useAuthStore } from 'stores/auth';
import JoinConfirmDialog from 'src/components/family-group/JoinConfirmDialog.vue';

const i18n = i18nSubPath('pages.stack.family-group.JoinPage');
const $q = useQuasar();
const route = useRoute();
const authStore = useAuthStore();

const inviteCode = computed(() => (route.query.code as string | undefined) ?? '');
const isLoading = ref(true);
const showDialog = ref(false);

// Resolved invite info
const resolvedInviterNickname = ref('');
const resolvedInviterAvatar = ref<string | undefined>(undefined);
const resolvedGroupName = ref('');
const resolvedChildName = ref('');

onMounted(async () => {
  // Require authentication before proceeding
  if (!authStore.accessToken) {
    $q.notify({ message: i18n('errors.notLoggedIn'), type: 'negative' });
    void router.replace({
      name: 'auth',
      query: { redirect: route.fullPath },
    });
    return;
  }

  if (!inviteCode.value) {
    $q.notify({ message: i18n('errors.noCode'), type: 'negative' });
    void router.replace({ name: 'family-groups' });
    return;
  }

  try {
    const res = await resolveInviteCode(inviteCode.value, authStore.accessToken);
    if (res.data?.success && res.data.data) {
      resolvedInviterNickname.value = res.data.data.inviterNickname ?? '';
      resolvedInviterAvatar.value = res.data.data.inviterAvatar;
      resolvedGroupName.value = res.data.data.groupName ?? '';
      resolvedChildName.value = res.data.data.childName ?? '';
      showDialog.value = true;
    } else {
      const msg = res.data && !res.data.success ? res.data.message : i18n('errors.invalidCode');
      $q.notify({ message: msg ?? i18n('errors.invalidCode'), type: 'negative' });
      void router.replace({ name: 'family-groups' });
    }
  } catch (err) {
    console.error('Failed to resolve invite code:', err);
    $q.notify({ message: i18n('errors.resolveFailed'), type: 'negative' });
    void router.replace({ name: 'family-groups' });
  } finally {
    isLoading.value = false;
  }
});

function onJoinSuccess(groupId: string) {
  void router.replace({
    name: 'family-group-detail',
    query: { groupId },
  });
}

function onCancel() {
  void router.replace({ name: 'family-groups' });
}
</script>

<template>
  <q-page class="family-group-page join-page">
    <div v-if="isLoading" class="join-page__loading">
      <q-spinner size="48px" color="primary" />
    </div>

    <JoinConfirmDialog
      v-model="showDialog"
      :invite-code="inviteCode"
      :group-name="resolvedGroupName"
      :child-name="resolvedChildName"
      :inviter-nickname="resolvedInviterNickname"
      :inviter-avatar="resolvedInviterAvatar ?? ''"
      @success="onJoinSuccess"
      @cancel="onCancel"
    />
  </q-page>
</template>

<style scoped lang="scss">
.join-page__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
</style>
