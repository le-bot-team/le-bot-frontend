<script setup lang="ts">
// FeedbackPage — user feedback submission form.

import { useQuasar } from 'quasar';
import { ref } from 'vue';

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.help.FeedbackPage');
const $q = useQuasar();

const content = ref('');
const contact = ref('');
const isSubmitting = ref(false);

async function handleSubmit() {
  if (!content.value.trim()) {
    $q.notify({ type: 'warning', message: i18n('notifications.contentRequired') });
    return;
  }

  isSubmitting.value = true;
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  isSubmitting.value = false;

  $q.notify({ type: 'positive', message: i18n('notifications.submitSuccess') });
  content.value = '';
  contact.value = '';
}
</script>

<template>
  <q-page class="settings-sub-page">
    <div class="settings-sub-page__card q-pa-md">
      <q-input
        v-model="content"
        type="textarea"
        :placeholder="i18n('labels.contentPlaceholder')"
        outlined
        rows="5"
        class="q-mb-md"
      />
      <q-input
        v-model="contact"
        :placeholder="i18n('labels.contactPlaceholder')"
        outlined
        dense
        class="q-mb-md"
      />
      <div class="row items-center q-mb-md" style="color: var(--clr-caption); cursor: pointer">
        <q-icon name="mdi-image-plus" size="24px" class="q-mr-sm" />
        <span style="font-size: 14px">{{ i18n('labels.uploadImage') }}</span>
      </div>
      <button class="btn-max" :disabled="isSubmitting" @click="handleSubmit">
        <q-spinner v-if="isSubmitting" size="20px" color="white" />
        <template v-else>{{ i18n('labels.submit') }}</template>
      </button>
    </div>
  </q-page>
</template>

<style scoped>
.btn-max {
  width: 100%;
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

.btn-max:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
