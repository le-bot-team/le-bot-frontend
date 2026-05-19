<script setup lang="ts">
// DevicesPage — device list with me-card styling and ConfirmDialog.

import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import ConfirmDialog from 'src/components/ConfirmDialog.vue';
import { i18nSubPath } from 'src/utils/common';
import { unbindAndRemoveDevice } from 'src/utils/device';
import { useDeviceStore } from 'stores/device';
import { MAX_VIRTUAL_DEVICES } from 'stores/device/types';

const i18n = i18nSubPath('pages.stack.DevicesPage');

const router = useRouter();
const $q = useQuasar();

const { virtualDevices } = storeToRefs(useDeviceStore());
const deviceStore = useDeviceStore();

const canAddMore = computed(() => virtualDevices.value.length < MAX_VIRTUAL_DEVICES);

function goToAddVirtualDevice() {
  router.push('/stack/add-virtual-device').catch(console.error);
}

function confirmUnbind(deviceId: string) {
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: i18n('labels.unbind'),
      body: i18n('labels.unbindConfirm'),
      confirmType: 'danger' as const,
      confirmLabel: i18n('labels.unbind'),
    },
  }).onOk(() => {
    void (async () => {
      try {
        await unbindAndRemoveDevice(deviceId);
        $q.notify({
          type: 'positive',
          message: i18n('notifications.unbindSuccess'),
          icon: 'check',
        });
      } catch (err) {
        console.error('Failed to unbind device:', err);
        $q.notify({ type: 'negative', message: i18n('notifications.unbindFailed'), icon: 'error' });
      }
    })();
  });
}

function goToDeviceConfig(deviceId: string) {
  deviceStore.setCurrentDevice(deviceId);
  router.push('/stack/device-config').catch(console.error);
}
</script>

<template>
  <q-page class="settings-page">
    <!-- Empty state -->
    <div
      v-if="virtualDevices.length === 0"
      class="column items-center justify-center q-gutter-y-md"
      style="flex: 1; padding: 80px 20px"
    >
      <q-icon name="mdi-robot-outline" size="4rem" color="grey-5" />
      <div class="text-body1 text-center" style="color: var(--clr-caption)">
        {{ i18n('labels.noVirtualDevices') }}
      </div>
    </div>

    <!-- Device list with me-card styling -->
    <div v-else class="me-card" role="list">
      <div
        v-for="device in virtualDevices"
        :key="device.id"
        role="button"
        tabindex="0"
        :aria-label="device.name || i18n('labels.virtualDevice')"
        class="settings-menu-row"
        @click="goToDeviceConfig(device.id)"
        @keydown.enter.space.prevent="goToDeviceConfig(device.id)"
      >
        <div class="column">
          <span>{{ device.name || i18n('labels.virtualDevice') }}</span>
          <span class="settings-menu-row__caption">{{
            i18n('labels.serialNumber', { sn: device.identifier })
          }}</span>
        </div>
        <span class="settings-menu-row__right">
          <q-btn
            dense
            flat
            style="color: var(--clr-danger-bg)"
            icon="mdi-link-off"
            :label="i18n('labels.unbind')"
            no-caps
            size="sm"
            @click.stop="confirmUnbind(device.id)"
          />
          <q-icon class="settings-menu-row__chevron" name="chevron_right" size="12px" />
        </span>
      </div>
    </div>

    <!-- Add button -->
    <div class="column items-center q-gutter-y-sm q-mt-lg">
      <button class="btn-max" :disabled="!canAddMore" @click="goToAddVirtualDevice">
        {{ i18n('labels.addVirtualDevice') }}
      </button>
      <div v-if="!canAddMore" class="text-caption" style="color: var(--clr-caption)">
        {{ i18n('labels.maxDevicesReached') }}
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.btn-max {
  width: var(--btn-width);
  height: var(--btn-height);
  border: none;
  border-radius: var(--btn-radius);
  background: var(--clr-btn-primary-bg);
  color: var(--clr-white);
  font-family: var(--font-family);
  font-size: var(--font-size-btn);
  font-weight: 500;
  line-height: var(--line-height-btn);
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-max:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-max:hover:not(:disabled) {
  opacity: 0.9;
}

.settings-menu-row__caption {
  font-size: 12px;
  color: var(--clr-caption);
  margin-top: 2px;
}
</style>
