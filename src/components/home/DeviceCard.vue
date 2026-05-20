<script setup lang="ts">
// DeviceCard — placeholder component for the home page device display.
// Will be replaced with a full implementation when device switching UI is finalized.
import { storeToRefs } from 'pinia';

import { i18nSubPath } from 'src/utils/common';
import { useDeviceStore } from 'stores/device';

const i18n = i18nSubPath('components.home.DeviceCard');
const { currentDevice } = storeToRefs(useDeviceStore());
</script>

<template>
  <q-card bordered flat class="device-card">
    <q-card-section>
      <div class="row items-center q-gutter-x-sm">
        <q-icon name="smart_toy" size="32px" color="primary" />
        <div class="column">
          <div class="text-subtitle1 text-weight-medium">
            {{ currentDevice?.name ?? i18n('labels.defaultName') }}
          </div>
          <div class="text-caption text-grey">
            {{ currentDevice?.model ?? i18n('labels.noDevice') }}
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.device-card {
  border-radius: 12px;
}
</style>
