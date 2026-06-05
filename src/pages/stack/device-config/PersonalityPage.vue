<template>
  <q-page class="device-personality-page">
    <section class="device-personality-card">
      <div class="device-personality-row">
        <span>{{ i18n('labels.toggleLabel') }}</span>
        <q-toggle :model-value="enabled" color="accent" @update:model-value="onToggle" />
      </div>
    </section>
    <p class="device-personality-tip">{{ i18n('labels.tip') }}</p>
  </q-page>
</template>

<script setup lang="ts">
// PersonalityPage — design f001e23d (未开启态) + 31e9fabe (开启后跳转到详情).
// Empty-state layout: single white card with one toggle row plus a grey
// hint paragraph. Toggle uses Quasar `color="accent"` which equals the raw
// design token rgba(32,204,249,1) (=$accent in quasar.variables.scss). When
// enabled, it redirects to PersonalityDetailPage for the full config form.
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDeviceStore } from 'stores/device';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.PersonalityPage');
const router = useRouter();
const deviceStore = useDeviceStore();

const enabled = computed<boolean>(
  () => deviceStore.currentDevice?.config?.aiPersonality?.enabled === true,
);

onMounted(() => {
  if (enabled.value) {
    router.replace('/stack/device-config/personality/detail').catch(console.error);
  }
});

function onToggle(v: boolean) {
  if (!v) return;
  const prev = deviceStore.currentDevice?.config?.aiPersonality ?? {};
  deviceStore.updateCurrentDeviceConfig({
    aiPersonality: { ...prev, enabled: true },
  });
  router.push('/stack/device-config/personality/detail').catch(console.error);
}
</script>
