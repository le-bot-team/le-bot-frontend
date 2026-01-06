<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';

import RecordPanel from 'components/settings/voiceprint/RecordPanel.vue';

import { router } from 'src/router';
import { useAuthStore } from 'stores/auth';
import ConfirmPanel from 'components/settings/voiceprint/ConfirmPanel.vue';

const { accessToken } = storeToRefs(useAuthStore());

const data = ref<Blob>();
const panelIndex = ref<number>(0);

onBeforeMount(async () => {
  if (!accessToken.value) {
    await router.push('/stack/auth?from=/stack/settings/voiceprint/new');
    return;
  }
});
</script>

<template>
  <q-page class="column q-gutter-y-lg q-pa-md">
    <q-tab-panels class="full-width col-grow bg-transparent" v-model="panelIndex">
      <record-panel
        :name="0"
        @next="
          (_data: Blob) => {
            data = _data;
            panelIndex = 1;
          }
        "
      />
      <confirm-panel :name="1" :data="data" @finish="router.go(-1)" @previous="panelIndex = 0" />
    </q-tab-panels>
  </q-page>
</template>

<style scoped></style>
