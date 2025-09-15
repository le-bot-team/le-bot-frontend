<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

import { i18nSubPath } from 'src/utils/common';

defineProps<{
  isNew: boolean;
  name: string | number;
  nickname?: string;
}>();

const i18n = i18nSubPath('components.auth.FinishPanel');

const { notify } = useQuasar();
const route = useRoute();

onMounted(() => {
  notify({
    type: 'positive',
    message: i18n('messages.success'),
    timeout: 2000,
  });
  setInterval(() => {
    if (route.query.from) {
      window.location.href = route.query.from.toString();
    } else {
      window.location.href = '/';
    }
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
  </q-tab-panel>
</template>

<style scoped></style>
