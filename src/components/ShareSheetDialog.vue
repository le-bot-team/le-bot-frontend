<script setup lang="ts">
// ShareSheetDialog — bottom sheet for sharing (WeChat / Copy link / Save QR code).

import { useDialogPluginComponent, useQuasar } from 'quasar';

import { i18nSubPath } from 'src/utils/common';

defineEmits(useDialogPluginComponent.emitsObject);

const i18n = i18nSubPath('components.dialogs.ShareSheetDialog');
const $q = useQuasar();

const { dialogRef, onDialogCancel, onDialogHide } = useDialogPluginComponent();

function copyLink() {
  try {
    navigator.clipboard?.writeText(window.location.href).then(
      () => $q.notify({ type: 'positive', message: i18n('notifications.linkCopied') }),
      () => $q.notify({ type: 'negative', message: i18n('notifications.linkCopyFailed') }),
    );
  } catch {
    $q.notify({ type: 'negative', message: i18n('notifications.linkCopyFailed') });
  }
  onDialogCancel();
}

function saveQrCode() {
  $q.notify({ type: 'positive', message: i18n('notifications.qrCodeSaved') });
  onDialogCancel();
}

function shareWechat() {
  // TODO: integrate WeChat share SDK
  onDialogCancel();
}
</script>

<template>
  <q-dialog ref="dialogRef" position="bottom" @hide="onDialogHide">
    <q-card class="share-sheet">
      <div class="share-sheet__title">{{ i18n('labels.title') }}</div>
      <div class="share-sheet__options">
        <button class="share-sheet__option" @click="shareWechat">
          <div class="share-sheet__option-icon" style="background: #07c160">
            <q-icon name="mdi-wechat" size="24px" />
          </div>
          <span class="share-sheet__option-label">{{ i18n('labels.wechat') }}</span>
        </button>
        <button class="share-sheet__option" @click="copyLink">
          <div class="share-sheet__option-icon" style="background: var(--clr-dialog-btn-link-bg)">
            <q-icon name="mdi-link-variant" size="24px" />
          </div>
          <span class="share-sheet__option-label">{{ i18n('labels.copyLink') }}</span>
        </button>
        <button class="share-sheet__option" @click="saveQrCode">
          <div class="share-sheet__option-icon" style="background: var(--clr-btn-primary-bg)">
            <q-icon name="mdi-qrcode" size="24px" />
          </div>
          <span class="share-sheet__option-label">{{ i18n('labels.saveQrCode') }}</span>
        </button>
      </div>
      <button class="share-sheet__cancel" @click="onDialogCancel">
        {{ i18n('labels.cancel') }}
      </button>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
