<script setup lang="ts">
import { Notify } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { i18nSubPath } from 'src/utils/common';
import { activateAndAddVirtualDevice, unbindAndRemoveDevice } from 'src/utils/device';
import { useDeviceStore } from 'stores/device';
import { MAX_VIRTUAL_DEVICES } from 'stores/device/types';

const i18n = i18nSubPath('pages.stack.DevicesPage');

const router = useRouter();
const route = useRoute();

const { virtualDevices } = storeToRefs(useDeviceStore());
const deviceStore = useDeviceStore();

const isActivating = ref(false);
const unbindingDeviceId = ref<string | null>(null);
const showUnbindDialog = computed(() => unbindingDeviceId.value !== null);

const canAddMore = computed(() => virtualDevices.value.length < MAX_VIRTUAL_DEVICES);

async function handleActivate() {
  if (isActivating.value || !canAddMore.value) return;

  isActivating.value = true;
  try {
    await activateAndAddVirtualDevice();
    Notify.create({
      type: 'positive',
      message: i18n('notifications.activateSuccess'),
      icon: 'check',
    });
  } catch (err) {
    console.error('Failed to activate virtual device:', err);
    Notify.create({
      type: 'negative',
      message: i18n('notifications.activateFailed'),
      icon: 'error',
    });
  } finally {
    isActivating.value = false;
  }
}

function confirmUnbind(deviceId: string) {
  unbindingDeviceId.value = deviceId;
}

async function handleUnbind() {
  const deviceId = unbindingDeviceId.value;
  if (!deviceId) return;

  try {
    await unbindAndRemoveDevice(deviceId);
    Notify.create({
      type: 'positive',
      message: i18n('notifications.unbindSuccess'),
      icon: 'check',
    });
  } catch (err) {
    console.error('Failed to unbind device:', err);
    Notify.create({
      type: 'negative',
      message: i18n('notifications.unbindFailed'),
      icon: 'error',
    });
  } finally {
    unbindingDeviceId.value = null;
  }
}

function goToDeviceConfig(deviceId: string) {
  deviceStore.setCurrentDevice(deviceId);
  router.push('/stack/device-config').catch(console.error);
}

onMounted(() => {
  // If navigated with ?action=add, auto-trigger activation
  if (route.query.action === 'add') {
    void handleActivate();
  }
});
</script>

<template>
  <q-page class="column q-gutter-y-lg q-pa-md">
    <!-- Empty state -->
    <div
      v-if="virtualDevices.length === 0 && !isActivating"
      class="column items-center justify-center q-gutter-y-md"
      style="flex: 1"
    >
      <q-icon name="mdi-robot-outline" size="4rem" color="grey-5" />
      <div class="text-grey-6 text-body1 text-center">
        {{ i18n('labels.noVirtualDevices') }}
      </div>
    </div>

    <!-- Device list -->
    <q-card
      v-for="device in virtualDevices"
      :key="device.id"
      bordered
      flat
      class="cursor-pointer"
      @click="goToDeviceConfig(device.id)"
    >
      <q-card-section class="row items-center q-gutter-y-none">
        <div class="column q-gutter-y-xs" style="flex: 1">
          <div class="text-h6">
            {{ device.name || i18n('labels.virtualDevice') }}
          </div>
          <div class="text-caption text-grey-6">
            {{ i18n('labels.serialNumber', { sn: device.identifier }) }}
          </div>
        </div>
        <div class="column items-end q-gutter-y-xs">
          <q-icon name="chevron_right" color="grey-6" />
          <q-btn
            dense
            flat
            color="negative"
            icon="mdi-link-off"
            :label="i18n('labels.unbind')"
            no-caps
            size="sm"
            @click.stop="confirmUnbind(device.id)"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Add button area -->
    <div class="column items-center q-gutter-y-sm">
      <q-btn
        color="primary"
        :disable="!canAddMore || isActivating"
        :loading="isActivating"
        icon="mdi-plus"
        :label="i18n('labels.addVirtualDevice')"
        no-caps
        @click="handleActivate"
      />
      <div v-if="!canAddMore" class="text-caption text-grey-6">
        {{ i18n('labels.maxDevicesReached') }}
      </div>
    </div>

    <!-- Unbind confirmation dialog -->
    <q-dialog v-model="showUnbindDialog" persistent @hide="unbindingDeviceId = null">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="mdi-alert" color="negative" text-color="white" />
          <span class="q-ml-sm text-h6">{{ i18n('labels.unbindConfirm') }}</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="i18n('labels.cancel')" color="grey" v-close-popup />
          <q-btn flat :label="i18n('labels.unbind')" color="negative" @click="handleUnbind" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped></style>
