<script setup lang="ts">
// LegalPage — Generic legal document page (terms of service, user agreement, privacy policy).
// Content will be fetched from backend or loaded from static assets when available.
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const titleMap: Record<string, string> = {
  'terms-of-service': '服务条款',
  'user-agreement': '用户协议',
  'privacy-policy': '隐私政策',
};

const slug = computed(() => {
  const path = route.path;
  const segments = path.split('/');
  return segments[segments.length - 1] || '';
});

const title = computed(() => titleMap[slug.value] || '法律条款');
</script>

<template>
  <q-page class="legal-page">
    <div class="legal-container">
      <h1 class="legal-title">{{ title }}</h1>
      <div class="legal-content">
        <p class="legal-placeholder">内容加载中…</p>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.legal-page {
  min-height: 100vh;
  padding: 16px;
}

.legal-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 0;
}

.legal-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--clr-text, #120e2c);
  margin: 0 0 24px;
}

.legal-content {
  font-size: 15px;
  line-height: 1.6;
  color: var(--clr-text-secondary, #9398a9);
}

.legal-placeholder {
  text-align: center;
  padding: 40px 0;
}
</style>
