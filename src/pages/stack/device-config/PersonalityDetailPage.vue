<template>
  <!--
    PersonalityDetailPage — designs 31e9fabe (initial, empty textareas) and
    31c5986a (modify, pre-filled textareas + submit button).
    Delegates UI to shared PersonalityEditor component.
  -->
  <q-page class="device-personality-detail-page">
    <PersonalityEditor
      :enabled="existing?.enabled === true"
      :traits="existing?.traits ?? ''"
      :goals="existing?.goals ?? ''"
      @submit="onSubmit"
      @disable="onDisable"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDeviceStore } from 'stores/device';

import PersonalityEditor from 'components/PersonalityEditor.vue';

const router = useRouter();
const deviceStore = useDeviceStore();

const existing = computed(() => deviceStore.currentDevice?.config?.aiPersonality);

function onSubmit(payload: { enabled: boolean; traits: string; goals: string }) {
  deviceStore.updateCurrentDeviceConfig({
    aiPersonality: payload,
  });
  router.back();
}

function onDisable() {
  const prev = deviceStore.currentDevice?.config?.aiPersonality ?? {};
  deviceStore.updateCurrentDeviceConfig({
    aiPersonality: { ...prev, enabled: false },
  });
  router.replace('/stack/device-config/personality').catch(console.error);
}
</script>
