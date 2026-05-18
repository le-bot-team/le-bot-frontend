<script setup lang="ts">
// DeviceCard — placeholder component for the home page device display.
// Will be replaced with a full implementation when device switching UI is finalized.
import { storeToRefs } from 'pinia';

import { useDeviceStore } from 'stores/device';

const { currentDevice } = storeToRefs(useDeviceStore());
</script>

<template>
  <q-card bordered flat class="device-card">
    <q-card-section>
      <div class="row items-center q-gutter-x-sm">
        <q-icon name="smart_toy" size="32px" color="primary" />
        <div class="column">
          <div class="text-subtitle1 text-weight-medium">
            {{ currentDevice?.name ?? '我的乐宝' }}
          </div>
          <div class="text-caption text-grey">
            {{ currentDevice?.model ?? '未绑定设备' }}
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
