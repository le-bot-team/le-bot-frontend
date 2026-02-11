<script setup lang="ts">
import { i18nSubPath } from 'src/utils/common';

const modelValue = defineModel<string | undefined>();

const i18n = i18nSubPath('components.auth.PasswordInput');
</script>

<template>
  <q-input
    class="full-width"
    clearable
    counter
    :label="i18n('labels.title')"
    lazy-rules
    type="password"
    outlined
    :rules="[() => !modelValue?.length || i18n('errors.invalidPassword')]"
    v-model="modelValue"
  />
</template>

<style scoped></style>
