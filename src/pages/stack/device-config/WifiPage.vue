<script setup lang="ts">
import { onUnmounted, ref } from 'vue';

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.device-config.WifiPage');

const scanning = ref(false);
const networks = ref<{ ssid: string; signal: number; secured: boolean }[]>([]);
let scanTimer: ReturnType<typeof setTimeout> | undefined;

function scan() {
  scanning.value = true;
  // Placeholder — real implementation will call device API
  scanTimer = setTimeout(() => {
    networks.value = [
      { ssid: 'Home-WiFi', signal: 80, secured: true },
      { ssid: 'Office-5G', signal: 60, secured: true },
      { ssid: 'Guest', signal: 40, secured: false },
    ];
    scanning.value = false;
  }, 1500);
}

onUnmounted(() => {
  if (scanTimer !== undefined) clearTimeout(scanTimer);
});

scan();
</script>

<template>
  <q-page class="column q-pa-md q-gutter-y-md">
    <div class="text-subtitle1 text-weight-medium">{{ i18n('labels.title') }}</div>

    <q-list v-if="networks.length" bordered separator class="rounded-borders">
      <q-item
        v-for="net in networks"
        :key="net.ssid"
        clickable
        role="option"
      >
        <q-item-section avatar>
          <q-icon :name="net.signal > 60 ? 'wifi' : 'wifi_2_bar'" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ net.ssid }}</q-item-label>
          <q-item-label caption>{{ net.secured ? '🔒' : '' }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <div v-else-if="scanning" class="text-center q-pa-lg text-grey">
      <q-spinner size="24px" class="q-mr-sm" />
      {{ i18n('labels.scanning') }}
    </div>

    <div v-else class="text-center q-pa-lg text-grey">
      {{ i18n('labels.noNetworks') }}
    </div>
  </q-page>
</template>
