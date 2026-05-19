<script setup lang="ts">
// DeviceConfigPage — robot configuration main page with me-card + me-btn-danger styling.

import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { onBeforeMount, computed } from 'vue';

import ConfirmDialog from 'src/components/ConfirmDialog.vue';
import { router } from 'src/router';
import { i18nSubPath } from 'src/utils/common';
import { unbindAndRemoveDevice } from 'src/utils/device';
import { useDeviceStore } from 'stores/device';
import { useTracker } from 'src/composables/useTracker';

const i18n = i18nSubPath('pages.stack.DeviceConfigPage');
const voiceI18n = i18nSubPath('pages.stack.VoiceStylePage');
const $q = useQuasar();
const { trackClick } = useTracker();

const deviceStore = useDeviceStore();
const { currentDevice } = storeToRefs(deviceStore);

const isVirtual = computed(() => currentDevice.value?.type === 'virtual');

// TODO: 当真实硬件设备上线时，恢复 Wi-Fi 管理 / 固件升级 / 关于本设备 菜单
const HIDE_HARDWARE_MENUS = true;

function handleUnbind() {
  if (!currentDevice.value) return;

  trackClick('btn_click_unbind_device');
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: i18n('labels.deleteConfirmTitle'),
      body: i18n('labels.deleteConfirmBody'),
      confirmType: 'danger' as const,
      confirmLabel: i18n('labels.confirmDelete'),
    },
  }).onOk(() => {
    void (async () => {
      try {
        await unbindAndRemoveDevice(currentDevice.value!.id);
        $q.notify({
          type: 'positive',
          message: i18n('notifications.unbindSuccess'),
          icon: 'check',
        });
        router.replace('/main/home').catch(console.error);
      } catch (err) {
        console.error('Failed to unbind device:', err);
        $q.notify({
          type: 'negative',
          message: i18n('notifications.unbindFailed'),
          icon: 'error',
        });
      }
    })();
  });
}

const visibleMenuGroups = computed(() => {
  const groups: { label: string; sideLabel?: string; to?: string }[][] = [
    [
      {
        label: i18n('labels.voiceStyle'),
        sideLabel: currentDevice.value?.config?.voiceStyle
          ? voiceI18n(`styles.${currentDevice.value.config.voiceStyle}`)
          : i18n('labels.defaultStyle'),
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
  ];

  if (!HIDE_HARDWARE_MENUS && !isVirtual.value) {
    groups.push([
      { label: i18n('labels.wifiManagement'), to: '/stack/device-config/wifi' },
      { label: i18n('labels.firmwareUpdate'), to: '/stack/device-config/update' },
      { label: i18n('labels.aboutThisDevice'), to: '/stack/device-config/about' },
    ]);
  }

  return groups;
});

onBeforeMount(() => {
  if (!currentDevice.value) {
    router.go(-1);
  }
});
</script>

<template>
  <q-page class="settings-page column">
    <div v-for="(menuGroup, groupIndex) in visibleMenuGroups" :key="groupIndex" class="me-card">
      <button
        v-for="(menu, menuIndex) in menuGroup"
        :key="menuIndex"
        type="button"
        class="settings-menu-row"
        @click="menu.to ? router.push(menu.to).catch(console.error) : undefined"
      >
        <span>{{ menu.label }}</span>
        <span class="settings-menu-row__right">
          <span v-if="menu.sideLabel?.length" class="settings-menu-row__caption">
            {{ menu.sideLabel }}
          </span>
          <q-icon class="settings-menu-row__chevron" name="chevron_right" size="12px" />
        </span>
      </button>
    </div>

    <q-space />

    <button class="me-btn-danger delete-device-btn" type="button" @click="handleUnbind">
      {{ i18n('labels.unbindDevice') }}
    </button>
  </q-page>
</template>

<style scoped>
.delete-device-btn {
  margin: 40px auto;
}
</style>
