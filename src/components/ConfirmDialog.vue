<script setup lang="ts">
// ConfirmDialog — shared confirmation dialog per design spec section 5 item 9.
// 311×238 card, r32, gradient bg. Sized via --dialog-width / --dialog-radius.
// Title + description + dual buttons.
// Usage:
//   import { useQuasar } from 'quasar'
//   const $q = useQuasar()
//   $q.dialog({ component: ConfirmDialog, componentProps: { title, body, confirmType } })
//     .onOk(() => { /* confirmed */ })

import { useDialogPluginComponent } from 'quasar';

import { i18nSubPath } from 'src/utils/common';

type ConfirmType = 'primary' | 'danger' | 'link';

/** Navigation link rendered inside the dialog body area */
export interface DialogLink {
  label: string;
  to: string;
}

withDefaults(
  defineProps<{
    title: string;
    body?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmType?: ConfirmType;
    /** Alert mode: hides the cancel button, shows only the confirm button centered */
    alert?: boolean;
    /** Optional navigation links rendered between body and action buttons */
    links?: DialogLink[];
  }>(),
  {
    body: '',
    confirmType: 'primary',
    alert: false,
    links: () => [],
  },
);
defineEmits(useDialogPluginComponent.emitsObject);

const i18n = i18nSubPath('components.dialogs.ConfirmDialog');

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } = useDialogPluginComponent();

function onLinkClick() {
  // Close the dialog when user clicks a navigation link
  onDialogOK();
}

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
      <div v-if="links.length > 0" class="confirm-dialog__links">
        <router-link
          v-for="(link, idx) in links"
          :key="idx"
          :to="link.to"
          class="confirm-dialog__link"
          @click="onLinkClick"
        >
          {{ link.label }}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </router-link>
      </div>
      <div class="confirm-dialog__actions">
        <button
          v-if="!alert"
          type="button"
          class="confirm-dialog__btn confirm-dialog__btn--cancel"
          @click="onDialogCancel"
        >
          {{ cancelLabel || i18n('labels.cancel') }}
        </button>
        <button type="button" :class="confirmBtnClass[confirmType]" @click="onDialogOK()">
          {{ confirmLabel || i18n('labels.confirm') }}
        </button>
      </div>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
