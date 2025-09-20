<script setup lang="ts">
import { useTimeout } from 'quasar';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { i18nSubPath } from 'src/utils/common';

defineProps<{
  isNew: boolean;
  name: string | number;
  nickname?: string;
}>();

const i18n = i18nSubPath('components.auth.FinishPanel');

const route = useRoute();
const router = useRouter();
const { registerTimeout } = useTimeout();

onMounted(() => {
  registerTimeout(() => {
    router
      .replace(typeof route.query.from === 'string' ? route.query.from : '/')
      .catch((error) => console.warn(error));
  }, 3000);
});
</script>

<template>
  <q-tab-panel class="q-gutter-y-md" :name="name">
    <div class="text-h6 text-center" style="white-space: pre-line">
      {{ i18n(`labels.${isNew ? 'welcomeNew' : 'welcome'}`, { username: nickname ?? 'guest' }) }}
    </div>
    <div class="text-body1 text-center text-grey" style="white-space: pre-line">
      {{ i18n('labels.redirect') }}
    </div>
    <div class="row justify-center">
      <q-spinner size="xl" />
    </div>
  </q-tab-panel>
</template>

<style scoped></style>
