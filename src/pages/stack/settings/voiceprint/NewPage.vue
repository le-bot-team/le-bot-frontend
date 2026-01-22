<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';

import RecordPanel from 'components/settings/voiceprint/RecordPanel.vue';
import SubmitPanel from 'components/settings/voiceprint/SubmitPanel.vue';

import { router } from 'src/router';
import { useAuthStore } from 'stores/auth';

const { accessToken } = storeToRefs(useAuthStore());
const route = useRoute();

const data = ref<Blob>();
const panelIndex = ref<number>(0);
const personId = ref<string>();

onBeforeMount(async () => {
  if (!accessToken.value) {
    await router.push('/stack/auth?from=/stack/settings/voiceprint/new');
    return;
  }
  if (typeof route.query.personId === 'string') {
    personId.value = route.query.personId;
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
      <submit-panel
        :name="1"
        :data="data"
        :person-id="personId"
        @finish="router.go(-1)"
        @previous="panelIndex = 0"
      />
    </q-tab-panels>
  </q-page>
</template>

<style scoped></style>
