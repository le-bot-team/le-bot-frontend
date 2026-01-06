<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';

import DeviceCard from 'components/home/DeviceCard.vue';
import TopicCard from 'components/home/TopicCard.vue';

import { router } from 'src/router';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';

const i18n = i18nSubPath('pages.main.HomePage');

const { accessToken } = storeToRefs(useAuthStore());
const options = ref([
  {
    label: i18n('labels.myDevices'),
    value: 'myDevices',
  },
]);

const selected = ref(options.value[0]);

onBeforeMount(() => {
  if (!accessToken.value?.length) {
    router.push('/stack/auth?from=/main/home').catch((err) => console.error(err));
  }
});
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
    <q-skeleton class="col-grow" animation="blink" />
    <q-btn
      class="text-h6"
      color="primary"
      :label="i18n('labels.tryChatting')"
      no-caps
      outline
      to="/stack/chat"
    />
    <topic-card />
  </q-page>
</template>

<style lang="scss" scoped></style>
