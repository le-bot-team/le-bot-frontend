<script setup lang="ts">
import { onMounted } from 'vue';

import { useAuthStore } from 'stores/auth';
import { useSettingsStore } from 'stores/settings';

const { tryResetSendCodeCooldown } = useAuthStore();
const { applyTheme } = useSettingsStore();

onMounted(() => {
  tryResetSendCodeCooldown();
  applyTheme();
});
</script>
<template>
  <router-view />
</template>
