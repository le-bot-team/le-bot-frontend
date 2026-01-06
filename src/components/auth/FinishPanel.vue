<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useTimeout } from 'quasar';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { router } from 'src/router';
import { retrieveProfile } from 'src/utils/account';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';
import { useDeviceStore } from 'stores/device';
import { useProfileStore } from 'stores/profile';
import { retrieveDevices } from 'src/utils/device';

defineProps<{
  isNew: boolean;
  name: string | number;
  nickname?: string;
}>();
const emit = defineEmits<{
  restart: [];
}>();

const i18n = i18nSubPath('components.auth.FinishPanel');

const { accessToken } = storeToRefs(useAuthStore());
const { updateDevices } = useDeviceStore();
const { updateProfile } = useProfileStore();
const route = useRoute();
const { registerTimeout } = useTimeout();

const isFailed = ref(false);
const isReady = ref(false);

const startOver = () => {
  emit('restart');
};

onMounted(async () => {
  try {
    updateDevices(await retrieveDevices());
    updateProfile(await retrieveProfile());
    isReady.value = true;
    registerTimeout(() => {
      router
        .push(typeof route.query.from === 'string' ? route.query.from : '/')
        .catch((error) => console.warn(error));
    }, 3000);
  } catch (error) {
    console.warn('Failed to validate access token', error);
    isFailed.value = true;
  }

  if (isFailed.value) {
    accessToken.value = '';
    updateProfile();
  }
});
</script>

<template>
  <q-tab-panel class="q-gutter-y-md" :name="name">
    <div class="text-h6 text-center" style="white-space: pre-line">
      {{ i18n(`labels.${isNew ? 'welcomeNew' : 'welcome'}`, { username: nickname ?? 'guest' }) }}
    </div>
    <div v-if="isFailed" class="text-body1 text-center text-negative" style="white-space: pre-line">
      {{ i18n('labels.setupFailed') }}
    </div>
    <div v-else class="text-body1 text-center text-grey" style="white-space: pre-line">
      {{ isReady ? i18n('labels.redirect') : i18n('labels.settingUp') }}
    </div>
    <div class="row justify-center">
      <q-btn v-if="isFailed" :label="i18n('labels.startOver')" @click="startOver" />
      <q-spinner v-else size="xl" />
    </div>
  </q-tab-panel>
</template>

<style scoped></style>
