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
  <q-tab-panel class="finish-panel" :name="name">
    <div class="finish-title">
      {{ i18n(`labels.${isNew ? 'welcomeNew' : 'welcome'}`, { username: nickname ?? 'guest' }) }}
    </div>
    <div v-if="isFailed" class="finish-msg error">
      {{ i18n('labels.setupFailed') }}
    </div>
    <div v-else class="finish-msg">
      {{ isReady ? i18n('labels.redirect') : i18n('labels.settingUp') }}
    </div>
    <div class="finish-action">
      <button v-if="isFailed" class="btn-max" @click="startOver">
        {{ i18n('labels.startOver') }}
      </button>
      <q-spinner v-else size="lg" class="finish-spinner" />
    </div>
  </q-tab-panel>
</template>

<style scoped>
.finish-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 0 32px;
}

.finish-title {
  font-family: var(--font-family);
  font-size: var(--font-size-slogan-entry);
  font-weight: 500;
  line-height: var(--line-height-body);
  color: var(--clr-slogan-entry);
  text-align: center;
  white-space: pre-line;
}

.finish-msg {
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  font-weight: 400;
  line-height: var(--line-height-body);
  color: var(--clr-weak);
  text-align: center;
  white-space: pre-line;
}

.finish-msg.error {
  color: var(--clr-error);
  font-weight: 500;
}

.finish-action {
  margin-top: 8px;
}

.btn-max {
  width: 311px;
  height: 56px;
  border: none;
  border-radius: 28px;
  background: rgba(18, 14, 44, 1);
  color: var(--clr-white, rgba(255, 255, 255, 1));
  font-family: var(--font-family, 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif);
  font-size: 17px;
  font-weight: 500;
  line-height: 24px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-max:hover {
  opacity: 0.9;
}

.finish-spinner {
  color: var(--clr-link) !important;
}
</style>
