<script setup lang="ts">
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.AboutPage');
</script>

<template>
  <q-page class="column q-gutter-y-lg q-pa-lg">
    <div class="text-center text-h5">
      {{ i18n('labels.companyDescriptionTitle') }}
    </div>
    <div>
      {{ i18n('labels.companyDescription') }}
    </div>
  </q-page>
</template>

<style scoped></style>
