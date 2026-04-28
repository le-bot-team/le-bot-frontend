<script setup lang="ts">
import { Notify } from 'quasar';
import { storeToRefs } from 'pinia';
import { onBeforeMount, reactive, computed } from 'vue';

import { router } from 'src/router';
import { logoutAccount } from 'src/utils/account';
import { i18nSubPath } from 'src/utils/common';
import { unbindAndRemoveDevice } from 'src/utils/device';
import { useDeviceStore } from 'stores/device';

const i18n = i18nSubPath('pages.stack.DeviceConfigPage');

const deviceStore = useDeviceStore();
const { currentDevice } = storeToRefs(deviceStore);

const isVirtual = computed(() => currentDevice.value?.type === 'virtual');

async function handleUnbind() {
  if (!currentDevice.value) return;

  if (isVirtual.value) {
    try {
      await unbindAndRemoveDevice(currentDevice.value.id);
      Notify.create({
        type: 'positive',
        message: i18n('notifications.unbindSuccess'),
        icon: 'check',
      });
      router.replace('/stack/devices').catch(console.error);
    } catch (err) {
      console.error('Failed to unbind device:', err);
      Notify.create({
        type: 'negative',
        message: i18n('notifications.unbindFailed'),
        icon: 'error',
      });
    }
  } else {
    logoutAccount();
  }
}

const menuGroups = reactive<
  { disabled?: boolean; label: string; sideLabel?: string; to?: string }[][]
>([
  [
    {
      label: i18n('labels.voiceStyle'),
      sideLabel: currentDevice.value?.config?.voiceStyle ?? i18n('labels.defaultStyle'),
      to: '/stack/device-config/voice',
    },
    {
      label: i18n('labels.language'),
      to: '/stack/device-config/language',
    },
    {
      label: i18n('labels.personalityAdjustment'),
      to: '/stack/device-config/personality',
    },
  ],
  [
    {
      label: i18n('labels.wifiManagement'),
      to: '/stack/device-config/wifi',
    },
    {
      label: i18n('labels.firmwareUpdate'),
      to: '/stack/device-config/update',
    },
    {
      label: i18n('labels.aboutThisDevice'),
      to: '/stack/device-config/about',
    },
  ],
]);

onBeforeMount(() => {
  if (!currentDevice.value) {
    router.go(-1);
  }
});
</script>

<template>
  <q-page class="column q-gutter-y-lg q-pa-md">
    <q-card v-for="(menuGroup, groupIndex) in menuGroups" :key="groupIndex" bordered flat>
      <q-list>
        <q-item
          v-for="(menu, menuIndex) in menuGroup"
          :key="menuIndex"
          :disable="menu.disabled"
          :to="menu.to"
        >
          <q-item-section>
            <q-item-label>
              {{ menu.label }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row items-center q-gutter-x-xs">
              <div v-if="menu.sideLabel?.length">{{ menu.sideLabel }}</div>
              <q-icon name="chevron_right" />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
    <q-btn color="red" :label="i18n('labels.unbindDevice')" @click="handleUnbind" />
  </q-page>
</template>

<style scoped></style>
