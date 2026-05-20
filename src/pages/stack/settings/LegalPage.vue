<script setup lang="ts">
// LegalPage — Generic legal document page (terms of service, user agreement, privacy policy).
// Routes to the appropriate i18n content based on the URL slug.
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { i18nSubPath } from 'src/utils/common';

const route = useRoute();

const pageKeyMap: Record<string, string> = {
  'terms-of-service': 'TermsOfServicePage',
  'user-agreement': 'UserAgreementPage',
  'privacy-policy': 'PrivacyPolicyPage',
};

const slug = computed(() => {
  const path = route.path;
  const segments = path.split('/');
  return segments[segments.length - 1] || '';
});

const pageKey = computed(() => pageKeyMap[slug.value] || 'TermsOfServicePage');
const i18n = computed(() => i18nSubPath(`pages.stack.settings.${pageKey.value}`));

const title = computed(() => i18n.value('labels.title'));

// Collect content sections dynamically (title1/body1, title2/body2, etc.)
const sections = computed(() => {
  const result: { title: string; body: string }[] = [];
  for (let i = 1; i <= 10; i++) {
    const t = i18n.value(`content.title${i}`);
    const b = i18n.value(`content.body${i}`);
    // i18nSubPath returns the key path if not found
    if (t && !t.includes(`content.title${i}`) && b && !b.includes(`content.body${i}`)) {
      result.push({ title: t, body: b });
    } else {
      break;
    }
  }
  return result;
});
</script>

<template>
  <q-page class="legal-page">
    <div class="legal-container">
      <h1 class="legal-title">{{ title }}</h1>
      <div class="legal-content">
        <template v-for="(section, idx) in sections" :key="idx">
          <h2 class="legal-section-title">{{ section.title }}</h2>
          <p class="legal-section-body">{{ section.body }}</p>
        </template>
        <div v-if="!sections.length" class="legal-placeholder">
          <p>{{ i18n('labels.contentUnavailable') }}</p>
        </div>
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
  color: var(--clr-text-secondary, #666);
}

.legal-section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--clr-text, #120e2c);
  margin: 20px 0 8px;
}

.legal-section-body {
  margin: 0 0 16px;
}

.legal-placeholder {
  text-align: center;
  padding: 40px 0;
  color: var(--clr-text-secondary, #9398a9);
}
</style>
