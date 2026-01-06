<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, reactive } from 'vue';

import { router } from 'src/router';
import { logoutAccount } from 'src/utils/account';
import { i18nSubPath } from 'src/utils/common';
import { useDeviceStore } from 'stores/device';

const i18n = i18nSubPath('pages.stack.DeviceConfigPage');

const { currentDevice } = storeToRefs(useDeviceStore());

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
    <q-btn color="red" :label="i18n('labels.unbindDevice')" @click="logoutAccount" />
  </q-page>
</template>

<style scoped></style>
