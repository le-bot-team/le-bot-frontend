<script setup lang="ts">
// AboutDevicePage — device info list (SN, model, firmware, MAC, etc.).

import { i18nSubPath } from 'src/utils/common';
import { useDeviceStore } from 'stores/device';
import { storeToRefs } from 'pinia';

const i18n = i18nSubPath('pages.stack.device-config.AboutDevicePage');

const { currentDevice } = storeToRefs(useDeviceStore());

interface DeviceInfoRow {
  label: string;
  value: string;
}

const infoRows: DeviceInfoRow[] = [
  { label: i18n('labels.serialNumber'), value: currentDevice.value?.identifier ?? '—' },
  { label: i18n('labels.model'), value: 'LeBot-V1' },
  { label: i18n('labels.firmwareVersion'), value: 'v1.2.3' },
  { label: i18n('labels.macAddress'), value: 'AA:BB:CC:DD:EE:FF' },
  { label: i18n('labels.hardwareVersion'), value: 'HW-2.0' },
  { label: i18n('labels.manufactureDate'), value: '2025-01' },
];
</script>

<template>
  <q-page class="settings-sub-page">
    <div class="settings-sub-page__card">
      <div v-for="(row, index) in infoRows" :key="index" class="settings-sub-page__row">
        <span class="settings-sub-page__row-label">{{ row.label }}</span>
        <span class="settings-sub-page__row-value">{{ row.value }}</span>
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
