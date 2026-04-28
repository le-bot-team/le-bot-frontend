<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { i18nSubPath } from 'src/utils/common';
import { useDeviceStore } from 'stores/device';

const i18n = i18nSubPath('components.home.DeviceCard');

const { virtualDevices, currentDevice } = storeToRefs(useDeviceStore());
</script>

<template>
  <q-card bordered flat>
    <q-card-section class="row justify-between">
      <!-- No virtual device: show add prompt -->
      <template v-if="virtualDevices.length === 0">
        <div class="column justify-center items-start">
          <div class="text-h6">
            {{ i18n('labels.noDevice') }}
          </div>
          <div v-if="false" class="text-grey">Chatting</div>
        </div>
        <div class="column justify-center items-end">
          <q-btn
            dense
            flat
            icon-right="mdi-chevron-right"
            :label="i18n('labels.addNewDevice')"
            no-caps
            to="/stack/devices?action=add"
          />
        </div>
      </template>
      <!-- Has virtual device: show current device info -->
      <template v-else>
        <div class="column justify-center items-start">
          <div class="text-h6">
            {{ currentDevice?.name || currentDevice?.identifier || i18n('labels.noDevice') }}
          </div>
          <div v-if="currentDevice" class="text-grey">
            {{ currentDevice.identifier }}
          </div>
        </div>
        <div class="column justify-center items-end">
          <q-btn
            dense
            flat
            icon-right="mdi-chevron-right"
            :label="i18n('labels.addNewDevice')"
            no-caps
            to="/stack/devices?action=add"
          />
        </div>
      </template>
    </q-card-section>
  </q-card>
</template>

<style scoped></style>
