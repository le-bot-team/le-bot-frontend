<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { onBeforeMount } from 'vue';

import { deletePerson } from 'src/utils/api/voiceprint';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';

const props = defineProps<{
  personId: string;
  personName?: string | undefined;
}>();

defineEmits<{
  ok: [payload?: unknown];
  hide: [];
}>();

const { accessToken } = storeToRefs(useAuthStore());
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const { notify } = useQuasar();

const i18n = i18nSubPath('components.settings.voiceprint.DeletePersonDialog');

const confirm = async () => {
  if (!accessToken.value) {
    return;
  }
  try {
    const { data: response } = await deletePerson(accessToken.value, props.personId);
    if (response.success) {
      notify({
        type: 'positive',
        message: i18n('notifications.deleteSuccess'),
      });
      onDialogOK();
    } else {
      notify({
        type: 'warning',
        message: i18n('notifications.deleteFailed'),
        caption: response.message,
      });
    }
  } catch (error) {
    notify({
      type: 'negative',
      message: i18n('notifications.deleteError'),
      caption: (error as Error).message,
    });
  }
};

onBeforeMount(() => {
  if (!accessToken.value) {
    onDialogCancel();
  }
});
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card flat>
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">
          {{ i18n('labels.title') }}
        </div>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section class="text-body1 q-gutter-y-md">
        <div>
          {{ i18n('labels.deletePrompt', { personName: personName ?? personId }) }}
        </div>
        <div class="text-weight-bold">
          {{ i18n('labels.deleteWarning') }}
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat :label="i18n('labels.confirm')" color="negative" no-caps @click="confirm" />
        <q-btn color="primary" :label="i18n('labels.cancel')" no-caps @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
