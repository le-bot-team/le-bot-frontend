<script setup lang="ts">
import { ref } from 'vue';

import { i18nSubPath } from 'src/utils/common';
import { useDeviceStore } from 'stores/device';

const i18n = i18nSubPath('pages.stack.VoiceStylePage');

const deviceStore = useDeviceStore();

const styles = [
  { key: 'cuteChild', icon: 'child_care' },
  { key: 'gentleSister', icon: 'face_3' },
  { key: 'sunnyBoy', icon: 'face_6' },
  { key: 'cuteRobot', icon: 'smart_toy' },
  { key: 'sweetLady', icon: 'face_4' },
] as const;

const selectedKey = ref(deviceStore.currentDevice?.config?.voiceStyle ?? 'cuteChild');

function selectStyle(key: string) {
  selectedKey.value = key;
  deviceStore.updateCurrentDeviceConfig({ voiceStyle: key });
}
</script>

<template>
  <q-page class="column q-pa-md q-gutter-y-md">
    <div class="text-subtitle1 text-weight-medium">{{ i18n('labels.sectionTitle') }}</div>
    <q-list bordered separator class="rounded-borders">
      <q-item
        v-for="style in styles"
        :key="style.key"
        clickable
        role="option"
        :aria-selected="selectedKey === style.key"
        @click="selectStyle(style.key)"
      >
        <q-item-section avatar>
          <q-icon :name="style.icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ i18n(`styles.${style.key}`) }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon v-if="selectedKey === style.key" name="check_circle" color="primary" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>
