<script setup lang="ts">
import { ref } from 'vue';

import DeviceCard from 'components/home/DeviceCard.vue';
import { i18nSubPath } from 'src/utils/common';
import TopicCard from 'components/home/TopicCard.vue';

const i18n = i18nSubPath('pages.main.HomePage');

const options = ref([
  {
    label: i18n('labels.myDevices'),
    value: 'myDevices',
  },
]);

const selected = ref(options.value[0]);
</script>

<template>
  <q-page class="column q-gutter-y-md q-pa-md">
    <div class="row q-pl-xs">
      <q-select borderless dense :options="options" v-model="selected" />
      <q-space />
      <q-btn dense flat icon="mdi-plus-box-outline" />
      <q-btn dense flat icon="mdi-bell-outline" />
    </div>
    <device-card />
    <q-skeleton class="col-grow" animation="blink"/>
    <q-btn class="text-h6" color="primary" :label="i18n('labels.tryChatting')" no-caps outline to="/stack/chat" />
    <topic-card />
  </q-page>
</template>

<style lang="scss" scoped></style>
