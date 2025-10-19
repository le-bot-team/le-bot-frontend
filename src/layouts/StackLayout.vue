<script setup lang="ts">
import { useQuasar } from 'quasar';

const { screen } = useQuasar();
</script>

<template>
  <q-layout view="hHh LpR lFf">
    <router-view :mobile="screen.lt.md" name="header" />
    <q-page-container style="height: 100vh">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped></style>
