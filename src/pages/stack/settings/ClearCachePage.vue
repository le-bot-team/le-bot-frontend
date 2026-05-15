<script setup lang="ts">
// ClearCachePage — cache clearing with confirmation (Template C).

import { useQuasar } from 'quasar';
import { ref } from 'vue';
import ConfirmDialog from 'src/components/ConfirmDialog.vue';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.settings.ClearCachePage');
const $q = useQuasar();

const cacheSize = ref('146M');

function handleClear() {
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: i18n('labels.confirmTitle'),
      body: i18n('labels.confirmBody'),
      confirmType: 'danger' as const,
    },
  }).onOk(() => {
    cacheSize.value = '0M';
    $q.notify({ type: 'positive', message: i18n('notifications.clearSuccess') });
  });
}
</script>

<template>
  <q-page class="settings-sub-page">
    <div class="settings-sub-page__card">
      <div class="settings-sub-page__row">
        <span class="settings-sub-page__row-label">{{ i18n('labels.cacheSize') }}</span>
        <span class="settings-sub-page__row-value">{{ cacheSize }}</span>
      </div>
    </div>
    <div class="q-mt-md">
      <button class="btn-max" @click="handleClear">{{ i18n('labels.clear') }}</button>
    </div>
  </q-page>
</template>

<style scoped>
.btn-max {
  width: var(--btn-width);
  height: var(--btn-height);
  border: none;
  border-radius: var(--btn-radius);
  background: var(--clr-btn-primary-bg);
  color: var(--clr-white);
  font-family: var(--font-family);
  font-size: var(--font-size-btn);
  font-weight: 500;
  cursor: pointer;
}
</style>
