<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { i18nSubPath } from 'src/utils/common';
import { useDeviceStore } from 'stores/device';

const i18n = i18nSubPath('pages.stack.device-config.AboutDevicePage');

const { currentDevice } = storeToRefs(useDeviceStore());

const infoItems = [
  { key: 'serialNumber', value: currentDevice.value?.identifier ?? '-' },
  { key: 'model', value: currentDevice.value?.model ?? '-' },
  { key: 'firmwareVersion', value: '1.0.0' },
  { key: 'macAddress', value: '-' },
  { key: 'manufactureDate', value: '-' },
  { key: 'hardwareVersion', value: '-' },
];
</script>

<template>
  <q-page class="column q-pa-md q-gutter-y-md">
    <div class="text-subtitle1 text-weight-medium">{{ i18n('labels.title') }}</div>

    <q-list bordered separator class="rounded-borders">
      <q-item v-for="item in infoItems" :key="item.key">
        <q-item-section>
          <q-item-label>{{ i18n(`labels.${item.key}`) }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-item-label>{{ item.value }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>
