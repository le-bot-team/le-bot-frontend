<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Dialog, useQuasar } from 'quasar';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

import DeletePersonDialog from 'components/settings/voiceprint/DeletePersonDialog.vue';
import VoiceNamingPanel from 'components/settings/voiceprint/VoiceNamingPanel.vue';
import { type VprRelationship } from 'components/vpr-relationships';

import avatarImg from 'src/assets/lanhu/voiceprint/avatar.webp';
import { router } from 'src/router';
import type { PersonDetail } from 'src/types/api/voiceprint';
import { getPerson, updatePerson } from 'src/utils/api/voiceprint';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';

const { accessToken } = storeToRefs(useAuthStore());
const { notify } = useQuasar();
const route = useRoute();

const i18n = i18nSubPath('pages.stack.settings.voiceprint.DetailPage');

const personId = ref<string>();
const personDetail = ref<PersonDetail>();
const editableName = ref('');
const editableRelationship = ref<VprRelationship>('friend');
const submitting = ref(false);

const submitUpdate = async () => {
  if (!personId.value || !accessToken.value) {
    return;
  }
  const name = editableName.value.trim();
  if (!name) {
    notify({ type: 'warning', message: i18n('notifications.nameRequired') });
    return;
  }
  submitting.value = true;
  try {
    const { data: response } = await updatePerson(accessToken.value, personId.value, {
      name,
      relationship: editableRelationship.value,
    });
    if (response.success) {
      notify({ type: 'positive', message: i18n('notifications.updateSuccess') });
      setTimeout(() => router.go(-1), 1200);
    } else {
      notify({
        type: 'warning',
        message: i18n('notifications.updateFailed'),
        caption: response.message,
      });
    }
  } catch (error) {
    notify({
      type: 'negative',
      message: i18n('notifications.updateError'),
      caption: (error as Error).message,
    });
  } finally {
    submitting.value = false;
  }
};

const promptDeletePerson = () => {
  if (!personId.value) {
    return;
  }
  Dialog.create({
    component: DeletePersonDialog,
    componentProps: {
      personId: personId.value,
      personName: personDetail.value?.name,
    },
  }).onOk(() => setTimeout(() => router.go(-1), 1200));
};

const updatePersonDetail = async (token: string) => {
  if (!personId.value?.length) {
    return false;
  }
  try {
    const { data: response } = await getPerson(token, personId.value);
    if (response.success) {
      personDetail.value = response.data;
      editableName.value = response.data.name ?? '';
      editableRelationship.value = response.data.relationship;
      return true;
    } else {
      notify({
        type: 'warning',
        message: i18n('notifications.fetchPersonDetailFailed'),
        caption: response.message,
      });
      return false;
    }
  } catch (error) {
    notify({
      type: 'negative',
      message: i18n('notifications.fetchPersonDetailError'),
      caption: (error as Error).message,
    });
    return false;
  }
};

onMounted(async () => {
  if (!accessToken.value) {
    await router.push('/stack/auth?from=/stack/settings/voiceprint');
    return;
  }
  if (route.params.personId && typeof route.params.personId === 'string') {
    personId.value = route.params.personId;
  } else {
    router.go(-1);
    return;
  }
  if (!(await updatePersonDetail(accessToken.value))) {
    setTimeout(() => router.go(-1), 2000);
  }
});
</script>

<template>
  <q-page class="voiceprint-detail-page">
    <voice-naming-panel
      v-model:name="editableName"
      v-model:relationship="editableRelationship"
      :avatar-src="avatarImg"
      :whose-voice-label="i18n('labels.whoseVoice')"
      :name-placeholder="i18n('labels.namePlaceholder')"
      :relationship-label="i18n('labels.relationshipToChild')"
      :relationship-sheet-title="i18n('labels.selectRelationship')"
      :primary-label="i18n('labels.submitUpdate')"
      :primary-disabled="!personDetail || submitting"
      :loading="submitting"
      :secondary-label="i18n('labels.deletePerson')"
      secondary-variant="danger"
      @primary="submitUpdate"
      @secondary="promptDeletePerson"
    />
  </q-page>
</template>

<style scoped></style>
