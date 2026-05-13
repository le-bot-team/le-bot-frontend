<script setup lang="ts">
// ConfirmDialog — shared confirmation dialog per design spec section 5 item 9.
// 280×180 card, r16, title + description + dual buttons.
// Usage:
//   import { useQuasar } from 'quasar'
//   const $q = useQuasar()
//   $q.dialog({ component: ConfirmDialog, componentProps: { title, body, confirmType } })
//     .onOk(() => { /* confirmed */ })

import { useDialogPluginComponent } from 'quasar';

import { i18nSubPath } from 'src/utils/common';

type ConfirmType = 'primary' | 'danger' | 'link';

withDefaults(
  defineProps<{
    title: string;
    body?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmType?: ConfirmType;
  }>(),
  {
    body: '',
    confirmType: 'primary',
  },
);
defineEmits(useDialogPluginComponent.emitsObject);

const i18n = i18nSubPath('components.dialogs.ConfirmDialog');

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } = useDialogPluginComponent();

const confirmBtnClass: Record<ConfirmType, string> = {
  primary: 'confirm-dialog__btn confirm-dialog__btn--primary',
  danger: 'confirm-dialog__btn confirm-dialog__btn--danger',
  link: 'confirm-dialog__btn confirm-dialog__btn--link',
};
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="confirm-dialog">
      <div class="confirm-dialog__title">{{ title }}</div>
      <div v-if="body" class="confirm-dialog__body">{{ body }}</div>
      <div class="confirm-dialog__actions">
        <button class="confirm-dialog__btn confirm-dialog__btn--cancel" @click="onDialogCancel">
          {{ cancelLabel || i18n('labels.cancel') }}
        </button>
        <button :class="confirmBtnClass[confirmType]" @click="onDialogOK">
          {{ confirmLabel || i18n('labels.confirm') }}
        </button>
      </div>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
