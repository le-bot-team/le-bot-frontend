<script setup lang="ts">
import { onUnmounted, ref } from 'vue';

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.device-config.FirmwareUpdatePage');

const currentVersion = ref('1.0.0');
const latestVersion = ref<string | null>(null);
const checking = ref(false);
let checkTimer: ReturnType<typeof setTimeout> | undefined;

function checkUpdate() {
  checking.value = true;
  // Placeholder — real implementation will call device API
  checkTimer = setTimeout(() => {
    latestVersion.value = '1.0.0';
    checking.value = false;
  }, 1500);
}

onUnmounted(() => {
  if (checkTimer !== undefined) clearTimeout(checkTimer);
});
</script>

<template>
  <q-page class="column q-pa-md q-gutter-y-md">
    <div class="text-subtitle1 text-weight-medium">{{ i18n('labels.title') }}</div>

    <q-list bordered class="rounded-borders">
      <q-item>
        <q-item-section>
          <q-item-label>{{ i18n('labels.currentVersion') }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-item-label>{{ currentVersion }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-if="latestVersion">
        <q-item-section>
          <q-item-label>{{ i18n('labels.latestVersion') }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-item-label>{{ latestVersion }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <div v-if="latestVersion === currentVersion" class="text-center text-positive">
      {{ i18n('labels.upToDate') }}
    </div>

    <q-btn
      color="primary"
      :label="i18n('labels.checkUpdate')"
      :loading="checking"
      class="full-width"
      @click="checkUpdate"
    />
  </q-page>
</template>
