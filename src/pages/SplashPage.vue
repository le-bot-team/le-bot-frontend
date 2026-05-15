<script setup lang="ts">
// SplashPage — brand splash / loading screen.
// Displays logo + slogan + progress bar, auto-redirects to /main/home after 3s.

import { onMounted, ref } from 'vue';

import { router } from 'src/router';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.SplashPage');

const progress = ref(0);

onMounted(() => {
  const interval = setInterval(() => {
    progress.value += 2;
    if (progress.value >= 100) {
      clearInterval(interval);
      router.replace('/main/home').catch(console.error);
    }
  }, 60);
});
</script>

<template>
  <div class="splash-page">
    <img src="~assets/quasar-logo-vertical.svg" alt="LeBot" class="splash-page__logo" />
    <div class="splash-page__slogan">{{ i18n('labels.slogan') }}</div>
    <div class="splash-page__progress-track">
      <div class="splash-page__progress-fill" :style="{ width: `${progress}%` }" />
    </div>
    <div class="splash-page__loading">{{ i18n('labels.loading') }}</div>
  </div>
</template>

<style scoped>
.splash-page__loading {
  font-family: var(--font-family);
  font-size: 12px;
  color: var(--clr-caption);
  margin-top: 12px;
}
</style>
