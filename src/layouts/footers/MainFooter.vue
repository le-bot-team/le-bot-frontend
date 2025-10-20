<script setup lang="ts">
import { useQuasar } from 'quasar';

import { MAIN_NAVIGATIONS } from 'components/navigations';

const { dark } = useQuasar();
</script>

<template>
  <q-footer class="bg-transparent">
    <q-toolbar :class="{ 'text-dark': !dark.isActive}">
      <q-tabs class="full-width" active-color="primary" dense indicator-color="transparent" no-caps>
        <q-route-tab
          v-for="(navigation, index) in MAIN_NAVIGATIONS"
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
