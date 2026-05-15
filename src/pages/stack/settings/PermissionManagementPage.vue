<script setup lang="ts">
// PermissionManagementPage — permission list with system settings link (Template A).

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.settings.PermissionManagementPage');

const permissions = [
  { key: 'microphone', label: i18n('labels.microphone'), granted: true },
  { key: 'camera', label: i18n('labels.camera'), granted: false },
  { key: 'storage', label: i18n('labels.storage'), granted: true },
  { key: 'location', label: i18n('labels.location'), granted: false },
];
</script>

<template>
  <q-page class="settings-sub-page">
    <div class="settings-sub-page__card">
      <div v-for="perm in permissions" :key="perm.key" class="settings-sub-page__row">
        <span class="settings-sub-page__row-label">{{ perm.label }}</span>
        <span
          :style="{
            color: perm.granted ? 'var(--clr-link)' : 'var(--clr-danger-bg)',
            fontSize: '14px',
          }"
        >
          {{ perm.granted ? '✓' : '—' }}
        </span>
      </div>
    </div>
    <div class="q-mt-md">
      <button
        class="btn-max"
        @click="
          () => {
            /* open system settings */
          }
        "
      >
        {{ i18n('labels.openSettings') }}
      </button>
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
