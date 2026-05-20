<script setup lang="ts">
// WifiPage — Wi-Fi management page.
// Layout: connected status card + available networks list + password dialog.

import { useQuasar } from 'quasar';
import { ref } from 'vue';

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.device-config.WifiPage');
const $q = useQuasar();

const connectedSSID = ref('LeBot-Home');
const isScanning = ref(false);
const passwordInput = ref('');
const showPasswordDialog = ref(false);
const selectedNetwork = ref('');

interface WifiNetwork {
  ssid: string;
  signal: number;
  secured: boolean;
}

const availableNetworks = ref<WifiNetwork[]>([
  { ssid: 'Neighbor-5G', signal: 3, secured: true },
  { ssid: 'CoffeeShop-Free', signal: 2, secured: false },
  { ssid: 'Office-Guest', signal: 1, secured: false },
]);

function scanNetworks() {
  isScanning.value = true;
  setTimeout(() => {
    isScanning.value = false;
  }, 2000);
}

function selectNetwork(network: WifiNetwork) {
  if (network.secured) {
    selectedNetwork.value = network.ssid;
    passwordInput.value = '';
    showPasswordDialog.value = true;
  } else {
    connectToNetwork(network.ssid);
  }
}

function connectToNetwork(ssid: string) {
  showPasswordDialog.value = false;
  $q.notify({ type: 'positive', message: i18n('notifications.connectSuccess') });
  connectedSSID.value = ssid;
}

function onConnectConfirm() {
  if (!passwordInput.value) return;
  connectToNetwork(selectedNetwork.value);
}
</script>

<template>
  <q-page class="settings-sub-page">
    <!-- Connected status card -->
    <div class="settings-sub-page__card">
      <div class="settings-sub-page__row">
        <span class="settings-sub-page__row-label">{{ i18n('labels.connected') }}</span>
        <span class="settings-sub-page__row-value" style="color: var(--clr-link)">{{
          connectedSSID
        }}</span>
      </div>
    </div>

    <!-- Available networks -->
    <div class="growth-section-title">{{ i18n('labels.availableNetworks') }}</div>
    <div class="settings-sub-page__card">
      <button
        v-for="network in availableNetworks"
        :key="network.ssid"
        type="button"
        class="settings-sub-page__row"
        style="cursor: pointer"
        @click="selectNetwork(network)"
      >
        <span class="settings-sub-page__row-label">{{ network.ssid }}</span>
        <span class="settings-sub-page__row-right">
          <q-icon
            :name="
              network.signal >= 3
                ? 'mdi-wifi-strength-3'
                : network.signal >= 2
                  ? 'mdi-wifi-strength-2'
                  : 'mdi-wifi-strength-1'
            "
            size="18px"
            style="color: var(--clr-caption)"
          />
          <q-icon
            v-if="network.secured"
            name="mdi-lock"
            size="14px"
            style="color: var(--clr-caption)"
          />
        </span>
      </button>

      <div v-if="isScanning" class="settings-sub-page__row" style="justify-content: center">
        <q-spinner size="24px" color="primary" />
        <span class="q-ml-sm" style="color: var(--clr-caption)">{{ i18n('labels.scanning') }}</span>
      </div>

      <div
        v-if="!isScanning && availableNetworks.length === 0"
        class="settings-sub-page__row"
        style="justify-content: center"
      >
        <span style="color: var(--clr-caption)">{{ i18n('labels.noNetworks') }}</span>
      </div>
    </div>

    <div class="q-mt-md">
      <button class="btn-max" @click="scanNetworks">{{ i18n('labels.scanNetworks') }}</button>
    </div>

    <!-- Password dialog -->
    <q-dialog v-model="showPasswordDialog">
      <q-card class="confirm-dialog">
        <div class="confirm-dialog__title">{{ selectedNetwork }}</div>
        <q-input
          v-model="passwordInput"
          :placeholder="i18n('labels.passwordPlaceholder')"
          outlined
          dense
          type="password"
          class="q-mb-md"
        />
        <div class="confirm-dialog__actions">
          <button
            class="confirm-dialog__btn confirm-dialog__btn--cancel"
            @click="showPasswordDialog = false"
          >
            {{ i18n('labels.cancel') }}
          </button>
          <button
            class="confirm-dialog__btn confirm-dialog__btn--confirm"
            @click="onConnectConfirm"
          >
            {{ i18n('labels.connect') }}
          </button>
        </div>
      </q-card>
    </q-dialog>
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
  cursor: pointer;
}
</style>
