<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';

import { i18nSubPath } from 'src/utils/common';

const {dark} = useQuasar();
const route = useRoute();
const router = useRouter();

const i18n = i18nSubPath('layouts.headers.StackHeader');
</script>

<template>
  <q-header bordered class="bg-transparent" :class="{
    'text-dark': !dark.isActive
  }">
    <q-toolbar>
      <div class="absolute-left column justify-center full-height q-pl-sm" >
        <q-btn flat icon="arrow_back_ios_new" round @click="router.go(-1)" />
      </div>
      <q-toolbar-title class="text-center">
        {{ i18n(`navigations.${route.name?.toString()}`) }}
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
</template>

<style scoped></style>
