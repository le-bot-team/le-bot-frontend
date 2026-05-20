<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';

import { i18nSubPath } from 'src/utils/common';

const props = withDefaults(
  defineProps<{
    title?: string;
    body?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmType?: 'primary' | 'danger';
  }>(),
  {
    title: undefined,
    body: undefined,
    confirmLabel: undefined,
    cancelLabel: undefined,
    confirmType: 'primary',
  },
);
defineEmits(useDialogPluginComponent.emitsObject);

const i18n = i18nSubPath('components.dialogs.ConfirmDialog');

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } = useDialogPluginComponent();
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <div class="confirm-dialog">
      <div v-if="props.title" class="confirm-dialog__title">
        {{ props.title }}
      </div>
      <div v-if="props.body" class="confirm-dialog__body">
        {{ props.body }}
      </div>
      <div class="confirm-dialog__actions">
        <button
          class="confirm-dialog__btn confirm-dialog__btn--cancel"
          type="button"
          @click="onDialogCancel"
        >
          {{ props.cancelLabel || i18n('labels.cancel') }}
        </button>
        <button
          class="confirm-dialog__btn"
          :class="`confirm-dialog__btn--${props.confirmType}`"
          type="button"
          @click="onDialogOK()"
        >
          {{ props.confirmLabel || i18n('labels.confirm') }}
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<style scoped></style>
