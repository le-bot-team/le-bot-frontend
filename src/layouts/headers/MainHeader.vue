<script setup lang="ts">
import { bus } from 'boot/bus';
import ThemeButton from 'components/ThemeButton.vue';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('layouts.headers.MainHeader');
</script>

<template>
  <q-header bordered class="bg-primary text-white">
    <q-toolbar>
      <q-btn dense flat icon="menu" round @click="bus.emit('drawer', 'switch', 'left')" />
      <q-toolbar-title>
        <q-avatar>
          <q-img src="favicon.ico" />
          <!--          <q-img src="~assets/logos/light/simple.svg" />-->
        </q-avatar>
        {{ i18n('labels.title') }}
      </q-toolbar-title>
      <theme-button />
      <q-btn dense flat icon="menu" round @click="bus.emit('drawer', 'switch', 'right')" />
    </q-toolbar>
  </q-header>
</template>

<style scoped></style>
