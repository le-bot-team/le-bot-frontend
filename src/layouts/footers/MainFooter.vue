<script setup lang="ts">
import { NAVIGATIONS } from 'components/navigations';
</script>

<template>
  <q-footer>
    <q-toolbar>
      <q-tabs class="full-width" no-caps>
        <q-route-tab
          v-for="(navigation, index) in NAVIGATIONS"
          :key="index"
          :disable="!navigation.available"
          exact
          :icon="navigation.icon"
          :label="navigation.label"
          :to="navigation.route"
        />
      </q-tabs>
    </q-toolbar>
  </q-footer>
</template>

<style scoped></style>
