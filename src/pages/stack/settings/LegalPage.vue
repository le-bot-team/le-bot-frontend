<script setup lang="ts">
// LegalPage — Generic legal document page (terms of service, user agreement, privacy policy).
// Fetches content from the backend API; falls back to i18n static content on failure.
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { fetchLegalDocument, type LegalDocumentType } from 'src/utils/api/auth';
import { i18nSubPath } from 'src/utils/common';

const route = useRoute();

const pageKeyMap: Record<string, string> = {
  'terms-of-service': 'TermsOfServicePage',
  'user-agreement': 'UserAgreementPage',
  'privacy-policy': 'PrivacyPolicyPage',
};

const slugToDocType: Record<string, LegalDocumentType> = {
  'terms-of-service': 'terms-of-service',
  'user-agreement': 'user-agreement',
  'privacy-policy': 'privacy-policy',
};

const slug = computed(() => {
  const path = route.path;
  const segments = path.split('/');
  return segments[segments.length - 1] || '';
});

const pageKey = computed(() => pageKeyMap[slug.value] || 'TermsOfServicePage');
const i18n = computed(() => i18nSubPath(`pages.stack.settings.${pageKey.value}`));

// API state
const apiTitle = ref<string>('');
const apiSections = ref<{ title: string; body: string }[]>([]);
const isLoading = ref(false);
const hasError = ref(false);

const title = computed(() => apiTitle.value || i18n.value('labels.title'));

// Collect content sections: prefer API data, fallback to i18n
const sections = computed(() => {
  if (apiSections.value.length > 0) {
    return apiSections.value;
  }
  // Fallback to i18n static content
  const result: { title: string; body: string }[] = [];
  for (let i = 1; i <= 10; i++) {
    const t = i18n.value(`content.title${i}`);
    const b = i18n.value(`content.body${i}`);
    if (t && !t.includes(`content.title${i}`) && b && !b.includes(`content.body${i}`)) {
      result.push({ title: t, body: b });
    } else {
      break;
    }
  }
  return result;
});

const loadDocument = async () => {
  const docType = slugToDocType[slug.value];
  if (!docType) return;

  isLoading.value = true;
  hasError.value = false;

  try {
    const lang = navigator.language || 'en';
    const res = await fetchLegalDocument(docType, lang);
    if (res.data?.success) {
      apiTitle.value = res.data.data.title;
      apiSections.value = res.data.data.sections;
    } else {
      hasError.value = true;
      console.warn(`[LegalPage] Failed to fetch ${docType}:`, res.data?.message);
    }
  } catch (err) {
    hasError.value = true;
    console.warn(`[LegalPage] API error for ${docType}:`, err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadDocument);

// Reload when route changes (e.g., navigating between different legal pages)
watch(slug, () => {
  apiTitle.value = '';
  apiSections.value = [];
  void loadDocument();
});
</script>

<template>
  <q-page class="legal-page">
    <div class="legal-container">
      <!-- Loading state -->
      <div v-if="isLoading" class="legal-loading">
        <q-spinner size="32px" color="primary" />
      </div>

      <!-- Content -->
      <template v-else>
        <h1 class="legal-title">{{ title }}</h1>

        <!-- Error notice (non-blocking, content falls back to i18n) -->
        <div v-if="hasError && !sections.length" class="legal-error">
          <p>{{ i18n('labels.contentUnavailable') }}</p>
        </div>

        <div class="legal-content">
          <template v-for="(section, idx) in sections" :key="idx">
            <h2 class="legal-section-title">{{ section.title }}</h2>
            <p class="legal-section-body">{{ section.body }}</p>
          </template>
          <div v-if="!sections.length" class="legal-placeholder">
            <p>{{ i18n('labels.contentUnavailable') }}</p>
          </div>
        </div>
      </template>
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

.legal-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}

.legal-error {
  text-align: center;
  padding: 40px 0;
  color: var(--clr-text-secondary, #9398a9);
}
</style>
