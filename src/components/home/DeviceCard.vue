<script setup lang="ts">
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('components.home.DeviceCard');
</script>

<template>
  <q-card bordered flat>
    <q-card-section class="row justify-between">
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
    </q-card-section>
  </q-card>
</template>

<style scoped></style>
