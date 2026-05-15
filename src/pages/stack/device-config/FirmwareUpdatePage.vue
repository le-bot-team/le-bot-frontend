<script setup lang="ts">
// FirmwareUpdatePage — firmware version display and update control.

import { useQuasar } from 'quasar';
import { ref } from 'vue';

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.device-config.FirmwareUpdatePage');
const $q = useQuasar();

const currentVersion = ref('v1.2.3');
const latestVersion = ref('v1.3.0');
const isChecking = ref(false);
const isUpdating = ref(false);
const updateProgress = ref(0);

function checkUpdate() {
  isChecking.value = true;
  setTimeout(() => {
    isChecking.value = false;
    $q.notify({ type: 'positive', message: i18n('labels.updateAvailable') });
  }, 1500);
}

function startUpdate() {
  isUpdating.value = true;
  updateProgress.value = 0;
  const interval = setInterval(() => {
    updateProgress.value += 5;
    if (updateProgress.value >= 100) {
      clearInterval(interval);
      isUpdating.value = false;
      currentVersion.value = latestVersion.value;
      $q.notify({ type: 'positive', message: i18n('notifications.updateSuccess') });
    }
  }, 200);
}
</script>

<template>
  <q-page class="settings-sub-page">
    <!-- Version info card -->
    <div class="settings-sub-page__card">
      <div class="settings-sub-page__row">
        <span class="settings-sub-page__row-label">{{ i18n('labels.currentVersion') }}</span>
        <span class="settings-sub-page__row-value">{{ currentVersion }}</span>
      </div>
      <div class="settings-sub-page__row">
        <span class="settings-sub-page__row-label">{{ i18n('labels.latestVersion') }}</span>
        <span
          class="settings-sub-page__row-value"
          :style="{ color: currentVersion !== latestVersion ? 'var(--clr-link)' : '' }"
        >
          {{ latestVersion }}
        </span>
      </div>
    </div>

    <!-- Update progress -->
    <div v-if="isUpdating" class="q-mt-md">
      <div class="growth-section-title">{{ i18n('labels.updating') }}</div>
      <q-linear-progress
        :value="updateProgress / 100"
        color="cyan"
        track-color="grey-3"
        size="8px"
        rounded
      />
      <div class="text-caption q-mt-sm" style="color: var(--clr-caption)">
        {{ updateProgress }}%
      </div>
    </div>

    <!-- Action buttons -->
    <div class="q-mt-lg column items-center q-gutter-y-md">
      <button v-if="!isUpdating" class="btn-max" :disabled="isChecking" @click="checkUpdate">
        <q-spinner v-if="isChecking" size="20px" color="white" />
        <template v-else>{{ i18n('labels.checkUpdate') }}</template>
      </button>
      <button
        v-if="!isUpdating && currentVersion !== latestVersion"
        class="btn-max"
        style="background: var(--clr-dialog-btn-link-bg)"
        @click="startUpdate"
      >
        {{ i18n('labels.updateAvailable') }}
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

.btn-max:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
