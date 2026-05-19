<script setup lang="ts">
/**
 * ConfirmDialog — reusable confirmation dialog component for Quasar Dialog plugin.
 *
 * Usage:
 *   $q.dialog({ component: ConfirmDialog, componentProps: { title, body, confirmLabel, confirmType } })
 *     .onOk(() => { ... })
 */
import { useDialogPluginComponent } from 'quasar';

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('components.dialogs.ConfirmDialog');

const props = withDefaults(
  defineProps<{
    title?: string;
    body?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmType?: 'primary' | 'danger';
  }>(),
  {
    title: '',
    body: '',
    confirmLabel: '',
    cancelLabel: '',
    confirmType: 'primary',
  },
);

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="confirm-dialog-card">
      <q-card-section v-if="props.title" class="text-h6">
        {{ props.title }}
      </q-card-section>
      <q-card-section v-if="props.body" class="q-pt-none">
        {{ props.body }}
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat :label="props.cancelLabel || i18n('labels.cancel')" color="grey" @click="onDialogCancel" />
        <q-btn
          flat
          :label="props.confirmLabel || i18n('labels.confirm')"
          :color="props.confirmType === 'danger' ? 'negative' : 'primary'"
          @click="onDialogOK"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.confirm-dialog-card {
  min-width: 280px;
}
</style>
